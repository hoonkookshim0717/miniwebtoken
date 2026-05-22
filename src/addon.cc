#include <napi.h>
#include "./ison.h"

Napi::Value encodeInt(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Number expected")
            .ThrowAsJavaScriptException();
        return env.Null();
    }

	char resultIson[MAX_ISON_LENGTH];

    // JS Number -> int64_t.
    int64_t input = info[0].As<Napi::Number>().Int64Value();

    // Performing encoding.
    encode_int(input, resultIson);

    // Return as JS string.
    return Napi::String::New(env, resultIson);
}

Napi::Value decodeInt(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if(info.Length() < 1 || !info[0].IsString()) {
        Napi::TypeError::New(env, "String expected")
            .ThrowAsJavaScriptException();

        return env.Null();
    }

    try {
        std::string input = info[0].As<Napi::String>().Utf8Value();

		char isonStr[MAX_ISON_LENGTH];
		std::strcpy(isonStr, input.c_str());

        int64_t decoded = decode_int(isonStr);

        return Napi::Number::New(env, decoded);
    }
    catch (const std::exception& e) {
        Napi::Error::New(env, e.what())
            .ThrowAsJavaScriptException();

        return env.Null();
    }
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(
        Napi::String::New(env, "encode"),
        Napi::Function::New(env, encodeInt)
    );
    exports.Set(
        Napi::String::New(env, "decode"),
        Napi::Function::New(env, decodeInt)
    );
    return exports;
}

NODE_API_MODULE(addon, Init);

