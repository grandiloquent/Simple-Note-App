#include "extractor.h";

std::string Tiktok(const std::string &q) {
    httplib::SSLClient cli("www.tikwm.com", 443);
    cli.enable_server_certificate_verification(false);
    if (auto res = cli.Get(
            "/api/?count=12&cursor=0&web=1&hd=1&url=" + EncodeUrl(q),
            {{"Accept",       "application/json, text/javascript, */*; q=0.01"},
             {"Content-Type", "application/x-www-form-urlencoded; charset=UTF-8"},
             {"sec-ch-ua",
                              R"("Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104")"},
             {"User-Agent",
                              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                              "(KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"}})) {

        return res->body;
    } else {
        return {};
    }
}

std::string Trans(const std::string &q, const std::string &to) {
    httplib::Client cli("translate.google.com", 80);
    std::stringstream ss;
    ss << "/translate_a/single?client=gtx&sl=auto&tl=";
    ss << to;
    ss << "&dt=t&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=";
    ss << EncodeUrl(q);
    if (auto res = cli.Get(
            ss.str(),
            {{"User-Agent",
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"}})) {

        return res->body;
    } else {
        return {};
    }
}

std::string Title(const std::string &q) {
    auto host = Substring(q, "://", "/");
    auto query = SubstringAfterLast(q, host);

    httplib::SSLClient cli(host, 443);
    cli.enable_server_certificate_verification(false);
    if (auto res = cli.Get(
            query,
            {
                    {"User-Agent",
                     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                     "(KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"}})) {
        auto s = res->body;
        s = Substring(s, "<title>", "</title>");
        return s;
    } else {
        return {};
    }
}