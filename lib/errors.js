// errors.js

const ERRORS = {

	// Errors thrown with Error()
		// during initialization.
		OPTION_NOT_PROVIDED: "Mandatory properties: 'alg' and ('secretKey' or 'privateKey/publicKey' pair).",
		KEYNAME_NOT_EXISTS: "Keyname doesn't exist in tokenEnv instance: ",
		USER_CODE_ALREADY_REGISTERED: "Already registered user code: ",
		CUSTOM_VAL_ALREADY_REGISTERED: 'Already registered user-defined element: ',
		
		// during encoding.
		NOT_TOKENIZABLE: "Given value is not a tokenizable value. Given value is: ",

	// Errors thrown with TypeError()
		// from tokenEnv.setKeys()
		INVALID_ARG_SETKEYS: 'Argument for setKeys() should be a string or a function(which returns a function which returns a new Key object)',
		INVALID_FN_FOR_SETKEYS: 'If a function is given to setKeys(), that function should return a function which returns a new Key object',
		INVALID_ARG_FOR_SET_USER_CODE: "A code for user registry should be a string, consists of characters A~Z, a~z, 0~9, '-' and '_'",
		
		// from built-in key functions.
		MAXAGE_USAGE: "Usage: maxAge(ageInSec[, keyName]), ageInSec: an integer / keyName: string.",
		MINAGE_USAGE: "Usage: minAge(ageInSec[, keyName]), ageInSec: an integer / keyName: string.",
		EXPIRES_AT_USAGE: "Usage: expiresAt(timestampInSec[, keyName]), timestampInSec: an integer / keyName: string.",
		ACTIVATES_AT_USAGE: "Usage: activatesAt(timestampInSec[, keyName]), timestampInsec: an integer, keyName: string.",
		ISSUED_AT_USAGE: "Usage: issuedAt(keyName), keyName: string",

	// Errors thrown with text.
		// Mainly caused by users.
		INVALID_SIGNATURE: "Signature verification failed.",
		TOKEN_EXPIRED: "Expired token.",
		NOT_VALID_YET: "Token not valid yet.",
	 
		// during decoding - Probably wrong tokenEnv instance is used to verify, or client send outdated tokens.
		INVALID_KEYCOUNT: "Malformed token. Number of keys registered on tokenEnv object and keys in the token does not match.",
		RESERVED_MARKER: "Token has reserved marker, which should not have appeard.",
		UNREGISTERED_SP_CODE: "Unregistered special character code exist in the token: ",
		UNREGISTERD_USER_CODE: "Unregistered user code exist in the token",
}

export default ERRORS;
