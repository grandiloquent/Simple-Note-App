cmake_minimum_required(VERSION 3.10.2)
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++2a -fno-rtti -fexceptions -Wall")

set(distribution_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../../../../distribution)

add_library(lib_crypto SHARED IMPORTED)
set_target_properties(lib_crypto PROPERTIES IMPORTED_LOCATION
        ${distribution_DIR}/openssl/lib/arm64-v8a/libcrypto.so)
add_library(lib_ssl SHARED IMPORTED)
set_target_properties(lib_ssl PROPERTIES IMPORTED_LOCATION
        ${distribution_DIR}/openssl/lib/arm64-v8a/libssl.so)

add_library(nativelib SHARED
        nativelib.cpp
        logging.cpp
        cameraEngine.cpp
        cameraManager.cpp
        CameraWrapper.cpp
        imageReader.cpp)

add_library(httplib SHARED httplib.cc)
target_include_directories(httplib PUBLIC
        ${distribution_DIR}/openssl/include/)
target_compile_definitions(httplib PUBLIC CPPHTTPLIB_OPENSSL_SUPPORT)
target_link_libraries(httplib
        lib_crypto
        lib_ssl)

add_library(sqlite3 SHARED sqlite3.c)
add_subdirectory(nlohmann_json)
#add_subdirectory(mbedtls)
#target_include_directories(nativelib PRIVATE mbedtls/include)
add_library(shared SHARED shared.cpp)
target_link_libraries(shared android log)
add_library(extractor SHARED extractor.cpp)
target_link_libraries(extractor httplib nlohmann_json::nlohmann_json shared)

add_subdirectory(zipper)
add_library(server SHARED server.cpp utils.cpp)

target_link_libraries(server httplib shared android sqlite3 nlohmann_json::nlohmann_json extractor Zipper)
target_include_directories(server PRIVATE zipper/zipper)

include_directories(lame)
aux_source_directory(lame SRC_LIST)

add_library( # Sets the name of the library.
        NativeMp3Encoder

        # Sets the library as a shared library.
        SHARED

        NativeMp3Encoder.cpp
        ${SRC_LIST})

target_link_libraries(nativelib
        android
        #        mbedtls
        server
        camera2ndk
        mediandk
        NativeMp3Encoder)
