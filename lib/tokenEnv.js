import webSignature from './websignature.js';
import Key from './key.js';
import MEN from './men.js';
import ERRORS from './errors.js';

class TokenEnv {

	static SINCE_EPOCH = 0;
	static SINCE_2000 = 946684800;
	static SINCE_2020 = 1577836800;
	static SINCE_2026 = 1767225600;	
	
	constructor(options) {
		if(!options || typeof options !== 'object') throw new Error(ERRORS.OPTION_NOT_PROVIDED);
// property checking here(alg, key)
		const { alg, secretKey, privateKey, publicKey } = options;
		
		const wsOptions = {
			alg, secretKey, privateKey, publicKey,
			payloadEncoding: 'utf8',
			signatureEncoding: 'base64url',
		}
		const { baseTimestamp } = options;
		
		this.envSettings = {
			initTimestamp: Math.floor(Date.now() / 1000),
			baseTimestamp: baseTimestamp ?? TokenEnv.SINCE_EPOCH,
		}
		this.ws = webSignature(wsOptions);

		this.keys = new Map();

		this.userRegEncodeTable = new Map();
		this.userRegDecodeTable = new Map();
	}

	setKeys(...keys) {
		for(const curKey of keys) {
			if(typeof curKey === 'string') this.keys.set(curKey, new Key(curKey, this.envSettings));
			else if(typeof curKey === 'function') {
				const result = curKey(this.envSettings);
				if(!result instanceof Key) throw new Error(ERRORS.INVALID_FN_FOR_SETKEYS);
				this.keys.set(result.keyName, result);
			}
			else throw new TypeError(ERRORS.INVALID_ARG_SETKEYS);
		}
	}

	setSetterFor(keyName, setterFn) {
		if(this.keys.has(keyName)) this.keys.get(keyName).setter = setterFn;
		else throw new Error("Doesn't have keyname " + keyName);
	}

	setGetterFor(keyName, getterFn) {
		if(this.keys.has(keyName)) this.keys.get(keyName).getter = getterFn;
		else throw new Error("Doesn't have keyName " + keyName);
	}

	setUserCode(code, thing) {
		if(typeof code !== 'string') throw new TypeError(ERRORS.INVALID_ARG_FOR_SET_USER_CODE);
		if(!MEN.isBase64UrlString.test(code)) throw new TypeError(ERRORS.INVALID_ARG_FOR_SET_USER_CODE);
		if(this.userRegDecodeTable.has(code)) throw new Error(ERRORS.USER_CODE_ALREADY_REGISTERED + code);

		this.userRegEncodeTable.set(thing, code);
		this.userRegDecodeTable.set(code, thing);

		return this;
	}

	sign(payload) {
		let resultTokenStr = '';
		for(const curKey of this.keys.values()) {
			const value = curKey.setter(payload[curKey.keyName]);
			resultTokenStr += this.#valueToMen(value);
		}
		
		return this.ws.sign(resultTokenStr) + resultTokenStr;
	}

	verify(tokenStr) {
		const menStrs = MEN.splitTokenStr(tokenStr);
		const tokenBody = tokenStr.slice(menStrs[0].length, tokenStr.length);

		if(menStrs.length !== this.keys.size + 1) throw  ERRORS.INVALID_KEYCOUNT;
		if(!this.ws.verify(tokenBody, menStrs[0])) throw ERRORS.INVALID_SIGNATURE;

		const result = {};
		const metaObj = {};
		
		let index = 1;
		for(const curKey of this.keys.values()) {
			const value = curKey.getter(this.#menToValue(menStrs[index++]), result, metaObj);
			// if(typeof curKey.keyName === 'string') result[curKey.keyName] = value;
		};

		return result;
	}
	
	#valueToMen (value) {
		if(Number.isFinite(value)) return MEN.encodeNumber(value);
		if(typeof value === 'string') return MEN.STRING_MARKER + Buffer.from(value).toString("base64url");
		if(value === false) return MEN.FALSE_NOTATION;
		if(value === true) return MEN.TRUE_NOTATION;
		if(value === null) return MEN.NULL_NOTATION;
		if(MEN.SP_ENCODE_TABLE.has(value)) return MEN.SP_MARKER + MEN.SP_ENCODE_TABLE.get(value);
		if(this.userRegEncodeTable.has(value)) return this.#encodeUserRegister(value);
		else throw ERRORS.NOT_TOKENIZABLE + value;
	}

	#menToValue (menStr) {
		const marker = menStr[0];
		switch(marker) {
			case MEN.POSITIVE_MARKER:
				if(menStr === MEN.FALSE_NOTATION) return false;
				return MEN.decodeNumber(menStr);
			case MEN.NEGATIVE_MARKER:
				if(menStr === MEN.TRUE_NOTATION) return true;
				return MEN.decodeNumber(menStr);
			case MEN.STRING_MARKER:
				return Buffer.from(menStr.slice(1, menStr.length), 'base64url').toString();
			case MEN.FLOAT64_MARKER:
				if(menStr === MEN.NULL_NOTATION) return null;
				return MEN.decodeNumber(menStr);
			case MEN.SP_MARKER:
				return MEN.decodeSp(menStr);
			case MEN.USER_REG_MARKER:
				return this.#decodeUserRegister(menStr);
			case MEN.RESERVED_MARKER:
				throw ERRORS.RESERVED_MARKER;
			default:
				return menStr;			// Mean this is a signature.
		}
	}

	#encodeUserRegister(value) {
		return MEN.USER_REG_MARKER + this.userRegEncodeTable.get(value);
	}

	#decodeUserRegister(menStr) {
		const userCode = menStr.slice(1, menStr.length);
		if(this.userRegDecodeTable.has(userCode)) return this.userRegDecodeTable.get(userCode);
		else throw new Error(ERRORS.apps.UNREGISTERED_USER_CODE + userCode);
	}
}

export default TokenEnv;
