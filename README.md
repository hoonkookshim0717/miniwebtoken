# miniwebtoken
Implementation of web token, focused on minimizing the size of the token.

## Basic concept.
For statelessness, modern systems mainly use 'token system'.
But it cause large amounts of data transmission, because **all the users** have to send token with their **every requests**.
And for better statelessness, size of token should be increased to store necessary data for the user, like permissions, etc.

This token reduces the size of the token, mainly by removing data like property names from the token.

And token can have a references codes(2 bytes for a code minimum), which refer to the objects in your app, instead of storing entire conents of the object after stringifying.
All the removed data resides in the app, not in the token.

In addition, this token uses base64url-like semi-binary serialization process to store primitive values like numbers or boolean, instead of just stringifying objects, and which reduces the token size as well.

The downside of this method is that, if contents of the payload is changed, token issued before the system change is not recoverable.
But, modern system use access token & refresh token system, and lifetime of access token is very short, generally an hour or a day.
So, updating the system will not cause big problem, because the earlier tokens should have been expired already. I suppose...

## 1. Characteristics.

### 1. Size of the token.
Example of a token, using hs256 algorithm to sign:

```js
import mwt from 'miniwebtoken';

const originalPayload = { user_id: 12345, user_name: 'Kil Dong Hong', user_roles: 113 };
const tokenEnv = mwt({ alg: 'hs256', secretKey: 'passKey' });
const token = tokenEnv.sign(originalPayload);
const payload = tokenEnv.verify(token);

console.log(token);        // oT-WDRNw9uhHKeq2DJUnCZzL_rLAlt_f6a7P9NYnuyc.DA5~S2lsIERvbmcgSG9uZw.Bx
console.log(token.length); // 69
console.log(payload);      // { user_id: 12345, user_name: 'Kil Dong Hong', user_roles: 113 }
```

The size of the token constructed from 'originalPayload' is only 69 bytes, including 43 bytes of signature.

This means the token body is just 26 bytes long.

### 2. User can register anything(value or objects), and store it in the token for just 2 bytes.
```js
import mwt from 'miniwebtoken';

const userSymbol = Symbol();
const sampleObject = { bbsR: true, bbsW: true, bbsX: false };

const originalPayload = { userSymbol, sampleObject };
const tokenEnv = mwt({ alg: 'hs256', secretKey: 'testpass' });

tokenEnv.setUserCode('A', sampleObject);
tokenEnv.setUserCode('B', userSymbol);

const token = tokenEnv.sign(originalPayload);		
const payload = tokenEnv.verify(token);

console.log(token);          // uxwH7pjhcmcCsHSF5Sd6_qDsCNnprtNDamaM5crO17M)B)A
console.log(token.length);   // 47
console.log(payload);        // { userSymbol: Symbol(), sampleObject: { bbsR: true, bbsW: true, bbsX: false } }
```

By setting a user-defined code and linking any value(primitive value or object) to the code, token can have reference to the value.

> Of course, the token does not have information about actual data(primitive values or objects), just the reference to the object.
>
> You should keep the original object in your app to re-construct the payload from the token.

### 3. Pre-processing and Post-processing for the values in the token are possible.

By defining a setter/getter function, user can manage the way of storing a value into the token, or interpreting the value from the token to create a new property.
Below is an example showing interpreting the value in the token and produce a new property in a resulting object.

```js
import mwt from 'miniwebtoken';

const originalPayload = { user_id: 12345, user_name: 'Kil Dong Hong', user_roles: 12001 };
const tokenEnv = mwt({ alg: 'hs256', secretKey: 'testpass' });

tokenEnv.set('user_roles', {
	getter(value, targetObj) {
		if(value > 10000) targetObj.isAdmin = true;
		else targetObj.isAdmin = false;
	}
})
const token = tokenEnv.sign(originalPayload);		
const payload = tokenEnv.verify(token);

console.log(token);         // mts6mRU18fAXKHfJ28J61T-zmAJq2WdeT_WLCQlNOsk.DA5~S2lsIERvbmcgSG9uZw.C7h
console.log(token.length);  // 70
console.log(payload);       // { user_id: 12345, user_name: 'Kil Dong Hong', isAdmin: true }
```

> Inserting meta data(Data which does not appear on the payload, like expiration timestamp, etc) to the token is possible by setting setter function, and verifying the data is also possible by setting getter function.

> There are some built-in functions to implement expiration, like expIn().

## 2. Usage

### 1. Install

```bash
$ npm install miniwebtoken
```

### 2. Initializing

```js
import mwt from 'miniwebtoken';

const tokenEnv = mwt({ alg: 'hs256', secretKey: 'testpass' });
```

tokenEnv is an instance, which contains the data for issuing tokens and verifying it(signing algorithm, keys for signing and verification).

It also keep the data like names of the properties, how to process the values(getter/setter functions), user-registered objects, etc.

> Unlike jsonwebtoken, tokenEnv instance need to be maintained in your app, as it is used everytime a payload is signed or token is verified.
> As the data which is removed from the token resides in the instance.

`options` with `alg` property and `secretKey` or `privateKey/publicKey` property should be provided.

* 'alg' property which designate the algorithm to be used to sign and secret keys should be exist,

* 'secretKey' should be exist if 'alg' is set to 'hs***' algorithm,

* 'privateKey' and 'publicKey' should be exist if 'alg' is set to 'rs***', 'ps***' or 'es***' algorithm.

> `options` is options only for signature. Expiration policies can be set differently, described below.

> `secretKey` or `privateKey/publicKey` is a string (utf-8 encoded), buffer, object, or KeyObject containing the secret for HMAC algorithms.

> For PEM-encoded private key for RSA and ECDSA, privateKey and publicKey should be provided.

`options`:

### 3. Setting meta keys, or custom setter/getter functions.

`meta key` means the data which goes into the token, but doens't appear in payload constructed from it, like signature and expiration timestamp, etc.

```js
import mwt from 'miniwebtoken';
import { TTL_HOUR, SINCE_2026 } from 'miniwebtoken';
...
const tokenEnv = mwt({alg: 'hs256', secretKey: 'testpass' };

tokenEnv.set(mwt.expIn(TTL_HOUR, SINCE_2026));
```

mwt.expIn() function is a built-in meta key function to implement TTL(TimeToLive).
> TTL_HOUR is 3600, meaning 1 hour. Token expiration time is set to 1 hour later from now.

> SINCE_2026 is 1767225600, meaning timestamp in seconds at 2026-01-01 from epoch(1970-01-01).
>
> Setting this reduces the size of timestamp, by subtracting the number from current timestamp from epoch.

> setter() function, which is returned from expIn(), inserts modified-expiry-timestamp to the token,

> getter() function, which is also returned from the expIn(), evaluates the value from the token, and throw an error or pass it.

### 4. Setting user code(s).

Users can set user codes(like 'A' and 'B' in below example), and insert it to the token and use it to revert the object from the token.

```js
import mwt from 'miniwebtoken';

const admins = { isAdmin: true, bbsR: true, bbsW: true, bbsX: true };
const users =  { isAdmin: false, bbsR: true, bbsW: true, bbsX: true };
const guests = { isAdmin: false, bbsR: false, bbsW: false, bbsX: true };

const originalPayload1 = { user_id: 12345, user_name: 'Kil Dong Hong', perm: admins };
const originalPayload2 = { user_id: 23456, user_name: 'Choon Hyang Sung', perm: users };
const originalPayload3 = { user_id: 34567, user_name: 'Guestes', perm: guests };

const tokenEnv = mwt({ alg: 'hs256', secretKey: 'testpass' });

tokenEnv.setUserCode('A', admins);
tokenEnv.setUserCode('B', users);
tokenEnv.setUserCode('Z', guests);

const token1 = tokenEnv.sign(originalPayload1);		
const payload1 = tokenEnv.verify(token1);

const token2 = tokenEnv.sign(originalPayload2);		
const payload2 = tokenEnv.verify(token2);

const token3 = tokenEnv.sign(originalPayload3);
const payload3 = tokenEnv.verify(token3);
```

> User code is a string, with characters base64url encoding permits. A-Z, a-z, 0-9, '-' and '_'.

> User code can be composed of multiple characters, so a user can register as many codes as user want. like 'A', 'AA', or 'aA01d-_'.

### 5. Signing a payload.

```js
const token = tokenEnv.sign(samplePayload);
```

By initial running of .sign() function, all the names of properties of samplePayload object is registered in the tokenEnv instance.

Afterwards, registered propetry names are to be used to sign a new payload, and to reconstruct payload during verification process.

By this way, names of the properties don't need to be in the token, resulting small token size.

> For most of the properties of the samplePayload objects, default setter/getter function is set by default.

If you did set custom getter/setter functions for an property before sign(), the getter/setter function will be set for the property.

### 6. Verifying a token and payload reconstruction.

```js
const payload = tokenEnv.verify(mwtStr);
```

> Note that there is no need to provide secret key, as it's stored in the tokenEnv instace.

## 2. Error handling

miniwebtoken throw 2 kinds of errors.

The one is the conventional way, `throw new Error(...)`, and the other is by `throw ERRORS.TOKEN_EXPIRED`.

Conventional 'new Error()' is drawn during initialization or setting, and it might need to update the code of your app.

Important part is to check the result of the verify(), and provide some way of determining what to do for the app. It flows like this:

```js
try {
	tokenEnv.verify(accessToken);
} catch(error) {
	if(error === mwt.ERRORS.TOKEN_EXPIRED) refreshToken();
	else if(error === mwt.ERRORS.INVALID_SIGNATURE) inactivateUser();
	...
}

```
All errors are defined in miniwebtoken.ERRORS object, and the error above is just a string, not an instance of Error().

All errors, users can use, are listed below in this README file.

> Just comparing reference to a string is a lot faster than comparing 2 string entirely.


## 3. APIs

### 1. initialization options.

Algorithms supported(for 'alg')

Array of supported algorithms. The following algorithms are currently supported.

| alg Parameter Value | Digital Signature or MAC Algorithm                                     |
|---------------------|------------------------------------------------------------------------|
| HS256               | HMAC using SHA-256 hash algorithm                                      |
| HS384               | HMAC using SHA-384 hash algorithm                                      |
| HS512               | HMAC using SHA-512 hash algorithm                                      |
| RS256               | RSASSA-PKCS1-v1_5 using SHA-256 hash algorithm                         |
| RS384               | RSASSA-PKCS1-v1_5 using SHA-384 hash algorithm                         |
| RS512               | RSASSA-PKCS1-v1_5 using SHA-512 hash algorithm                         |
| PS256               | RSASSA-PSS using SHA-256 hash algorithm (only node ^6.12.0 OR >=8.0.0) |
| PS384               | RSASSA-PSS using SHA-384 hash algorithm (only node ^6.12.0 OR >=8.0.0) |
| PS512               | RSASSA-PSS using SHA-512 hash algorithm (only node ^6.12.0 OR >=8.0.0) |
| ES256               | ECDSA using P-256 curve and SHA-256 hash algorithm                     |
| ES384               | ECDSA using P-384 curve and SHA-384 hash algorithm                     |
| ES512               | ECDSA using P-521 curve and SHA-512 hash algorithm                     |

> `secretKey` should be provided for HS*** algorithms.

> `privateKey` and `publicKey` should be provided for RS***/PS***/ES*** algorithms.

> `secretKey`, `privateKey`, `publicKey` is a string (utf-8 encoded), buffer, or KeyObject containing either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.

### 2. Error Codes.
List of comparable errors.
| Code	|	thrown from	| Description	|
|--|--|--|
| NOT_TOKENIZABLE			| tokenEnv.sign()			| In case a property of payload has not-tokenizable values like symbol.	|
| INVALID_KEYCOUNT			| tokenEnv.verify()			| In case the number of token elements are not as expected.				|
| INVALID_SIGNATURE			| tokenEnv.verify()			| In case signature verification failed									|
| RESERVED_MARKER			| tokenEnv.verify()			| In case token has a element in reserved area, not assigned yet		|
| UNREGISTERED_USER_CODE	| tokenEnv.verify()			| In case token has a user-registered element, which is not registered.	|
| UNREGISTERED_SP_CODE		| tokenEnv.verify()			| In case token has a special character element, which is not assigned.	|
| TOKEN_EXPIRED				| getter() from expIn()		| In case token expired.												|
| NOT_VALID_YET				| getter() from notBefore()	| In case token arrived too early.										|


## 4. TODOs


## 5. Issue Reporting

https://github.com/hoonkookshim0717/miniwebtoken/issues

## 6. Author
Hoon Kook Shim.
