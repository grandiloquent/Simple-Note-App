#include <jni.h>
#include "httplib.h"
#include "java_interop.h"
#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>

#include <nlohmann/json.hpp>
//#include <mbedtls/ssl.h>
//#include <mbedtls/ctr_drbg.h>
#include "server.h"
#include <thread>
#include "cameraEngine.h"
#include "CameraWrapper.h"

cameraEngine *cameraEngine1;
CameraWrapper *wrapper;

void imageReader::imagePreview(jint *image, jint width, jint height) {
    wrapper->drawImage(image, width, height);
}

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

//    mbedtls_ssl_context ssl;
//    mbedtls_ssl_config conf;
//    mbedtls_ctr_drbg_context ctx;
//
//    mbedtls_ssl_init(&ssl);
//    mbedtls_ssl_config_init(&conf);
//    mbedtls_ctr_drbg_init(&ctx);
    return true;
}

extern "C"
JNIEXPORT jstring JNICALL
Java_psycho_euphoria_app_ServerService_dic(JNIEnv *env, jclass clazz, jboolean isChinese,
                                           jstring q) {
    const std::string w = jsonparse::jni::Convert<std::string>::from(env, q);
    auto str = Dic(isChinese, w);
    nlohmann::json js = nlohmann::json::parse(str);

    if (js.contains("newhh")) {
        js = js["newhh"];
        std::stringstream ss;

        if (js["dataList"][0].contains("pinyin"))
            ss << js["dataList"][0]["pinyin"].get<std::string>() << "\n";
        for (auto &explain: js["dataList"][0]["sense"]) {
            ss << explain["def"][0].get<std::string>() << "\n";
        }
        jstring result;
        result = env->NewStringUTF(ss.str().c_str());
        return result;
    } else if (js.contains("ec")) {
        js = js["ec"];
        std::stringstream ss;
        if (js["word"][0].contains("usphone"))
            ss << js["word"][0]["usphone"].get<std::string>() << "\n";
        for (auto &explain: js["word"][0]["trs"]) {
            ss << explain["tr"][0]["l"]["i"][0].get<std::string>() << "\n";
        }
        jstring result;
        result = env->NewStringUTF(ss.str().c_str());
        return result;
    }
    /*
     if (js.contains("errorCode") && js["errorCode"] == "0") {
        if (js.contains("basic")) {
            std::stringstream ss;
            for (auto &explain: js["basic"]["explains"]) {
                ss <<  explain.get<std::string>() << "\n";
            }
            jstring result;
            result = env->NewStringUTF(ss.str().c_str());
            return result;

        }
    }
     */

    return nullptr;
}
extern "C" JNIEXPORT void JNICALL
Java_psycho_euphoria_app_ServerService_openCamera(JNIEnv *env, jclass clazz) {
    //wrapper = new CameraWrapper(env, pInstance);
    uint32_t w = 480;
    uint32_t h = 640;
    DisplayDimension dimension = DisplayDimension(w, h);
    cameraEngine1 = new cameraEngine(&dimension, true);
}

extern "C" JNIEXPORT void JNICALL
Java_psycho_euphoria_app_ServerService_cameraPreview(JNIEnv *env, jobject thiz) {
    cameraEngine1->startPreview(true);

    std::thread prewiewHandler(&CameraWrapper::imageGeting, wrapper, cameraEngine1);
    prewiewHandler.detach();
}

extern "C" JNIEXPORT void JNICALL
Java_psycho_euphoria_app_ServerService_takePhoto(JNIEnv *env, jclass clazz) {
    std::thread photoHandler(&cameraEngine::onTakeImage, cameraEngine1);
    photoHandler.detach();
}

extern "C" JNIEXPORT void JNICALL
Java_psycho_euphoria_app_ServerService_deleteCamera(JNIEnv *env, jclass clazz) {
    if (cameraEngine1) {
        cameraEngine1->deleteCamera();
        cameraEngine1 = nullptr;
    }
}

