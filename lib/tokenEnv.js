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
		if(!options || typeof options !== 'object') throw new Error(ERR.OPTION_NOT_PROVIDED);

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
		this.customKeys = new Map();

		this.userRegEncodeTable = new Map();
		this.userRegDecodeTable = new Map();

		this.finalized = false;
	}

	set(propertyName, customFns) {
		if(typeof propertyName === 'function') {
			try {
				this.set(customFns());
			} catch(error) {
				throw new TypeError(ERRORS.INVALID_RETURN_OBJ);
			}
			return this;
		}
		else if(typeof propertyName === 'object') {
			const symbolKey = Symbol();
			const newKey = new Key(symbolKey, propertyName);
			this.keys.set(symbolKey, newKey);
			return this;
		} else if(typeof propertyName === 'string' && typeof customFns === 'object') {
			if(this.customKeys.has(propertyName)) {
				if(customFns.setter) this.customKeys.get(propertyName).setSetter(customFns.setter);
				if(customFns.getter) this.customKeys.get(propertyName).setGetter(customFns.getter);
				return this;
			} else this.customKeys.set(propertyName, new Key(propertyName, customFns));
		} else throw new TypeError(ERRORS.INVALID_ARGS_FOR_SET);
		return this;
	}

	setUserCode(code, thing) {
		// Type checking.
		if(typeof code !== 'string') throw new TypeError(ERRORS.INVALID_ARG_FOR_SET_USER_CODE);
		if(!MEN.isBase64UrlString.test(code)) throw new TypeError(ERRORS.INVALID_ARG_FOR_SET_USER_CODE);
		if(this.userRegDecodeTable.has(code)) throw new Error(ERRORS.USER_CODE_ALREADY_REGISTERED + code);

		this.userRegEncodeTable.set(thing, code);
		this.userRegDecodeTable.set(code, thing);

		return this;
	}

	sign(payload) {
		if(!this.finalized) this.#finalize(payload);

		let resultTokenStr = '';
		for(const [keyName, curKey] of this.keys) {
			const value = curKey.setter(payload[curKey.keyName], this.envSettings);
			resultTokenStr += this.#valueToMen(value);
		}
		
		return this.ws.sign(resultTokenStr) + resultTokenStr;
	}

	verify(tokenStr) {
		const menStrs = MEN.splitTokenStr(tokenStr);
		const tokenBody = tokenStr.slice(menStrs[0].length, tokenStr.length);

		if(menStrs.length !== this.keys.size + 1) throw  ERRORS.INVALID_KEYCOUNT;
		if(!this.ws.verify(tokenBody, menStrs[0])) throw ERRORS.INVALID_SIGNATURE;

		let keyIndex = 1;
		const result = {};
		const metaObj = {};

		for(const [keyName, curKey] of this.keys) curKey.getter(this.#menToValue(menStrs[keyIndex++]), result, this.envSettings, metaObj);

		return result;
	}

	#finalize(payload) {
		for(const curKey of Object.keys(payload)) {
			if(this.customKeys.has(curKey)) this.keys.set(curKey, this.customKeys.get(curKey));
			else this.keys.set(curKey, new Key(curKey));
		}
		this.finalized = true;
	}
	
	#valueToMen (value) {
		if(Number.isFinite(value)) return MEN.encodeNumber(value);
		if(typeof value === 'string') return MEN.STRING_MARKER + Buffer.from(value).toString("base64url");
		if(value === false) return MEN.FALSE_NOTATION;
		if(value === true) return MEN.TRUE_NOTATION;
		if(value === null) return MEN.NULL_NOTATION;
		if(MEN.SP_ENCODE_TABLE.has(value)) return MEN.SP_MARKER + MEN.SP_ENCODE_TABLE.get(value);
		if(this.userRegEncodeTable.has(value)) return this.#encodeUserRegister(value);
		else throw new Error(ERRORS.NOT_TOKENIZABLE + value);
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
				throw new Error(ERRORS.RESERVED_MARKER);
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
		else throw new Error(ERRORS.UNREGISTERED_USER_CODE + userCode);
	}
}

export default TokenEnv;
