#ifndef EXTRACTOR_H
#define EXTRACTOR_H
#include <string>
#include <sstream>
#include "shared.h"
#include "httplib.h"

std::string Tiktok(const std::string &q);
std::string Trans(const std::string &q, const std::string &to);
std::string Title(const std::string &q);
std::string Dic(const std::string &q);
#endif
/*
add_library(extractor SHARED extractor.cpp)
target_link_libraries(extractor)
#include "extractor.h";
*/