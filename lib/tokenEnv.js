import webSignature from './websignature.js';
import Key from './key.js';
import MEN from './men.js';

class TokenEnv {
	
	constructor(wsOptions) {
		if(!wsOptions) throw new Error("Signature Options must be provided.");

		wsOptions.payloadEncoding = 'utf8';
		wsOptions.signatureEncoding = 'base64url';

		this.ws = webSignature(wsOptions);
		this.keys = new Map();
		this.userRegEncodeTable = new Map();
		this.userRegDecodeTable = new Map();
		this.finalized = false;
	}

	set(...keys) {
		for(const curKey of keys) {
			if(typeof curKey === 'object' && curKey.keyName && curKey.getter && curKey.setter) this.keys.set(curKey.keyName, curKey);
			else if(typeof curKey === 'string') this.keys.set(curKey, new Key(curKey));
			else if(typeof curKey === 'function') {
				const createdKey = curKey();
				if(typeof createdKey === 'object' && curKey.keyName && curKey.getter && curKey.setter) this.keys.set(curKey.keyName, createdKey);
			}
			else {
				throw new TypeError(MEN.errMsgs.INVALID_ARGS_FOR_SET);
			}
		}
		return this;
	}

	regUserObject(code, obj) {
		try {
			Buffer.from(code, 'base64url');
		} catch (error) {
			throw new Error('String with only A-Z, a-z, 0-9, "-" and "_" can be used as code for registering user object');
		}
		if(this.userRegDecodeTable.has(code)) throw new Error('Already registered user code: ', code);
		// if(this.userRegEncodeTable.has(obj)) throw new Error("Already registered user object. Same object cannot be registered, as ");

		this.userRegEncodeTable.set(obj, code);
		this.userRegDecodeTable.set(code, obj);
	}

	sign(payload) {
		if(!this.finalized) {
			this.#setKeysFromPayload(payload);
			this.finalized = true;
		}

		let resultTokenStr = '';

		for(const [keyName, curKey] of this.keys) {
			const value = curKey.setter(payload[curKey.keyName]);
			// if(!Number.isFinite(value) && !(typeof value === 'string')) throw new Error("setter function Must return a number or string, not even undefined.");
			resultTokenStr += this.#valueToMen(value);
		}
		
		return this.ws.sign(resultTokenStr) + resultTokenStr;
	}

	verify(tokenStr) {
		const menStrs = MEN.splitTokenStr(tokenStr);
		const tokenBody = tokenStr.slice(menStrs[0].length, tokenStr.length);

		if(menStrs.length !== this.keys.size + 1) throw new Error("Key count doesn't match.");
		if(!this.ws.verify(tokenBody, menStrs[0])) throw new Error("signature not verified.");

		let keyIndex = 1;
		const result = {};

		for(const [keyName, curKey] of this.keys) curKey.getter(this.#menToValue(menStrs[keyIndex++]), result, tokenBody);

		return result;
	}

	#setKeysFromPayload(payload) {
		for(const curKey of Object.keys(payload)) {
			if(!this.keys.has(curKey)) this.keys.set(curKey, new Key(curKey));
		}
	}
	
	#valueToMen (value) {
		if(Number.isFinite(value)) return MEN.encodeNumber(value);
		else if(typeof value === 'string') return MEN.STRING_MARKER + Buffer.from(value).toString("base64url");
		else if(MEN.SP_ENCODE_TABLE.has(value)) return MEN.SP_MARKER + MEN.SP_ENCODE_TABLE.get(value);
		else if(typeof value === 'object') return this.#encodeUserRegister(value);
		else throw new Error("Not a tokenizable value. Given value is: ", value);
	}

	#menToValue (menStr) {
		const marker = menStr[0];
		switch(marker) {
			case MEN.POSITIVE_MARKER:
				return MEN.decodeNumber(menStr);
			case MEN.NEGATIVE_MARKER:
				return MEN.decodeNumber(menStr);
			case MEN.STRING_MARKER:
				return Buffer.from(menStr.slice(1, menStr.length), 'base64url').toString();
			case MEN.FLOAT64_MARKER:
				return MEN.decodeNumber(menStr);
			case MEN.SP_MARKER:
				return MEN.decodeSp(menStr);
			case MEN.USER_REG_MARKER:
				return this.#decodeUserRegister(menStr);
			case MEN.RESERVED_MARKER:
				throw new Error(`Marker '${MEN.RESERVED_MARKER}' is a reserved marker. Should not be appeared on the token.`);
			default:
				return menStr;			// Mean this is a signature.
		}
	}

	#encodeUserRegister(value) {
		if(this.userRegEncodeTable.has(value)) return MEN.USER_REG_MARKER + this.userRegEncodeTable.get(value);
		else throw new Error('Unregistered user object. The reference should match. Given object is: ', value);
	}

	#decodeUserRegister(menStr) {
		const userCode = menStr.slice(1, menStr.length);
		if(this.userRegDecodeTable.has(userCode)) return this.userRegDecodeTable.get(userCode);
		else throw new Error(`Unregistered user code: '${userCode}`);
	}
}

export default TokenEnv;
