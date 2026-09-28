# Class: TokenEnv

## Creating a TokenEnv instance.

```js
import mwt from 'miniwebtoken';
...

const tokenEnv = mwt('alg: 'hs256', secretKey: 'testpass', baseTimestamp: mwt.SINCE_2026);
```
From now on, the tokenEnv instance maintains the basic data to sign a payload to generate a token string, and recover the data from the token string.

## Initializing a TokenEnv instance.

### tokenEnv.setKeys(propertyName[, ...])

```js
import mwt from 'miniwebtoken';
...

const tokenEnv = mwt('alg: 'hs256', secretKey: 'testpass', baseTimestamp: mwt.SINCE_2026);
tokenEnv.setKeys('user_id', 'user_role');
```

* `propertyName`: string | function
	string: This will be a name of a property.
	function: A function which returns a new Key Object.
* `Returns`: tokenEnv itself, for method chaining.

On the example above, the tokenEnv instance will produce tokens with 2 properties with signing, and produce an object with 2 properties, vice versa.


### tokenEnv.setSetterFor(KeyName, setterFn)

* `keyName`: String.
* `setterFn`: A function, which receives 'value' as an argument.

* `Returns`: tokenEnv instance itself, for method chaining.

```js
tokenEnv.setKeys('user_id', 'user_role');
tokenEnv.setSetterFor('user_role', function (value) {
    ...
	return modified_value;
  }
);
```

Set setter function for a specified property.

A setter function is used to pre-process the data from original payload before it is stored in the token.
On the example above, the argument 'value' is original value of the property from original payload, and the return value of the setter function actually goes into the token.

### tokenEnv.setGetterFor(KeyName, getterFn)

* `keyName`: String.
* `getterFn`: A function, which receives the (value, targetObj) as arguments.

* Returns: tokenEnv instance itself, for method chaining.

```js
tokenEnv.setKeys('user_id', 'user_role');
tokenEnv.setGetterFor('user_role', function (value, targetObj) {
    ...
  }
);
```

Set getter function for a specified property.

A getter function is used to post-process the data from the token, and produce a payload of a modified data.
A getter function receives two arguments, value and targetObj.

The first argument('value' on the above): The value decoded from the token.
The second argument of the getter function('targetObj'): The object to be returned , under construction.

A getter function modifies the 'targetObj', from the value, and other data from the target, or the tokenEnv's internal setting object, by referring 'this.envSettings'.

### tokenEnv.setUserCode(code, thing) 

* `code` \<string\> The user-defined code. base64url characters(A-Z, a-z, 0-9, '-' and '_') can be used.
* `thing` Anys object or primitive values except Symbol. This object should be unique in the user-defined value queue.

* Returns: tokenEnv instance itself, for method chaining.

For instance, if you register character 'A' for an object, and the value of a property is the object, the 'A' goes into the token. And the 'A' character in the token is to be recoverd to the reference to the original object during verification.

### tokenEnv.sign(payload)

* `payload`: An Object.

* `Returns`: string.
  
### tokenEnv.verify(tokenStr);
* `tokenStr`: string

* `Returns`: object

> Note that, `key` is not required to verify a token, as it is already stored in the tokenEnv instance.

## Built-in key functions.
Built-in key functions are used inside the setKeys() function.

```js
tokenEnv.setKeys('user_id', 'user_name', 'user_role', mwt.maxAge(mwt.DAY));
```
On the example above, the timestamp information goes into the token with signing, and used to check validity of the token during verification.
And the expiry timestamp does not appear on the output payload, because 'keyName' is not given.

Key function is a function, which returns a returns which return a new Key object.
Key function is executed on the initialization procedure, and the inner function which return a new Key object is delivered to setKeys() function.
And then, the inner function is executed in the setKeys() function and the resulting Key object is finally set to the tokenEnv.
This is to binide the setter/getter functions to the corresponding tokenEnv instance.

### maxAge(ageInSec[, keyName])
* `ageInSec`: Number, an integer
* `keyName`: String.
  
If keyName is given, the property with name and value appears on the output payload.
If keyName is missing, the property does not appear  on the output payload.

Token expires after ageInSec from the time of signing.
During verify(), it will throw an error if token is expired: ERRORS.TOKEN_EXPIRED.

### minAge(ageInSec[, keyName])
* `ageInSec`: Number, an integer
* `keyName`: String.
  
If keyName is given, the property with name and value appears on the output payload.
If keyName is missing, the property does not appear  on the output payload.

Token become valid after ageInSec from the time of signing.
During verify(), it will throw an error if token is not validated yet ERRORS.NOT_VALID_YET.

### expiresAt(timestampInSec[, keyName])
* timestampInSec: Number, an integer
* keyName: String.
  
If keyName is given, the property with name and value appears on the output payload.
If keyName is missing, the property does not appear  on the output payload.

Token expires at absolute time, specified in timsteampInSec.
During verify(), it will throw an error if token is expired: ERRORS.TOKEN_EXPIRED.

### activatesAt(timestampInSec[, keyName])
* timestampInSec: Number, an integer
* keyName: String.
  
If keyName is given, the property with name and value appears on the output payload.
If keyName is missing, the property does not appear  on the output payload.

Token become valid after absolute time, specified in timsteampInSec.
During verify(), it will throw an error if it is earlier than the specified time: ERRORS.NOT_VALID_YET.

### issuedAt(keyName)
* keyName: String.

Unlike other key functions, 'keyName' is required.
It just insert timestamp at the time of signing to the token, and let it accessible from the output payload.