import MEN from "./men.js";
import ERRORS from "./errors.js";

class Key {

	// ExpIn functions and constants.
	static expIn = expIn;
	static notBefore = notBefore;
	static issuedAt = issuedAt;
	
	static TTL_HOUR = 3600;
	static TTL_DAY = 86400;

	constructor(keyName, customFns = {}) {
		if(typeof customFns !== 'object') throw new TypeError(ERRORS.INVALID_CUSTOM_FNS + customFns);

		customFns = { ...defaultCustomFns, ...customFns };
		this.keyName = keyName;
		this.setter = customFns.setter;
		this.getter = customFns.getter;
	}

	setSetter(setterFn) {
		if(typeof setterFn !== 'function') throw new TypeError(ERRORS.SETTER_NOT_FUNCTION);
		this.setter = setterFn;
	}

	setGetter(getterFn) {
		if(typeof getterFn !== 'function') throw new TypeError(ERRORS.GETTER_NOT_FUNCTION);
		this.getter = getterFn;
	}
}

function expIn(ttl = Key.TTL_DAY) {
	return {
		setter: (value, envSettings) => {
				return Math.floor(Date.now() / 1000) + ttl - envSettings.baseTimestamp;
			},
		getter: (value, targetObject, envSettings) => {
				if(value + envSettings.baseTimestamp < Math.floor(Date.now() / 1000))
					throw ERRORS.TOKEN_EXPIRED;
			}
	}
}

function notBefore(dateInFuture) {
	const futureTimestamp = Math.floor(new Date(dateInFuture).getTime() / 1000);
	return {
		setter: (value, envSettings) => {
			return futureTimestamp - envSettings.baseTimestamp;
		},
		getter: (value, targetObject, envSettings, metaObj) => {
			if(value + envSettings.baseTimestamp > Math.floor(Date.now() / 1000))
				throw ERRORS.NOT_VALID_YET;
		}
	}
}

function issuedAt(propertyName) {
	if(propertyName && typeof propertyName !== 'string')
		throw new TypeError(ERRORS.INVALID_ARG_FOR_ISSUED_AT);

	return {
		setter: function (value, envSettings) {
			return Math.floor(Date.now() / 1000) - envSettings.baseTimestamp;
		},
		getter: function (value, targetObj, envSettings, metaObj) {
			if(propertyName) targetObj[propertyName] = value + envSettings.baseTimestamp;
		}
	}
}

const defaultCustomFns = {
	setter: function (value, envSettings) { return value; },
	getter: function (value, targetObj, envSettings, metaObj) {
		if(typeof this.keyName === 'string') targetObj[this.keyName] = value;
	}
}

export default Key;
