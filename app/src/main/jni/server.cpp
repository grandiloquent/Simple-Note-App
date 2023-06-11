#include "server.h"

static const char db_name[] = "/storage/emulated/0/.editor/app.db";
using db = sqlite::Database<db_name>;

void serveFile(const std::filesystem::path &p, httplib::Response &res,
               const std::map<std::string, std::string> t) {
    std::shared_ptr<std::ifstream> fs = std::make_shared<std::ifstream>();
    fs->exceptions(std::ifstream::failbit | std::ifstream::badbit);
    try {
        fs->open(p, std::ios_base::binary);
    } catch (std::system_error &e) {
        res.status = 404;
        return;
    }
    fs->seekg(0, std::ios_base::end);
    auto end = fs->tellg();

    if (end == 0)return;
    fs->seekg(0);
    std::map<std::string, std::string> file_extension_and_mimetype_map;
    auto contentType = httplib::detail::find_content_type(p, t);
    if (contentType == nullptr) {
        contentType = "application/octet-stream";
    }
    res.set_content_provider(static_cast<size_t>(end),
                             contentType,
                             [fs](uint64_t offset,
                                  uint64_t length,
                                  httplib::DataSink &sink) {
                                 if (fs->fail()) {
                                     return false;
                                 }
                                 fs->seekg(offset, std::ios_base::beg);
                                 size_t bufSize = 81920;
                                 char buffer[bufSize];

                                 try {
                                     fs->read(buffer, bufSize);
                                 } catch (std::system_error &e) {
                                 }
                                 sink.write(buffer,
                                            static_cast<size_t>(fs->gcount()));
                                 return true;
                             });
}

void StartServer(JNIEnv *env, jobject assetManager, const std::string &host, int port) {
    AAssetManager *mgr = AAssetManager_fromJava(env, assetManager);
    std::map<std::string, std::string> m{};
    std::map<std::string, std::string> t{};
    httplib::Server server;
    server.Get(R"(/(.+\.(?:js|css|html|png|jpg|jpeg|gif|svg))?)",
               [&m, &t, mgr](const httplib::Request &req, httplib::Response &res) {
                   if (!req.get_header_value("Referer").empty()) {
                       auto referer = req.get_header_value("Referer");
                       std::filesystem::path p(
                               SubstringAfterLast(httplib::detail::decode_url(referer, true), "="));
                       p = p.parent_path();
                       p = p.append(req.path.substr(1));
                       if (fs::exists(p)) {
                           serveFile(p, res, t);
                           return;
                       }
                   }

                   auto p = req.path == "/" ? "index.html" : req.path.substr(1);
                   auto str = m[p];

                   if (str.empty()) {
                       unsigned char *data;
                       unsigned int len = 0;
                       ReadBytesAsset(mgr, p,
                                      &data, &len);
                       str = std::string(reinterpret_cast<const char *>(data), len);
                       m[p] = str;
                   }
                   auto content_type = httplib::detail::find_content_type(p, t);
                   res.set_content(str, content_type);
               });
    server.Get("/notes", [](const httplib::Request &req, httplib::Response &res) {

        static const char query[]
                = R"(SELECT id,title,update_at FROM note WHERE start = 0 ORDER BY update_at DESC)";
        db::QueryResult fetch_row = db::query<query>();
        std::string_view id, title, update_at;

        nlohmann::json doc = nlohmann::json::array();
        while (fetch_row(id, title, update_at)) {
            nlohmann::json j = {

                    {"id",        id},
                    {"title",     title},
                    {"update_at", update_at},

            };
            doc.push_back(j);
        }
        res.set_content(doc.dump(), "application/json");
    });
    server.Get("/todo/list", [](const httplib::Request &req, httplib::Response &res) {

        static const char query[]
                = R"(SELECT id,title,start,status,update_at FROM note WHERE start > 0 ORDER BY update_at DESC)";
        db::QueryResult fetch_row = db::query<query>();
        std::string_view id, title, start, status, update_at;

        nlohmann::json doc = nlohmann::json::array();
        while (fetch_row(id, title, start, status, update_at)) {
            nlohmann::json j = {
                    {"id",        id},
                    {"title",     title},
                    {"start",     start},
                    {"status",    status},
                    {"update_at", update_at},
            };
            doc.push_back(j);
        }
        res.set_content(doc.dump(), "application/json");
    });
    server.Get("/search", [](const httplib::Request &req, httplib::Response &res) {
        auto q = req.get_param_value("q");
        static const char query[]
                = R"(SELECT id,title,content,update_at FROM note WHERE start = 0 ORDER BY update_at DESC)";
        db::QueryResult fetch_row = db::query<query>();
        std::string id, title, content, update_at;

        nlohmann::json doc = nlohmann::json::array();
        std::regex q_regex(q);
        while (fetch_row(id, title, content, update_at)) {
            if (std::regex_search(title, q_regex) || std::regex_search(content, q_regex)) {
                nlohmann::json j = {

                        {"id",        id},
                        {"title",     title},
                        {"update_at", update_at},

                };
                doc.push_back(j);
            }

        }
        res.set_content(doc.dump(), "application/json");
    });
    server.Get("/note", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto id = req.get_param_value("id");
        static const char query[]
                = R"(select title, content, start, status, create_at, update_at from note WHERE id = ?1)";
        db::QueryResult fetch_row = db::query<query>(id);
        std::string_view title, content, start, status, create_at, update_at;

        if (fetch_row(title, content, start, status, create_at, update_at)) {
            nlohmann::json j = {
                    {"title",     title},
                    {"content",   content},
                    {"start",     start},
                    {"status",    status},
                    {"create_at", create_at},
                    {"update_at", update_at},
            };
            res.set_content(j.dump(), "application/json");
        }
    });
    server.Post("/note", [](const httplib::Request &req, httplib::Response &res,
                            const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });
        nlohmann::json doc = nlohmann::json::parse(body);
        std::string title = doc["title"];
        std::string content;
        if (doc.contains("content")) {
            content = doc["content"];
        }
        int start = 0;
        if (doc.contains("start")) {
            start = doc["start"];
        }
        int status = 0;
        if (doc.contains("status")) {
            status = doc["status"];
        }
        if (doc.contains("id") && doc["id"] > 0) {
            int id = doc["id"];
            static const char query[]
                    = R"(UPDATE note SET title=coalesce(?1,title),content=coalesce(?2,content),start=?3,status=?4,update_at=?5 where id =?6)";
            db::QueryResult fetch_row = db::query<query>(title,
                                                         content,
                                                         start,
                                                         status,
                                                         GetTimeStamp(),
                                                         id
            );
            res.set_content(std::to_string(fetch_row.resultCode()),
                            "text/plain; charset=UTF-8");
        } else {
            static const char query[]
                    = R"(INSERT INTO note (title,content,start,status,create_at,update_at) VALUES(?1,?2,?3,?4,?5,?6))";
            db::QueryResult fetch_row = db::query<query>(title,
                                                         content,
                                                         start,
                                                         status,
                                                         GetTimeStamp(),
                                                         GetTimeStamp()
            );
            res.set_content(std::to_string(fetch_row.resultCode()),
                            "text/plain; charset=UTF-8");
        }
    });
    server.Get("/extract", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto url = req.get_param_value("url");
        auto response = Tiktok(url);
        res.set_content(response, "application/json");
    });
    server.Get("/su", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto cmd = req.get_param_value("cmd");
        std::string s{"su -c "};
        FILE *pipeFP = popen((s + cmd).c_str(), "r");
        std::string buffer;
        if (pipeFP != nullptr) {
            char buf[BUFSIZ];
            while (fgets(buf, BUFSIZ, pipeFP) !=
                   nullptr) {
                buffer += buf;
            }
            pclose(pipeFP);
        }
        res.set_content(buffer, "text/plain");
    });
    server.Get("/zip", [](const httplib::Request &req, httplib::Response &res) {
        auto path = req.get_param_value("path");
        std::vector<unsigned char> zip_vect;
        Zipper zipper(zip_vect);
        for (const fs::directory_entry &dir_entry:
                fs::recursive_directory_iterator(path)) {
            if (dir_entry.is_regular_file()) {
                std::ifstream input(dir_entry.path());
                zipper.add(input, dir_entry.path().string().substr(path.length() + 1));
            }

        }
        zipper.close();
        res.set_content(reinterpret_cast<char *>(zip_vect.data()), zip_vect.size(),
                        "application/zip");
    });
    server.Post("/picture", [&](const auto &req, auto &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        // auto size = req.files.size();
        //auto ret = req.has_file("images");
        const auto &image_file = req.get_file_value("images");
        auto dir = "/storage/emulated/0/.editor/images";
        if (!fs::is_directory(dir))
            fs::create_directory(dir);
        std::string image{dir};
        image.append("/");
        image.append(image_file.filename.c_str());
        int count = 1;
        while (fs::exists(image)) {
            image = dir;
            image.append("/");
            image.append(std::to_string(count));
            image.append(".");
            image.append(SubstringAfterLast(image_file.filename, "."));
            count++;
        }
        std::ofstream ofs(image, std::ios::binary);
        ofs << image_file.content;
        res.set_content(SubstringAfterLast(image, "/"), "text/plain");
    });
    server.Get(R"(/images/([a-zA-Z0-9-]+.(?:png|jpg|svg|jpeg|gif))?)",
               [&](const httplib::Request &req, httplib::Response &res) {
                   fs::path p{"/storage/emulated/0/.editor"};
                   p.append(req.path.substr(1));
                   serveFile(p, res, t);
               }
    );
    server.Get("/trans", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto q = req.get_param_value("q");
        auto to = req.get_param_value("to");
        auto s = Trans(q, to);
        res.set_content(s, "application/json");
    });
    server.Get("/title", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto q = req.get_param_value("path");
        auto s = Title(q);
        res.set_content(s, "text/plain");
    });
    server.Get("/file",
               [&t](const httplib::Request &req, httplib::Response &res) {
                   res.set_header("Access-Control-Allow-Origin", "*");
                   auto path = req.get_param_value("path");

                   if (!path.ends_with(".html")) {
                       std::string value{"attachment; filename=\""};
                       value.append(SubstringAfterLast(path, "/"));
                       value.append("\"");
                       res.set_header("Content-Disposition", value);
                   }

                   std::filesystem::path p(httplib::detail::decode_url(path, true));
                   serveFile(p, res, t);
               });
    server.Get("/files",
               [](const httplib::Request &req, httplib::Response &res) {
                   res.set_header("Access-Control-Allow-Origin", "*");
                   auto path = req.get_param_value("path");
                   std::filesystem::path p(httplib::detail::decode_url(path, true));
                   nlohmann::json doc = nlohmann::json::array();
                   for (auto const &dir: std::filesystem::directory_iterator{p}) {
                       nlohmann::json j = {

                               {"path",          dir.path().string()},
                               {"isDirectory",   dir.is_directory()},
                               {"lastWriteTime", std::chrono::duration_cast<std::chrono::seconds>(
                                       dir.last_write_time().time_since_epoch()).count()
                               },
                               {
                                "length",        dir.is_directory() ? 0 : dir.file_size()
                               }
                       };
                       doc.push_back(j);
                   }
                   res.set_content(doc.dump(), "application/json");
               });
    server.Post("/file/delete", [](const httplib::Request &req, httplib::Response &res,
                                   const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });
        nlohmann::json doc = nlohmann::json::parse(body);
        for (const auto &i: doc) {
            fs::remove_all(i);
        }
    });

    server.Post("/upload", [&](const auto &req, auto &res) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string f{req.get_file_value("path").content};
        std::ofstream ofs(f, std::ios::binary);
        ofs << req.get_file_value("file").content;
        res.set_content("Success", "text/plain");
    });
    server.listen(host, port);
}

// https://github.com/yhirose/cpp-httplib