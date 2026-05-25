#include "./men.h"
#include <stdexcept>
#include <cstdint>
#include <string.h>

void encode_int64(int64_t value, char* result_men) {

    if(value >= 0) result_men[0] = POSITIVE_MARKER;
	else if(value < 0) {
		result_men[0] = NEGATIVE_MARKER;
		value = ~value;
	}

	if(value == 0) {		// Which means the value == 0 or value == -1
		result_men[1] = '\0';
		return;
	}
	
	int men_index = 1;

    // Set starting point.
    int leading = __builtin_clzll(value) + 2;
    int shift_index = 60 - ((leading / 6) * 6);

    // Encoding.
    for(; shift_index >= 0; shift_index -= 6)
		result_men[men_index++] = base64url_encode_table[((value >> shift_index) & 0x3F)];
	
	result_men[men_index] = '\0';
}

void encode_float64(double value, char* result_men) {
	result_men[0] = FLOAT64_MARKER;

	int64_t bits;
	memcpy(&bits, &value, sizeof(bits));

	int men_index = 1;

	int trailing = __builtin_ctzll(bits);
	int shift_until = ((trailing / 6) * 6);

	for(int shift_index = 60; shift_index >= shift_until; shift_index -= 6) {
		result_men[men_index++] = base64url_encode_table[((bits >> shift_index) & 0x3F)];
	}
	
	result_men[men_index] = '\0';
}

int64_t decode_int64(char* input) {
    int64_t result = 0;

    for(std::size_t i = 1; input[i] != '\0'; i++) {
        unsigned char v = base64url_decode_table[(unsigned char)input[i]];
        if(v == 0xFF) throw std::invalid_argument("Invalid character exists in the string");   // Invalid character input. Returns an error.

        result <<= 6;
        result |= v;
    }
    if(input[0] == NEGATIVE_MARKER) result = ~result;

    return result;
}

double decode_float64(char* input) {
	int64_t bits = 0;
	int index = 1;

	for(; input[index] != '\0'; index++) {
		unsigned char v = base64url_decode_table[(unsigned char)input[index]];
		if(v == 0xFF) throw std::invalid_argument("Invalid character exists in the string");
		if(index >= MAX_MEN_LENGTH) throw std::invalid_argument("Too many men strings.");
		bits <<= 6;
		bits |= v;
	}

	int rest_shifts = 60 - (index - 2) * 6;
	bits <<= rest_shifts;

	double result;
	memcpy(&result, &bits, sizeof(result));

	return result;
}
