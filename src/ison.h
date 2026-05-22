#pragma once

#include <iostream>

constexpr char POSITIVE_MARKER = '.';
constexpr char NEGATIVE_MARKER = '!';
constexpr char STRING_MARKER = '~';
constexpr int MAX_ISON_LENGTH = 13;

int64_t decode_int(char *input);
void encode_int(int64_t value, char* resultIson);

