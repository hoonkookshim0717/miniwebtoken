// errors.js

const ERRORS = {

	// At tokenEnv constructor
	OPTION_NOT_PROVIDED: "Mandatory properties: 'alg' and ('secretKey' or 'privateKey/publicKey' pair).",
	
	// At tokenEnv.setUserCode()
	INVALID_ARG_FOR_SET_USER_CODE: "A code for user registry should be a string, consists of characters A~Z, a~z, 0~9, '-' and '_'",
	USER_CODE_ALREADY_REGISTERED: "Already registered user code: ",

	// At tokenEnv.setKeys()
	INVALID_ARG_SETKEYS: 'Argument for setKeys() should be a string or a function(which returns a function which returns a new Key object)',
	INVALID_FN_FOR_SETKEYS: 'If a function is given to setKeys(), that function should return a function which returns a new Key object',
	
	// At Key manipulating.
	INVALID_KEY_ELEMENT: 'Valid arguments for Key() : string | function | object',
	SETTER_NOT_FUNCTION: "'setter' should be a 'function'.",
	GETTER_NOT_FUNCTION: "'getter' should be a 'function'.'",

	// At tokenEnv.verify().
	INVALID_KEYCOUNT: "Malformed token. Number of keys registered on tokenEnv object and keys in the token does not match.",
	INVALID_SIGNATURE: "Signature verification failed.",

	// During encoding.
	NOT_TOKENIZABLE: "Given value is not a tokenizable value. Given value is: ",

	// During decoding.
	UNREGISTERED_SP_CODE: "Unregistered special character code exist in the token: ",
	RESERVED_MARKER: "Token has reserved marker, which should not have appeard.",
	UNREGISTERD_USER_CODE: "Unregistered user code exist in the token: ",

	// From built-in key functions.
	MAXAGE_USAGE: "Usage: maxAge(ageInSec[, keyName]), ",
	MINAGE_USAGE: "Usage: minAge(ageInSec[, keyName]), ",
	INVALID_ARG_AGEINSEC: "ageInSec should be an integer, meaning second.",
	
	EXPIRESAT_USAGE: "Usage: expiresAt(timestampInSec[, keyName]), ",
	ACTIVATESAT_USAGE: "Usage: activatesAt(timestampInSec[, keyName]), ",
	INVALID_ARG_TIMESTAMPINSEC: "timestampInSec should be an integer, meaning second.",

	INVALID_ARG_KEYNAME: "keyName should be a string.",

	ISSUEDAT_USAGE: "Usage: issuedAt(keyName), keyName should be a string.",
	
	TOKEN_EXPIRED: "Expired token.",
	NOT_VALID_YET: "Token not valid yet.",
}

export default ERRORS;
