#include "server.h"
#include "unzipper.h"
#include "utils.h"

static const char db_name[] = "/storage/emulated/0/.editor/app.db";
using db = sqlite::Database<db_name>;

void serveFile(const std::filesystem::path &p, httplib::Response &res,
               const std::map<std::string, std::string> t) {

    if (p.extension().string() == ".html" || p.extension().string() == ".xhtml") {
        auto s = ReadAllText(p);
        s = ReplaceFirst(
                s, "</head>",
                R"(<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>)");
        s = ReplaceFirst(s, "</body>", R"(<script>
(() => {
    const headers = [...document.querySelectorAll('h1,h2,h3')];
    const buffers = [];
    let index = 0;
    headers.forEach(h => {
        const id = `header_id_${index++}`;
        h.id = id;
        buffers.push(`<a href="#${id}">${h.textContent}</a>`)
    });

    document.body.insertAdjacentHTML('afterbegin', `<div style="display:flex;flex-direction:column">${buffers.join('\n')}</div>`);
document.body.addEventListener('click', function (event) {
  // filter out clicks on any other elements
  if ((event.target.nodeName == 'A'||event.target.parentNode.nodeName == 'A'||event.target.parentNode.parentNode.nodeName == 'A') && (!event.target.getAttribute('href')||!event.target.getAttribute('href').startsWith("#header"))  ) {
//console.log(event.target.getAttribute('href'),);
    event.preventDefault();
  }
});
})()
</script>)");
        res.set_content(s, "text/html");
        return;
    }
    if (p.filename().string().ends_with("style.css")) {
        res.set_content(R"(
* {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
}
a,em,.programs{
 word-break: break-all;
    word-wrap: break-word;
}

body {
    font-family: wf_segoe-ui_normal, HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, sans-serif;
    font-size: 14px;
    line-height: 1.42857143;
    color: #333;
    background-color: #fff;
    text-rendering: optimizeLegibility;
}

h1,
h2,
h3,
h4,
h5,
h6 {
    font-family: inherit;
    font-weight: 500;
    line-height: 1.1;
    color: inherit;
}

h1,
h2,
h3 {
    margin-top: 20px;
    margin-bottom: 10px;
}

h1 {
    font-size: 36px;
}

h2 {
    font-size: 30px;
}

.h3,
h3 {
    font-size: 24px;
}

h1,
h2,
h3 {
    font-family: wf_segoe-ui_light, wf_segoe-ui_semilight, wf_segoe-ui_normal, HelveticaNeue-Thin, HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, sans-serif;
}

a {
    background-color: transparent;
}

a {
    color: #0072be;
    text-decoration: none;
}

a:active,
a:hover {
    outline: 0;
}

a:focus,
a:hover {
    color: #23527c;
    text-decoration: underline;
}

a:focus,
a:hover {
    text-decoration: underline;
}

p {
    margin: 0 0 10px;
}

b,
strong {
    font-weight: 700;
}

ol,
ul {
    margin-top: 0;
    margin-bottom: 10px;
}

img {
    border: 0;
}

img {
    vertical-align: middle;
}

img {
    max-width: 100%;
	height:auto;
}

code,
kbd,
pre,
samp,.programs ,.programs-b {
    font-family: monospace, monospace;
    font-size: 1em;
}

code,
kbd,
pre,
samp ,.programs ,.programs-b {
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
}

code ,.EmphasisFontCategoryNonProportional,.programs,.programs-b {
    padding: 2px 4px;
    font-size: 90%;
    color: #c7254e;
    background-color: #f9f2f4;
    border-radius: 4px;
}

pre,.ProgramCode {
    display: block;
    padding: 9.5px;
    margin: 0 0 10px;
    font-size: 13px;
    line-height: 1.42857143;
    color: #333;
    word-break: break-all;
    word-wrap: break-word;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 4px;
	white-space: pre-wrap;
}

pre code {
    padding: 0;
    font-size: inherit;
    color: inherit;
    white-space: pre-wrap;
    background-color: transparent;
    border-radius: 0;
}

table {
    border-spacing: 0;
    border-collapse: collapse;
}

table {
    background-color: transparent;
}

.table {
    width: 100%;
    max-width: 100%;
    margin-bottom: 20px;
}

td,
th {
    padding: 0;
}

th {
    text-align: left;
}

.table>tbody>tr>td,
.table>tbody>tr>th,
.table>tfoot>tr>td,
.table>tfoot>tr>th,
.table>thead>tr>td,
.table>thead>tr>th {
    padding: 8px;
    line-height: 1.42857143;
    vertical-align: top;
    border-top: 1px solid #ddd;
}

.table>thead>tr>th {
    vertical-align: bottom;
    border-bottom: 2px solid #ddd;
}

.table>caption+thead>tr:first-child>td,
.table>caption+thead>tr:first-child>th,
.table>colgroup+thead>tr:first-child>td,
.table>colgroup+thead>tr:first-child>th,
.table>thead:first-child>tr:first-child>td,
.table>thead:first-child>tr:first-child>th {
    border-top: 0;
}

.table>tbody>tr:nth-of-type(odd) {
    background-color: #f9f9f9;
}
.source-code {
    font-family: Menlo, Monaco, Consolas, 'Courier New', monospace !important;
    padding: 0;
    margin: 0;
    font-size: 13px;
	color: #c7254e;
    background-color: #f9f2f4;
}
)", "text/css");
        return;
    }
    if (p.extension().string() == ".ncx") {
        auto s = ReadAllText(p);
        s = s + R"(
<style>
    navmap,navpoint {
        display: flex;
        flex-direction: column;
    }
</style>
<script>
    const searchParams = new URL(window.location).searchParams;
    document.querySelectorAll('navPoint')
        .forEach(x => {
            x.addEventListener('click', evt => {
evt.stopPropagation();
               let src = evt.currentTarget.querySelector('content').getAttribute('src');
                let p = searchParams.get('path');
                let index = p.lastIndexOf('/');
                p = p.substring(0, index);
 index = src.lastIndexOf('#');
if(index!==-1)
               src=src.substring(0, index);
                p = p + "/" + src;
                window.open(`?path=${encodeURIComponent(p)}`, '_blank');
            })
        })
</script>)";

        res.set_content(s, "text/html");
        return;
    }
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

    if (end == 0)
        return;
    fs->seekg(0);
    std::map<std::string, std::string> file_extension_and_mimetype_map;
    auto contentType = httplib::detail::find_content_type(p, t);
    if (contentType == nullptr) {
        contentType = "application/octet-stream";
    }
    res.set_content_provider(
            static_cast<size_t>(end), contentType,
            [fs](uint64_t offset, uint64_t length, httplib::DataSink &sink) {
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
                sink.write(buffer, static_cast<size_t>(fs->gcount()));
                return true;
            });
}

std::vector<std::string> split(const std::string &s,
                               const std::string &delimiter) {
    size_t pos_start = 0, pos_end, delim_len = delimiter.length();
    std::string token;
    std::vector<std::string> res;

    while ((pos_end = s.find(delimiter, pos_start)) != std::string::npos) {
        token = s.substr(pos_start, pos_end - pos_start);
        pos_start = pos_end + delim_len;
        res.push_back(token);
    }

    res.push_back(s.substr(pos_start));
    return res;
}

std::string join(const std::vector<std::string> &lst,
                 const std::string &delim) {
    std::string ret;
    for (const auto &s: lst) {
        if (!ret.empty())
            ret += delim;
        ret += s;
    }
    return ret;
}

void mergeSubtitles(const std::string &dir) {
    std::regex re("\\.(?:srt)$");
    std::regex find(
            R"(\s*\d+[\r\n]+(\d{2}:){2}\d{2},\d{3} --> (\d{2}:){2}\d{2},\d{3}[\r\n]+)");
    std::vector<std::string> fileBuf;

    std::vector<std::string> tocBuf;
    auto index = 0;
    for (auto const &dir_entry: std::filesystem::directory_iterator{dir}) {
        if (dir_entry.is_regular_file() &&
            std::regex_search(dir_entry.path().filename().string().c_str(), re)) {
            std::cout << dir_entry.path() << '\n';
            std::ifstream in(dir_entry.path());
            std::string content((std::istreambuf_iterator<char>(in)),
                                (std::istreambuf_iterator<char>()));
            content = std::regex_replace(content, find, "");
            std::vector<std::string> v = split(content, ".");
            std::vector<std::string> buf;
            std::stringstream ss;
            ss << "<h2 ";
            ss << "id=\"index";
            ss << index;
            ss << "\">";
            ss << dir_entry.path().stem().string();
            ss << "</h2>";
            buf.push_back(ss.str());
            ss = std::stringstream();
            ss << "<li><a ";
            ss << "href=\"#index";
            ss << index++;
            ss << "\">";
            ss << dir_entry.path().stem().string();
            ss << "</a></li>";
            tocBuf.push_back(ss.str());
            ss = std::stringstream();
            for (const auto &i: v) {
                ss << "<div>";
                ss << i;
                ss << ".</div>";
                buf.push_back(ss.str());
                ss = std::stringstream();
            }
            buf.emplace_back("</div>");
            fileBuf.push_back(join(buf, ""));
        }
    }

    std::ofstream out(R"(C:\Users\Administrator\Desktop\source.html)",
                      std::ios::out | std::ios::trunc);
    out << R"(<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>文档</title>
</head>

<body>
<ul>
)";
    out << join(tocBuf, "");
    out << "</ul>";
    out << join(fileBuf, "");
    out << R"(</body>
</html>)";
    out.close();
}

static void serveTextContent(const httplib::Request &req,
                             httplib::Response &res) {}

void StartServer(JNIEnv *env, jobject assetManager, const std::string &host,
                 int port) {
    static const char table[] = R"(CREATE TABLE IF NOT EXISTS "note" (
	"id"	INTEGER NOT NULL UNIQUE,
	"title"	TEXT,
	"content"	TEXT,
	"start"	INTEGER,
	"status"	INTEGER,
	"create_at"	INTEGER,
	"update_at"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
))";
    db::query<table>();
    AAssetManager *mgr = AAssetManager_fromJava(env, assetManager);
    std::map<std::string, std::string> t{};
    httplib::Server server;
/*
 CREATE TABLE "note" (
	"id"	INTEGER NOT NULL UNIQUE,
	"title"	TEXT,
	"content"	TEXT,
	"start"	INTEGER,
	"status"	INTEGER,
	"create_at"	INTEGER,
	"update_at"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
)
 CREATE TABLE IF NOT EXISTS "favorite" (
	"id"	INTEGER NOT NULL UNIQUE,
	"path"	TEXT NOT NULL UNIQUE,
	"create_at"	INTEGER,
	"update_at"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
)
 */
    //    server.Get(R"(^/images/([a-zA-Z0-9-]+.(?:png|jpg|svg|jpeg|gif))?$)",
    //               [&](const httplib::Request &req, httplib::Response &res) {
    //                   res.set_header("Access-Control-Allow-Origin", "*");
    //
    //                   auto file = FindFile(req);
    //
    //                   if (is_regular_file(file)) {
    //                       serveFile(file, res, t);
    //                       return;
    //                   }
    //
    //               }
    //    );
    /*
     CREATE TABLE IF NOT EXISTS "snippet" (
            "id"	INTEGER,
            "content"	TEXT,
            PRIMARY KEY("id" AUTOINCREMENT)
     */
    //    static const char contentTableSql[]
    //            = R"(ALTER TABLE snippet ADD COLUMN keyword TEXT)";
    //       db::QueryResult fetch_row = db::query<contentTableSql>();

    jclass jclass1 = static_cast<jclass>(
            env->NewGlobalRef(env->FindClass("psycho/euphoria/app/ImageUitls")));
    JavaVM *jvm;
    env->GetJavaVM(&jvm);
    server.Post("/file/write",
                [](const httplib::Request &req, httplib::Response &res,
                   const httplib::ContentReader &content_reader) {
                    res.set_header("Access-Control-Allow-Origin", "*");

                    std::string body;
                    content_reader([&](const char *data, size_t data_length) {
                        body.append(data, data_length);
                        return true;
                    });
                    auto path = req.get_param_value("path");
                    std::ofstream wf(path, std::ios::out | std::ios::binary);
                    if (!wf) {
                        res.status = 500;
                        return;
                    }
                    wf.write(body.c_str(), body.size());
                    res.set_content("Success", "text/plain; charset=UTF-8");
                });
    server.Get(
            R"(/(.+\.(?:js|css|html|xhtml|ttf|png|jpg|jpeg|gif|json|svg|wasm|ncx))?)",
            [&t, mgr, env, jclass1, jvm](const httplib::Request &req,
                                         httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                auto p = req.path == "/" ? "index.html" : req.path.substr(1);
                if (!p.ends_with(".html")) {
                    auto file = FindFile(req);
                    if (is_regular_file(file)) {
                        serveFile(file, res, t);
                        return;
                    }
                }

                auto str = std::string{}; // m[p];

                if (str.empty()) {
                    //                       if (p.ends_with("files.html")) {
                    //
                    //                           if
                    //                           (jvm->AttachCurrentThread(reinterpret_cast<JNIEnv
                    //                           **>((void **) &env),
                    //                                                        NULL) != 0){
                    //                               return;
                    //                           }
                    //                           jmethodID jmethodId =
                    //                           env->GetStaticMethodID(jclass1,
                    //                           "combineImages",
                    //                                                                        "()V");
                    //                           env->CallStaticVoidMethod(jclass1,
                    //                           jmethodId);
                    //                       }
                    unsigned char *data;
                    unsigned int len = 0;
                    ReadBytesAsset(mgr, p, &data, &len);
                    str = std::string(reinterpret_cast<const char *>(data), len);
                    // m[p] = str;
                }
                if (str.length() == 0 && p.ends_with(".html")) {
                    auto file = FindFile(req);
                    res.status = 302;
                    res.set_header("location",
                                   SubstringBeforeLast(req.path, "/") +
                                   "/file?path=" + EncodeUrl(file.string()));
                    return;
                }
                auto content_type = httplib::detail::find_content_type(p, t);
                res.set_content(str, content_type);
            });
    server.Get("/notes", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        static const char query[] =
                R"(SELECT id,title,update_at FROM note WHERE start = 0 ORDER BY update_at DESC)";
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
    server.Get("/codes", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");

        auto q = req.get_param_value("q");
        auto all = req.get_param_value("all");
        if (q.empty()) {
            static const char query[] =
                    R"(SELECT id,title,update_at FROM code ORDER BY update_at DESC limit 100)";
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

        } else if (!all.empty()) {
            // ORDER BY update_at DESC

            static const char queryv[] =
                    R"(SELECT id,title,content,update_at FROM code)";
            db::QueryResult fetch_row_v = db::query<queryv>();
            std::string_view id, title, content, update_at;

            nlohmann::json doc = nlohmann::json::array();
            std::regex q_regex(q);
            while (fetch_row_v(id, title, content, update_at)) {
                if (std::regex_search(std::string{title}, q_regex) ||
                    std::regex_search(std::string{content}, q_regex)) {
                    nlohmann::json j = {

                            {"id",        id},
                            {"title",     title},
                            {"update_at", update_at},

                    };
                    doc.push_back(j);
                }
            }
            res.set_content(doc.dump(), "application/json");
        } else {

            static const char queryv[] =
                    R"(SELECT id,title,update_at FROM code ORDER BY update_at DESC)";
            db::QueryResult fetch_row_v = db::query<queryv>();
            std::string_view id, title, update_at;

            nlohmann::json doc = nlohmann::json::array();
            std::regex q_regex(q);
            while (fetch_row_v(id, title, update_at)) {
                if (std::regex_search(std::string{title}, q_regex)) {
                    nlohmann::json j = {

                            {"id",        id},
                            {"title",     title},
                            {"update_at", update_at},

                    };
                    doc.push_back(j);
                }
            }
            res.set_content(doc.dump(), "application/json");
        }
    });
    server.Get("/snippets",
               [](const httplib::Request &req, httplib::Response &res) {
                   res.set_header("Access-Control-Allow-Origin", "*");
                   static const char query[] =
                           R"(SELECT content,keyword,id FROM snippet ORDER BY views)";
                   db::QueryResult fetch_row = db::query<query>();
                   std::string_view content, keyword, id;
                   nlohmann::json doc = nlohmann::json::array();
                   while (fetch_row(content, keyword, id)) {
                       nlohmann::json j = {
                               {"content", content},
                               {"keyword", keyword},
                               {"id",      id}};
                       doc.push_back(j);
                   }
                   res.set_content(doc.dump(), "application/json");
               });
    server.Get(
            "/snippet", [](const httplib::Request &req, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                auto k = req.get_param_value("k");
                static const char query[] =
                        R"(SELECT content FROM snippet where keyword = ?1)";
                db::QueryResult fetch_row = db::query<query>(k);
                std::string_view content;
                if (fetch_row(content)) {
                    res.set_content(content.data(), content.size(), "application/json");
                }
            });

    server.Post("/snippet", [](const httplib::Request &req,
                               httplib::Response &res,
                               const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });
        nlohmann::json doc = nlohmann::json::parse(body);
        std::string keyword;
        if (doc.contains("keyword")) {
            keyword = doc["keyword"];
        }
        std::string content;
        if (doc.contains("content")) {
            content = doc["content"];
        }
        int id = 0;
        if (doc.contains("id")) {
            id = doc["id"];
        }
        if (id == 0) {
            static const char query[] =
                    R"(INSERT INTO snippet (content,keyword) VALUES(?1,?2))";
            db::QueryResult fetch_row = db::query<query>(content, keyword);

            res.set_content(std::to_string(fetch_row.resultCode()),
                            "text/plain; charset=UTF-8");
        } else {
            static const char query[] =
                    R"(UPDATE snippet SET content=coalesce(NULLIF(?1,''),content),keyword=coalesce(NULLIF(?2,''),keyword) where id =?3)";
            db::QueryResult fetch_row = db::query<query>(content, keyword, id);

            res.set_content(std::to_string(fetch_row.resultCode()),
                            "text/plain; charset=UTF-8");
        }
    });
    server.Post(
            "/snippet/delete", [](const httplib::Request &req, httplib::Response &res,
                                  const httplib::ContentReader &content_reader) {
                res.set_header("Access-Control-Allow-Origin", "*");

                std::string body;
                content_reader([&](const char *data, size_t data_length) {
                    body.append(data, data_length);
                    return true;
                });
                static const char query[] = R"(DELETE FROM snippet WHERE content = ?1)";
                db::QueryResult fetch_row = db::query<query>(body);

                res.set_content(std::to_string(fetch_row.resultCode()),
                                "text/plain; charset=UTF-8");
            });
    server.Post("/snippet/hit", [](const httplib::Request &req,
                                   httplib::Response &res,
                                   const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });
        static const char query[] =
                R"(UPDATE snippet SET views = COALESCE(views,0) + 1 WHERE content = ?1)";
        db::QueryResult fetch_row = db::query<query>(body);

        res.set_content(std::to_string(fetch_row.resultCode()),
                        "text/plain; charset=UTF-8");
    });

    server.Get("/code", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto id = req.get_param_value("id");
        static const char query[] =
                R"(select title, content, create_at, update_at from code WHERE id = ?1)";
        db::QueryResult fetch_row = db::query<query>(id);
        std::string_view title, content, create_at, update_at;

        if (fetch_row(title, content, create_at, update_at)) {
            nlohmann::json j = {
                    {"title",     title},
                    {"content",   content},
                    {"create_at", create_at},
                    {"update_at", update_at},
            };

            res.set_content(j.dump(), "application/json");
        }
    });
    server.Get("/code/random",
               [](const httplib::Request &req, httplib::Response &res) {
                   res.set_header("Access-Control-Allow-Origin", "*");
                   auto q = req.get_param_value("q");
                   auto o = req.get_param_value("o");
                   static const char query[] =
                           R"(select id,title from code ORDER BY update_at DESC)";
                   db::QueryResult fetch_row = db::query<query>(

                   );
                   // OFFSETo.empty() ? 0 : atoi(o.c_str())
                   std::string_view id, title;
                   std::regex c("[\u4e00-\u9fa5]+");
                   while (fetch_row(id, title)) {

                       if (q.empty()) {
                           if (!std::regex_search(title.data(), c)) {
                               res.set_content(id.data(), id.size(), "text/plain");
                               return;
                           }
                       } else {
                           if ((title == q)) {
                               res.set_content(id.data(), id.size(), "text/plain");
                               return;
                           }
                       }
                   }
                   static const char query_r[] =
                           R"(select id,title from code ORDER BY random() LIMIT 1)";
                   db::QueryResult fetch_row_r = db::query<query_r>();
                   if (fetch_row_r(id, title)) {
                       res.set_content(id.data(), id.size(), "text/plain");
                   }
                   /*
                    static const char query[]
                           = R"(select id,title from code ORDER BY random() LIMIT
                   1)"; db::QueryResult fetch_row = db::query<query>();
                   std::string_view id, title;
                   std::regex c("[\\u4e00-\\u9fa5]+");
                   int count = 10;
                   while (count > 0) {
                       if (fetch_row(id, title)) {
                           if (!std::regex_search(title.data(), c)) {
                               res.set_content(id.data(), id.size(),
                   "application/json"); return;
                           }
                       }
                       count--;
                   }
                   if (fetch_row(id, title)) {
                       res.set_content(id.data(), id.size(), "application/json");
                   }
                    */
               });

    server.Get(
            "/viewer", [](const httplib::Request &req, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                auto id = req.get_param_value("id");
                static const char query[] = R"(select content from code WHERE id = ?1)";
                db::QueryResult fetch_row = db::query<query>(id);
                std::string content;
                if (fetch_row(content)) {

                    if (content.find("three.js") != std::string::npos) {
                        //                auto sv = SubstringBeforeLast(content,
                        //                std::string{
                        //                        "document.body.innerHTML =
                        //                        [...arguments].map(x =>
                        //                        `<span>${JSON.stringify(x).replaceAll(/\\\\n/g,
                        //                        \"<br>\")}</span>`).join('\\n');"});
                        //                sv += R"(const div =
                        //                document.createElement("div");
                        //    div.innerHTML = [...arguments].map(x =>
                        //    `<span>${JSON.stringify(x).replaceAll(/\\n/g,
                        //    "<br>")}</span>`).join('\n'); document.body.appendChild(div);
                        //)" + SubstringAfterLast(content, std::string{
                        //                        "document.body.innerHTML =
                        //                        [...arguments].map(x =>
                        //                        `<span>${JSON.stringify(x).replaceAll(/\\\\n/g,
                        //                        \"<br>\")}</span>`).join('\\n');"});
                        //
                        //                content = sv;
                        std::string s{R"(<html lang='en'>
<head>
<meta charset="UTF-8">
  <meta name='viewport' content='width=device-width, initial-scale=1.0' />
</head>
<body>
<script>
    document.addEventListener('keydown', evt => {
        if (evt.key === 'F2') {
            evt.preventDefault();
            location.href = '?id=' + parseInt(new URL(window.location.href).searchParams.get('id') - 1);
        }
    })

const id = new URL(window.location).searchParams.get('id');
const div = document.createElement("div");
div.style.display = "flex";
div.style.position = 'fixed';
div.style.left = "0";
div.style.right = "0";
div.style.bottom = "0";
div.style.height = "48px";
div.style.textAlign = "center";
div.style.alignItems = "center";
const b1 = document.createElement("div");
b1.innerHTML = "练习";
b1.style.flexGrow = "1";
div.appendChild(b1);
const b2 = document.createElement("div");
b2.innerHTML = "有问题"
b2.style.flexGrow = "1";
div.appendChild(b2);

const b3 = document.createElement("div");
b3.innerHTML = "高耗";
b3.style.flexGrow = "1";
div.appendChild(b3);

b1.addEventListener("click", async evt => {
    let res;
    try {

        res = await fetch(`/code`, {
            method: 'POST',
            body: JSON.stringify({
                id: parseInt(id),
                title: "WebGL 练习"
            }),
            cache: "no-store"
        });
        if (res.status !== 200) {

        }
    } catch (error) {
    }
    try {
        const response = await fetch(`/code/random`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.text();
        window.location.href = `?id=${results}`
    } catch (error) {
        console.log(error);
    }
});
b2.addEventListener("click", async evt => {
    let res;
    try {

        res = await fetch(`/code`, {
            method: 'POST',
            body: JSON.stringify({
                id: parseInt(id),
                title: "有问题"
            }),
            cache: "no-store"
        });
        if (res.status !== 200) {

        }
    } catch (error) {
    }
    try {
        const response = await fetch(`/code/random`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.text();
        window.location.href = `?id=${results}`
    } catch (error) {
        console.log(error);
    }
});
b3.addEventListener("click", async evt => {
    let res;
    try {

        res = await fetch(`/code`, {
            method: 'POST',
            body: JSON.stringify({
                id: parseInt(id),
                title: "高耗"
            }),
            cache: "no-store"
        });
        if (res.status !== 200) {

        }
    } catch (error) {
    }
    try {
        const response = await fetch(`/code/random`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.text();
        window.location.href = `?id=${results}`
    } catch (error) {
        console.log(error);
    }
});
document.body.appendChild(div);

document.addEventListener('keydown', evt => {
    if (evt.key === 'F3') {
        evt.preventDefault();
        b1.click();
    } else if (evt.key === "F4") {
        evt.preventDefault();
        b2.click();
    }
})


</script>
<script id="vs" type="x-shader/x-vertex">varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
     </script>
)"};
                        res.set_content(s + content.data() + R"(

</body>
</html>)",
                                        "text/html");
                    } else {

                        std::string s{R"(<html lang='en'>
<head>
<meta charset="UTF-8">
  <meta name='viewport' content='width=device-width, initial-scale=1.0' />
</head>
<body>
<script>
    document.addEventListener('keydown', evt => {
        if (evt.key === 'F2') {
            evt.preventDefault();
            location.href = '?id=' + parseInt(new URL(window.location.href).searchParams.get('id') - 1);
        }
    })

const id = new URL(window.location).searchParams.get('id');
const div = document.createElement("div");
div.style.display = "flex";
div.style.position = 'fixed';
div.style.left = "0";
div.style.right = "0";
div.style.bottom = "0";
div.style.height = "48px";
div.style.textAlign = "center";
div.style.alignItems = "center";
const b1 = document.createElement("div");
b1.innerHTML = "练习";
b1.style.flexGrow = "1";
div.appendChild(b1);
const b2 = document.createElement("div");
b2.innerHTML = "有问题"
b2.style.flexGrow = "1";
div.appendChild(b2);

const b3 = document.createElement("div");
b3.innerHTML = "高耗";
b3.style.flexGrow = "1";
div.appendChild(b3);

b1.addEventListener("click", async evt => {
    let res;
    try {

        res = await fetch(`/code`, {
            method: 'POST',
            body: JSON.stringify({
                id: parseInt(id),
                title: "WebGL 练习"
            }),
            cache: "no-store"
        });
        if (res.status !== 200) {

        }
    } catch (error) {
    }
    try {
        const response = await fetch(`/code/random`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.text();
        window.location.href = `?id=${results}`
    } catch (error) {
        console.log(error);
    }
});
b2.addEventListener("click", async evt => {
    let res;
    try {

        res = await fetch(`/code`, {
            method: 'POST',
            body: JSON.stringify({
                id: parseInt(id),
                title: "有问题"
            }),
            cache: "no-store"
        });
        if (res.status !== 200) {

        }
    } catch (error) {
    }
    try {
        const response = await fetch(`/code/random`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.text();
        window.location.href = `?id=${results}`
    } catch (error) {
        console.log(error);
    }
});
b3.addEventListener("click", async evt => {
    let res;
    try {

        res = await fetch(`/code`, {
            method: 'POST',
            body: JSON.stringify({
                id: parseInt(id),
                title: "高耗"
            }),
            cache: "no-store"
        });
        if (res.status !== 200) {

        }
    } catch (error) {
    }
    try {
        const response = await fetch(`/code/random`);
        if (response.status > 399 || response.status < 200) {
            throw new Error(`${response.status}: ${response.statusText}`)
        }
        const results = await response.text();
        window.location.href = `?id=${results}`
    } catch (error) {
        console.log(error);
    }
});
document.body.appendChild(div);


document.addEventListener('keydown', evt => {
    if (evt.key === 'F3') {
        evt.preventDefault();
        b1.click();
    } else if (evt.key === "F4") {
        evt.preventDefault();
        b2.click();
    }
})



</script>
<script id="vs" type="x-shader/x-vertex">#version 300 es
in vec4 a_position;
     void main() {
       gl_Position = a_position;
     }
     </script>
)"};
                        res.set_content(s + content.data() + R"(

</body>
</html>)",
                                        "text/html");
                    }
                }
            });

    server.Post("/code", [](const httplib::Request &req, httplib::Response &res,
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
        int id = 0;
        bool isUpdate = doc.contains("id") && doc["id"] > -1;
        if (isUpdate) {
            id = doc["id"];
            static const char queryw[] = R"(SELECT id from code where id = ?1)";
            db::QueryResult fetch_w = db::query<queryw>(id);
            std::string_view idw;
            if (!fetch_w(idw)) {
                isUpdate = false;
            }
        }

        if (isUpdate) {

            static const char query[] =
                    R"(UPDATE code SET title=coalesce(?1,title),content=coalesce(NULLIF(?2,''),content),update_at=?3 where id =?4)";
            db::QueryResult fetch_row =
                    db::query<query>(title, content, GetTimeStamp(), id);
            res.set_content(std::to_string(fetch_row.resultCode()),
                            "text/plain; charset=UTF-8");
        } else {
            if (id == 0) {
                static const char query[] =
                        R"(INSERT INTO code (title,content,create_at,update_at) VALUES(?1,?2,?3,?4))";

                db::QueryResult fetch_row =
                        db::query<query>(title, content, GetTimeStamp(), GetTimeStamp());
                static const char queryv[] = R"(SELECT last_insert_rowid())";
                db::QueryResult fetch_id = db::query<queryv>();
                std::string_view idv;
                if (fetch_id(idv)) {
                    res.set_content(idv.data(), idv.size(), "text/plain; charset=UTF-8");
                } else
                    res.set_content(std::to_string(fetch_row.resultCode()),
                                    "text/plain; charset=UTF-8");
            } else {
                static const char query[] =
                        R"(INSERT INTO code (id,title,content,create_at,update_at) VALUES(?1,?2,?3,?4,?5))";
                db::QueryResult fetch_row = db::query<query>(
                        id, title, content, GetTimeStamp(), GetTimeStamp());
                static const char queryv[] = R"(SELECT last_insert_rowid())";
                db::QueryResult fetch_id = db::query<queryv>();
                std::string_view idv;
                if (fetch_id(idv)) {
                    res.set_content(idv.data(), idv.size(), "text/plain; charset=UTF-8");
                } else
                    res.set_content(std::to_string(fetch_row.resultCode()),
                                    "text/plain; charset=UTF-8");
            }
        }
    });

    server.Post("/codes", [](const httplib::Request &req, httplib::Response &res,
                             const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });
        nlohmann::json doc = nlohmann::json::parse(body);
        for (auto &d: doc) {
            static const char query[] =
                    R"(INSERT INTO code (title,content,create_at,update_at) VALUES(?1,?2,?3,?4))";
            db::QueryResult fetch_row = db::query<query>(
                    "WebGL Three.js Babylon.js", d.get<std::string>().c_str(),
                    GetTimeStamp(), GetTimeStamp());
        }
        res.set_content("OK", "text/plain; charset=UTF-8");
    });
    server.Get("/fav/list", [](const httplib::Request &req,
                               httplib::Response &res) {
        static const char query[] = R"(SELECT path FROM favorite ORDER BY path)";
        db::QueryResult fetch_row = db::query<query>();
        std::string_view path;

        nlohmann::json doc = nlohmann::json::array();
        while (fetch_row(path)) {
            doc.push_back(path);
        }
        res.set_content(doc.dump(), "application/json");
    });
    server.Get("/todo/list", [](const httplib::Request &req,
                                httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        static const char query[] =
                R"(SELECT id,title,start,status,update_at FROM note WHERE start > 0 ORDER BY update_at DESC)";
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
    server.Get("/search", [](const httplib::Request &req,
                             httplib::Response &res) {
        auto q = req.get_param_value("q");
        static const char query[] =
                R"(SELECT id,title,content,update_at FROM note WHERE start = 0 ORDER BY update_at DESC)";
        db::QueryResult fetch_row = db::query<query>();
        std::string id, title, content, update_at;

        nlohmann::json doc = nlohmann::json::array();
        std::regex q_regex(q);
        while (fetch_row(id, title, content, update_at)) {
            if (std::regex_search(title, q_regex) ||
                std::regex_search(content, q_regex)) {
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
        static const char query[] =
                R"(select title, content, start, status, create_at, update_at from note WHERE id = ?1)";
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
    server.Get("/an", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        static const char query[] = R"(select content from content WHERE id = 1)";
        db::QueryResult fetch_row = db::query<query>();
        std::string_view content;

        if (fetch_row(content)) {

            res.set_content(content.data(), content.size(), "text/plain");
        }
    });
    server.Post("/an", [](const httplib::Request &req, httplib::Response &res,
                          const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });

        static const char query[] =
                R"(INSERT OR REPLACE INTO content (id, content,update_at) VALUES (1,?1,?2))";
        db::QueryResult fetch_row = db::query<query>(body, GetTimeStamp());
        res.set_content(std::to_string(fetch_row.resultCode()),
                        "text/plain; charset=UTF-8");
    });
    server.Get("/pn", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        static const char query[] = R"(select content from content WHERE id = 2)";
        db::QueryResult fetch_row = db::query<query>();
        std::string_view content;

        if (fetch_row(content)) {

            res.set_content(content.data(), content.size(), "text/plain");
        }
    });
    server.Post("/pn", [](const httplib::Request &req, httplib::Response &res,
                          const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });

        static const char query[] =
                R"(INSERT OR REPLACE INTO content (id, content,update_at) VALUES (2,?1,?2))";
        db::QueryResult fetch_row = db::query<query>(body, GetTimeStamp());
        res.set_content(std::to_string(fetch_row.resultCode()),
                        "text/plain; charset=UTF-8");
    });
    server.Get("/ts", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        static const char query[] = R"(select content from content WHERE id = 15
)";
        db::QueryResult fetch_row = db::query<query>();
        std::string_view content;

        if (fetch_row(content)) {

            res.set_content(content.data(), content.size(), "text/plain");
        }
    });
    server.Post("/ts", [](const httplib::Request &req, httplib::Response &res,
                          const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });

        static const char query[] =
                R"(INSERT OR REPLACE INTO content (id, content,update_at) VALUES (15,?1,?2))";
        db::QueryResult fetch_row = db::query<query>(body, GetTimeStamp());
        res.set_content(std::to_string(fetch_row.resultCode()),
                        "text/plain; charset=UTF-8");
    });
    server.Get("/fn", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        static const char query[] = R"(select content from content WHERE id = 4)";
        db::QueryResult fetch_row = db::query<query>();
        std::string_view content;

        if (fetch_row(content)) {

            res.set_content(content.data(), content.size(), "text/plain");
        }
    });
    server.Post("/fn", [](const httplib::Request &req, httplib::Response &res,
                          const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });

        static const char query[] =
                R"(INSERT OR REPLACE INTO content (id, content,update_at) VALUES (4,?1,?2))";
        db::QueryResult fetch_row = db::query<query>(body, GetTimeStamp());
        res.set_content(std::to_string(fetch_row.resultCode()),
                        "text/plain; charset=UTF-8");
    });

    server.Get("/jn", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        static const char query[] = R"(select content from content WHERE id = 5)";
        db::QueryResult fetch_row = db::query<query>();
        std::string_view content;

        if (fetch_row(content)) {

            res.set_content(content.data(), content.size(), "text/plain");
        }
    });
    server.Post("/jn", [](const httplib::Request &req, httplib::Response &res,
                          const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });

        static const char query[] =
                R"(INSERT OR REPLACE INTO content (id, content,update_at) VALUES (5,?1,?2))";
        db::QueryResult fetch_row = db::query<query>(body, GetTimeStamp());
        res.set_content(std::to_string(fetch_row.resultCode()),
                        "text/plain; charset=UTF-8");
    });
    server.Get("/animate/js", [](const httplib::Request &req,
                                 httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        static const char query[] = R"(select content from content WHERE id = 5)";
        db::QueryResult fetch_row = db::query<query>();
        std::string_view o;

        fetch_row(o);

        res.set_content(o.data(), o.size(), "text/html");
    });

    server.Get("/animate/shader", [](const httplib::Request &req,
                                     httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        static const char query[] = R"(select content from content WHERE id = 3)";
        db::QueryResult fetch_row = db::query<query>();
        std::string_view vertex;

        if (!fetch_row(vertex)) {

            vertex = R"(void main() {
            gl_Position = vec4( position, 1.0 );
        })";
        }

        static const char query1[] = R"(select content from content WHERE id = 4)";
        db::QueryResult fetch_fragment = db::query<query1>();
        std::string_view fragment;

        if (!fetch_fragment(fragment)) {

            fragment = "";
            // res.set_content(content.data(), content.size(), "text/plain");
        }
        std::stringstream ss;
        ss << R"(<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shader</title>
    <style>
        body {
            margin: 0
        }
    </style>
</head>

<body>
    <div id="container"></div>
    <script src="https://fastly.jsdelivr.net/npm/three-js@79.0.0/three.js"></script>
    <script id="vertexShader" type="x-shader/x-vertex">)";
        ss << vertex;
        ss << R"(</script>
    <script id="fragmentShader" type="x-shader/x-fragment">)";
        ss << fragment;
        ss << R"(</script>
    <script>
        var container;
        var camera, scene, renderer, clock;
        var uniforms;

        init();
        animate();

        function init() {
            container = document.getElementById('container');

            camera = new THREE.Camera();
            camera.position.z = 1;

            scene = new THREE.Scene();
            clock = new THREE.Clock();

            var geometry = new THREE.PlaneBufferGeometry(2, 2);

            uniforms = {
                u_time: { type: "f", value: 1.0 },
                u_resolution: { type: "v2", value: new THREE.Vector2() },
                u_mouse: { type: "v2", value: new THREE.Vector2() }
            };

            var material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: document.getElementById('vertexShader').textContent,
                fragmentShader: document.getElementById('fragmentShader').textContent
            });

            var mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);

            renderer = new THREE.WebGLRenderer();
            renderer.setPixelRatio(window.devicePixelRatio);

            container.appendChild(renderer.domElement);

            onWindowResize();
            window.addEventListener('resize', onWindowResize, false);

            document.onmousemove = function (e) {
                uniforms.u_mouse.value.x = e.pageX
                uniforms.u_mouse.value.y = e.pageY
            }
        }

        function onWindowResize(event) {
            renderer.setSize(window.innerWidth, window.innerHeight);
            uniforms.u_resolution.value.x = renderer.domElement.width;
            uniforms.u_resolution.value.y = renderer.domElement.height;
        }

        function animate() {
            requestAnimationFrame(animate);
            render();
        }

        function render() {
            uniforms.u_time.value += clock.getDelta();
            renderer.render(scene, camera);
        }
    </script>
</body>

</html>)";
        auto o = ss.str();
        res.set_content(o.data(), o.size(), "text/html");
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
            static const char query[] =
                    R"(UPDATE note SET title=coalesce(?1,title),content=coalesce(?2,content),start=?3,status=?4,update_at=?5 where id =?6)";
            db::QueryResult fetch_row =
                    db::query<query>(title, content, start, status, GetTimeStamp(), id);
            res.set_content(std::to_string(fetch_row.resultCode()),
                            "text/plain; charset=UTF-8");
        } else {
            static const char query[] =
                    R"(INSERT INTO note (title,content,start,status,create_at,update_at) VALUES(?1,?2,?3,?4,?5,?6))";
            db::QueryResult fetch_row = db::query<query>(
                    title, content, start, status, GetTimeStamp(), GetTimeStamp());
            res.set_content(std::to_string(fetch_row.resultCode()),
                            "text/plain; charset=UTF-8");
        }
    });
    server.Get("/fav/insert", [](const httplib::Request &req,
                                 httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto path = req.get_param_value("path");

        static const char query[] =
                R"(insert into favorite (path,create_at,update_at) values(?1,?2,?3))";
        db::QueryResult fetch_row =
                db::query<query>(path, GetTimeStamp(), GetTimeStamp());
        res.set_content(std::to_string(fetch_row.resultCode()),
                        "text/plain; charset=UTF-8");
    });
    server.Get(
            "/fav/delete", [](const httplib::Request &req, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                auto path = req.get_param_value("path");

                static const char query[] = R"(delete from favorite where path = ?1)";
                db::QueryResult fetch_row = db::query<query>(path);
                res.set_content(std::to_string(fetch_row.resultCode()),
                                "text/plain; charset=UTF-8");
            });
    server.Get("/extract",
               [](const httplib::Request &req, httplib::Response &res) {
                   res.set_header("Access-Control-Allow-Origin", "*");
                   auto url = req.get_param_value("url");
                   std::string response;
                   if (url.find("hy11646.com") != std::string::npos) {
                       response = Hy(url);
                   } else {
                       response = Tiktok(url);
                   }
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
            while (fgets(buf, BUFSIZ, pipeFP) != nullptr) {
                buffer += buf;
            }
            pclose(pipeFP);
        }
        res.set_content(buffer, "text/plain");
    });
    server.Get("/zip", [](const httplib::Request &req, httplib::Response &res) {
        auto path = std::filesystem::path{req.get_param_value("path")};
        if (is_directory(path)) {
            Zipper zipper(path.parent_path().string() + "/" +
                          path.filename().string() + ".epub");
            auto length = path.string().length() + 1;
            for (const fs::directory_entry &dir_entry:
                    fs::recursive_directory_iterator(path)) {
                if (dir_entry.is_regular_file()) {
                    std::ifstream input(dir_entry.path());
                    zipper.add(input, dir_entry.path().string().substr(length));
                }
            }
            zipper.close();
        }
        //        std::vector<unsigned char> zip_vect;
        //        Zipper zipper(zip_vect);
        //        for (const fs::directory_entry &dir_entry:
        //                fs::recursive_directory_iterator(path)) {
        //            if (dir_entry.is_regular_file()) {
        //                std::ifstream input(dir_entry.path());
        //                zipper.add(input,
        //                dir_entry.path().string().substr(path.length() + 1));
        //            }
        //
        //        }

        //        res.set_content(reinterpret_cast<char *>(zip_vect.data()),
        //        zip_vect.size(),
        //                        "application/zip");
    });
    server.Post("/kill", [](const httplib::Request &req, httplib::Response &res,
                            const httplib::ContentReader &content_reader) {
        res.set_header("Access-Control-Allow-Origin", "*");
        std::string arr[] = {

        };
        std::string body;
        content_reader([&](const char *data, size_t data_length) {
            body.append(data, data_length);
            return true;
        });
        nlohmann::json doc = nlohmann::json::parse(body);
        auto j = doc.size();
        for (int i = 0; i < j; i++) {
            std::string s{"su -c am force-stop "};
            FILE *pipeFP = popen((s + to_string(doc.at(i))).c_str(), "r");
            std::string buffer;
            if (pipeFP != nullptr) {
                char buf[BUFSIZ];
                while (fgets(buf, BUFSIZ, pipeFP) != nullptr) {
                    buffer += buf;
                }
                pclose(pipeFP);
            }
        }

        res.set_content("Ok", "text/plain");
    });
    // 解压压缩文件
    server.Get("/unzip", [](const httplib::Request &req, httplib::Response &res) {
        auto path = req.get_param_value("path");
        // 创建存放解压文件的目录
        auto dir = fs::path{SubstringBeforeLast(path, ".")};
        if (!fs::exists(dir)) {
            fs::create_directory(dir);
        }
        // 初始化解压对象
        Unzipper unzipper(path);
        bool result = unzipper.extract(dir);
        if (result) {
            fs::remove(path);
        }
        unzipper.close();
        res.set_content("Success", "text/plain");
    });
    server.Post("/picture", [&](const auto &req, auto &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        // auto size = req.files.size();
        // auto ret = req.has_file("images");
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

    server.Get("/trans", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto q = req.get_param_value("q");
        auto to = req.get_param_value("to");
        auto s = Trans(q, to);
        res.set_content(s, "application/json");
    });
    server.Get("/cc", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto q = req.get_param_value("q");
        auto s = Dic(true, q);
        res.set_content(s, "application/json");
    });
    server.Get("/ec", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto q = req.get_param_value("q");
        auto s = Ec(q);
        res.set_content(s, "application/json");
    });
    server.Get("/title", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto q = req.get_param_value("path");
        auto s = Title(q);
        res.set_content(s, "text/plain");
    });

    server.Get(
            "/file", [&t](const httplib::Request &req, httplib::Response &res) {
                res.set_header("Access-Control-Allow-Origin", "*");
                auto path = req.get_param_value("path");

                if (!path.ends_with(".html") && !path.ends_with(".xhtml") &&
                    !path.ends_with(".ncx")) {
                    std::string value{"attachment; filename=\""};
                    value.append(SubstringAfterLast(path, "/"));
                    value.append("\"");
                    res.set_header("Content-Disposition", value);
                }

                std::filesystem::path p(httplib::detail::decode_url(path, false));
                serveFile(p, res, t);
            });
    server.Get("/tidy", [&t](const httplib::Request &req,
                             httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto path = std::filesystem::path{req.get_param_value("path")};
        if (is_directory(path)) {
            for (const fs::directory_entry &dir_entry:
                    fs::directory_iterator(path)) {
                if (dir_entry.is_regular_file()) {
                    auto s = dir_entry.path().extension().string();
                    auto w = std::filesystem::path{path.string()};
                    std::transform(s.begin(), s.end(), s.begin(), [](unsigned char c) {
                        return static_cast<char>(std::toupper(c));
                    });
                    w /= s;
                    if (!is_directory(w)) {
                        std::filesystem::create_directory(w);
                    }
                    w /= dir_entry.path().filename();
                    if (!is_regular_file(w)) {
                        std::filesystem::rename(dir_entry.path(), w);
                    }
                }
            }
        };
    });
    server.Get("/files", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto path = req.get_param_value("path");
        std::filesystem::path p(httplib::detail::decode_url(path, false));
        nlohmann::json doc = nlohmann::json::array();
        for (auto const &dir: std::filesystem::directory_iterator{p}) {
            nlohmann::json j = {

                    {"path",          dir.path().string()},
                    {"isDirectory",   dir.is_directory()},
                    {"lastWriteTime", std::chrono::duration_cast<std::chrono::seconds>(
                            dir.last_write_time().time_since_epoch())
                                              .count()},
                    {"length",        dir.is_directory() ? 0 : dir.file_size()}};
            doc.push_back(j);
        }
        res.set_content(doc.

                                dump(),

                        "application/json");
    });
    server.Post("/file/delete",
                [](const httplib::Request &req, httplib::Response &res,
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
    server.Post("/file/move",
                [](const httplib::Request &req, httplib::Response &res,
                   const httplib::ContentReader &content_reader) {
                    res.set_header("Access-Control-Allow-Origin", "*");

                    std::string body;
                    content_reader([&](const char *data, size_t data_length) {
                        body.append(data, data_length);
                        return true;
                    });
                    nlohmann::json doc = nlohmann::json::parse(body);
                    auto dst = req.get_param_value("dst");
                    for (const auto &i: doc) {
                        fs::path d{dst};
                        d = d.append(SubstringAfterLast(i, "/"));
                        fs::rename(i, d);
                    }
                });
    server.Get("/file/rename",
               [](const httplib::Request &req, httplib::Response &res) {
                   res.set_header("Access-Control-Allow-Origin", "*");
                   auto path = req.get_param_value("path");
                   auto dst = req.get_param_value("dst");
                   fs::rename(path, dst);
               });
    server.Get("/file/new_file",
               [](const httplib::Request &req, httplib::Response &res) {
                   res.set_header("Access-Control-Allow-Origin", "*");
                   auto path = req.get_param_value("path");
                   if (!fs::exists(path))
                       std::ofstream f(path);
               });
    server.Get("/file/new_dir",
               [](const httplib::Request &req, httplib::Response &res) {
                   res.set_header("Access-Control-Allow-Origin", "*");
                   auto path = req.get_param_value("path");
                   if (!fs::exists(path))
                       fs::create_directory(path);
               });
    server.Get("/weather",
               [](const httplib::Request &req, httplib::Response &res) {
                   res.set_header("Access-Control-Allow-Origin", "*");
                   auto province = req.get_param_value("province");
                   auto city = req.get_param_value("city");

                   res.set_content(Weather(province, city), "application/json");
               });

    server.Post("/upload", [&](const auto &req, auto &res) {
        res.set_header("Access-Control-Allow-Origin", "*");

        std::string f{req.get_file_value("path").content};
        std::ofstream ofs(f, std::ios::binary);
        ofs << req.get_file_value("file").content;
        res.set_content("Success", "text/plain");
    });
    server.Get("/recycle",
               [](const httplib::Request &req, httplib::Response &res) {
                   res.set_header("Access-Control-Allow-Origin", "*");
                   auto path = req.get_param_value("path");
                   std::filesystem::path p(httplib::detail::decode_url(path, true));
                   auto parent = p.parent_path();
                   for (const fs::directory_entry &dir_entry:
                           fs::recursive_directory_iterator(parent)) {
                       if (dir_entry.is_regular_file() && (dir_entry.path().extension() == ".mp4" ||
                                                           dir_entry.path().extension() == ".mov" ||
                                                           dir_entry.path().extension() == ".MOV" ||
                                                           dir_entry.path().extension() ==
                                                           ".MP4")) {
                           std::filesystem::path s = dir_entry.path();
                           fs::rename(dir_entry.path(), s.replace_extension("v"));
                       }
                   }
                   parent = parent.append("recycle");
                   if (!fs::exists(parent)) {
                       fs::create_directory(parent);
                   }
                   fs::rename(p, parent.append(p.filename().string()));
               });

    server.Get("/lift", [](const httplib::Request &req, httplib::Response &res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        auto path = req.get_param_value("path");
        std::filesystem::path p(httplib::detail::decode_url(path, false));
        //auto parent = p.parent_path();
        for (const fs::directory_entry &dir_entry:
                fs::recursive_directory_iterator(p)) {
            if (dir_entry.is_regular_file() && (dir_entry.path().extension() == ".mp4")) {
                std::filesystem::path s = dir_entry.path();

                if (s.parent_path() == p) {
                    continue;
                }
                fs::path pp{p};
                std::filesystem::path n = pp.append("0.mp4");
                for (int i = 1; i < 1000; ++i) {
                    if (fs::exists(n)) {
                        pp = fs::path{p};
                        n = pp.append(std::to_string(i) + ".mp4");
                    } else {
                        break;
                    }
                }
                fs::rename(s, n);
            }
        }
        for (const fs::directory_entry &dir_entry:
                fs::directory_iterator(p)) {
            if (dir_entry.is_directory()) {

                fs::remove_all(dir_entry.path());
            }
        }
    });
    server.listen(host, port);
}

// https://github.com/yhirose/cpp-httplib
