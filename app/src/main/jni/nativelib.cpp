#include <jni.h>
#include "httplib.h"
#include "java_interop.h"
#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>

#include <nlohmann/json.hpp>
#include <mbedtls/ssl.h>
#include <mbedtls/ctr_drbg.h>
#include "server.h"
#include <thread>

extern "C"
JNIEXPORT jstring

JNICALL
Java_psycho_euphoria_app_ServerService_startServer(JNIEnv *env, jclass obj, jobject context,
                                                   jobject assetManager,
                                                   jstring ip,
                                                   jint port) {
    const std::string host = jsonparse::jni::Convert<std::string>::from(env, ip);
    StartServer(env, assetManager, host, port);

    char msg[60] = "Hello ";
    jstring result;
    result = env->NewStringUTF(msg);
    return result;
}

extern "C"
JNIEXPORT jboolean

JNICALL
Java_psycho_euphoria_app_MainActivity_request(JNIEnv *env, jclass obj) {

    mbedtls_ssl_context ssl;
    mbedtls_ssl_config conf;
    mbedtls_ctr_drbg_context ctx;

    mbedtls_ssl_init(&ssl);
    mbedtls_ssl_config_init(&conf);
    mbedtls_ctr_drbg_init(&ctx);
    return true;
}