#include "extractor.h";
#include <openssl/md5.h>

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

static const char HEX_ARRAY[] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                                 'A', 'B', 'C', 'D', 'E', 'F'};

static std::string hash(const char *buf) {
    unsigned char md5_buf[33];
    MD5_CTX md5_ctx;
    MD5_Init(&md5_ctx);
    MD5_Update(&md5_ctx, buf, strlen(buf));
    unsigned char digest[16];
    MD5_Final(digest, &md5_ctx);
    for (int i = 0, j = 0; i < 16; i++) {
        uint8_t t = digest[i];
        md5_buf[j++] = HEX_ARRAY[t / 16];
        md5_buf[j++] = HEX_ARRAY[t % 16];
    }

    md5_buf[32] = 0;
    std::string str(reinterpret_cast<char *>(md5_buf));
    return str;
}

static std::string buildPayload(const std::string &s, int salt) {

    std::stringstream ss;
//    ss << "4da34b556074bc9f"
//       << s << salt << "Wt5i6HHltTGFAQgSUgofeWdFZyDxKwOy";
    ss << "4da34b556074bc9f"
       << s << salt << salt << "Wt5i6HHltTGFAQgSUgofeWdFZyDxKwOy";
    return ss.str();
}

std::string sha256(const std::string str) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, str.c_str(), str.size());
    SHA256_Final(hash, &sha256);
    std::stringstream ss;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int) hash[i];
    }
    return ss.str();
}
// https://github.com/creatcode/api/blob/master/YoudaoDic.md

std::string Dic(bool isChinese, const std::string &q) {


    httplib::Client cli("dict.youdao.com", 80);
    std::stringstream ss;

    if (isChinese) {
        ss
                << "/jsonapi?xmlVersion=5.1&client=&dicts=%7B%22count%22%3A99%2C%22dicts%22%3A%5B%5B%22newhh%22%5D%5D%7D&keyfrom=&model=&mid=&imei=&vendor=&screen=&ssid=&network=5g&abtest=&jsonversion=2&q="
                << q;
    } else {
        ss
                << "/jsonapi?xmlVersion=5.1&client=&dicts=%7B%22count%22%3A99%2C%22dicts%22%3A%5B%5B%22ec%22%5D%5D%7D&keyfrom=&model=&mid=&imei=&vendor=&screen=&ssid=&network=5g&abtest=&jsonversion=2&q="
                << q;
    }

    if (auto res = cli.Get(ss.str(),
                           {{"User-Agent",
                             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                             "(KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"}})) {
        return res->body;
    } else {
        return {};
    }
    /*
     auto s = q;//httplib::detail::encode_url(q);
    int salt = time(NULL);
    auto payload = buildPayload(s, salt);
    auto sign = hash(payload.c_str());

    httplib::Client cli("openapi.youdao.com", 80);
    std::stringstream ss;

    ss << "/api?q=" << s << "&salt=" << salt << "&sign=" << sign
       << "&appKey=4da34b556074bc9f"<<(isChinese?"&from=zh-CHS&to=zh-CHS&dicts=yw":"&from=EN&to=zh-CHS");

    LOGE("%s", ss.str().c_str());
    if (auto res = cli.Get(
            ss.str(),
            {{"User-Agent",
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"}})) {

        return res->body;
    } else {
        return {};
    }
     */
}

std::string Hy(const std::string &q) {


    auto host = Substring(q, "://", "/");
    auto query = SubstringAfterLast(q, host);
    httplib::SSLClient cli(SubstringBeforeLast(host, ":"),
                           std::atoi(SubstringAfterLast(host, ":").c_str()));
    cli.enable_server_certificate_verification(false);
    if (auto res = cli.Get(
            query,
            httplib::Headers{})) {
        auto s = res->body;
        s = Substring(s, "sl: \"", "\"");
        return s;
    } else {
        return {};
    }
}


std::string Weather(const std::string &province, const std::string &city) {
    httplib::SSLClient cli("wis.qq.com", 443);
    cli.enable_server_certificate_verification(false);

    std::stringstream ss;
    ss
            << "/weather/common?source=pc&weather_type=observe%7Cforecast_1h%7Cforecast_24h%7Calarm&province=";
    ss << EncodeUrl(province);
    ss << "&city=";
    ss << EncodeUrl(city);
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

