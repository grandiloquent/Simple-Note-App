#ifndef SERVER_H
#define SERVER_H

#include "shared.h";
#include "httplib.h"
#include <nlohmann/json.hpp>
#include <regex>
#include <stdio.h>
#include <filesystem>
#include <fstream>
#include <zipper/zipper.h>
#include "SQLiteWrapper.h"
#include "extractor.h"
using namespace zipper;
namespace fs = std::filesystem;
void StartServer(JNIEnv *env, jobject assetManager, const std::string &host, int port);

#endif
/*
add_library(server SHARED server.cpp)

*/