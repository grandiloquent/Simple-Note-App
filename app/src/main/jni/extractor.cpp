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

                    {"accept",                            R"(text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9)"},
                    {"accept-language",                   R"(en)"},
                    {"cache-control",                     R"(no-cache)"},
                    {"pragma",                            R"(no-cache)"},
                    {"sec-ch-ua",                         R"("Google Chrome";v="95", "Chromium";v="95", ";Not A Brand";v="99")"},
                    {"sec-ch-ua-arch",                    R"("x86")"},
                    {"sec-ch-ua-bitness",                 R"("64")"},
                    {"sec-ch-ua-full-version",            R"("95.0.4638.69")"},
                    {"sec-ch-ua-mobile",                  R"(?0)"},
                    {"sec-ch-ua-model",                   R"("")"},
                    {"sec-ch-ua-platform",                R"("Windows")"},
                    {"sec-ch-ua-platform-version",        R"("10.0.0")"},
                    {"sec-fetch-dest",                    R"(document)"},
                    {"sec-fetch-mode",                    R"(navigate)"},
                    {"sec-fetch-site",                    R"(none)"},
                    {"sec-fetch-user",                    R"(?1)"},
                    {"service-worker-navigation-preload", R"(true)"},
                    {"upgrade-insecure-requests",         R"(1)"},
                    {"user-agent",                        R"(Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36)"}

            })) {
        auto s = res->body;
        s = Substring(s, "<title>", "</title>");
        return s;
    } else {
        return {};
    }
}