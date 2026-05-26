# miniwebtoken
Implementation of web token, focused on minimizing the size of the token.

## 1. Characteristics.

### 1. Size of the token.
Example of a token, using hs256 algorithm to sign:

```js
/// test01.js

import mwt from 'miniwebtoken';

const originalPayload = { user_id: 12345, user_name: 'KilDong Hong', user_roles: 0 };

const tokenEnv = mwt({ alg: 'hs256', secretKey: 'testpass' });

const resultMwtStr = tokenEnv.sign(originalPayload);

console.log("Resulting mwt: ", resultMwtStr);			// Resulting mwt:  HKxTfDySYpzQJld7PJolG_Gc9HLWYlhWJcqErrW-Kl0.DA5~S2lsRG9uZyBIb25n.
console.log("Legnth of mwt: ", resultMwtStr.length);	// Legnth of mwt:  65

const extractedPayload = tokenEnv.verify(resultMwtStr);

console.log("The extracted payload: ", extractedPayload);	// The extracted payload:  { user_id: 12345, user_name: 'KilDong Hong', user_roles: 0 }

```

The size of the token constructed from 'originalPayload' is only 65 bytes, including 43 bytes of signature.

This means the token body is just 22 bytes long.

This is possible by removing names of the properties from the token, and not-stringifying numbers to strings, etc.

### 2. User can insert objects to the token, for only 2 bytes of token size.
```js
// test02.js

import mwt from 'miniwebtoken';

const sampleObject = { bbsReadable: true, bbsWritable: true, bbsAccessible: false };
const originalPayload = { user_id: 12345, user_name: 'KilDong Hong', user_roles: 0, perm: sampleObject };

const tokenEnv = mwt({ alg: 'hs256', secretKey: 'testpass' });
tokenEnv.regUserObject('A', sampleObject);

const resultMwtStr = tokenEnv.sign(originalPayload);		
console.log("Resulting mwt: ", resultMwtStr);          // Resulting mwt:  7nTNl4-G40SSToHNX9jtWHulAbnENBey0vTj1Z4amz8.DA5~S2lsRG9uZyBIb25n.)A
console.log("Legnth of mwt: ", resultMwtStr.length);   // Legnth of mwt:  67

const extractedPayload = tokenEnv.verify(resultMwtStr);

console.log("The extracted payload: ", extractedPayload);
/*
The extracted payload:  {
  user_id: 12345,
  user_name: 'KilDong Hong',
  user_roles: 0,
  perm: { bbsReadable: true, bbsWritable: true, bbsAccessible: false }
}
*/
```
For the saving of the sampleObject, token size increased by 2 bytes.(The trailing ')A' indicate the object.)
> Of course, token does not have actual object, just the reference to the object. You should keep the original object in your app.

### 3. Pre-processing and Post-processing for the values in the token are possible.

By defining a setter/getter function, you can manage the way of storing a value into the token, or interpreting the value from the token to create a new property.

Inserting meta data(Data which does not appear on the payload, like expiration timestamp, etc) to the token is possible by this way, and you can set some kind of verification process here.

## 2. Usage

### 1. Install

```bash
$ npm install miniwebtoken
```

### 2. Overall flow.
```js
// using hmac
import mwt from 'miniwebtoken';
import { TTL_HOUR, SINCE_EPOCH } from 'miniwebtoken';

const samplePayload = { user_id: 1, user_name: 'KilDong Hong' };

// Initializing.
const tokenEnv = mwt({ alg: 'hs256', secretKey: 'testpass' });
tokenEnv.set(mwt.expIn(TTL_HOUR));    // Set expiration time an hour after token generation.

// Signing.(Including initializing)
const mwtStr = mwt.sign(payload);    // In a login handler or refresh handler.
...

// Verifying and reconstruct payload.
const result = mwt.verify(mwtStr);    // In a router.

```

Get a signed token with RSA SHA25 algorithm, and verifying it.

```js
// sign with RSA SHA256

import mwt from 'miniwebtoken';
import { TTL_DAY, SINCE_2026 } from 'miniwebtoken';

const privateKey = fs.readFileSync('private.key');
const publicKey = fs.readFileSync('public.key');

const tokenEnv = mwt({alg: 'rs256', privateKey, publicKey });
tokenEnv.set(mwt.expIn(TTL_DAY, SINCE_2026);

const mwtStr = tokenEnv.sign({ foo: 'bar' });
...
const result = tokenEnv.verify(mwtStr);
```

### 3. Initializing

### Create tokenEnv instace.
```js
import mwt from 'miniwebtoken';

const options = {
  alg: 'hs256',
  secretKey: 'testpass',
}

const tokenEnv = miniwebtoken(options)
```

tokenEnv is a instance, which contains the data for issuing tokens and verifying it, and reconstructing a payload.

`options` should be provided, which contains the algorithm to be used to sign and secret keys.
> `options` is used only to sign and verify the token. Expiration policies can be set differently, described below.

`secretKey` is a string (utf-8 encoded), buffer, object, or KeyObject containing the secret for HMAC algorithms.

For PEM-encoded private key for RSA and ECDSA, privateKey and publicKey should be provided.

`options`:

* `alg` (default: `hs256`)
* `secretKey` - Will be used to sign/verify using hs*** algorithm.
* `privateKey` - Will be used to sign using rs***/ps***/es*** algorithms.
* `publicKey` - Will be used to verify using rs***/ps***/es*** algorithms.

### Setting meta keys

> `meta key` means the data which goes into the token, but doens't appear in payload constructed from it, like signature and expiration timestamp, etc.

```js
import mwt from 'miniwebtoken';
...
const tokenEnv = mwt({alg: 'hs256', secretKey: 'testpass' };

tokenEnv.set(mwt.expIn(TTL_HOUR, SINCE_2026));
```
mwt.expIn() function is a built-in function to implement TTL(TimeToLive).
> TTL_HOUR is 3600, mean 1 hour. Token expiration time is set to 1 hour later from now.
> SINCE_2026 is 1767225600, mean timestamp in seconds from epoch(1970-01-01). Setting this reduces the size of timestamp, by subtract the number from actual timestamp.

## 2. Signing a payload(including initial key register).

```js
const mwtStr = tokenEnv.sign(samplePayload);
```
By initial running of .sign() function, all the names of properties of samplePayload object is registered in the tokenEnv instance.
Afterwards, recorded key names are to be used to sign a new payload for another user, and to reconstruct payload during verification.
By this way, names of the properties doesn't go into the token, resulting small token size.

Or, you can register object keys(== property names) manually:

```js
tokenEnv.set("user_id", "user_name", "user_roles");
const tokenStr = tokenEnv.sign(samplePayload);
```

Once Object keys are registered, token which is created from the tokenEnv instance contains data for the registered properties only.

Which means even if you give a payload with additional properties, it's gonna be discarded in the token generation.

In case registered property doesn't exist in the payload given, an error occurs.

## 3. Verifying a payload.

```js
const mwtStr = tokenEnv.sign(samplePayload);
tokenEnv.verify(mwtStr);
```
> Note that there is no need to provide secret key, as it's stored in the tokenEnv instace.

# APIs

## Options for initialization.

### 1. Algorithms supported(for 'alg')

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

### 2. `secretKey` should be provided for HS*** algorithms.

### 3. `privateKey` and `publicKey` should be provided for RS***/PS***/ES*** algorithms.

> `secretKey`, `privateKey`, `publicKey` is a string (utf-8 encoded), buffer, or KeyObject containing either the secret for HMAC algorithms, or the PEM encoded public key for RSA and ECDSA.

## Errors

To be edited.

### Key incorrect error.

To be edited.

### Token expired error.

To be edited.

# TODO

Add built-in function ExpAt().
Add contact point.

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author
Hoon Kook Shim.

