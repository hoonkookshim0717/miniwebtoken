## Class: TokenEnv

### tokenEnv.set(propertyName[, customFns])

* `propertyName` string | function | object 
* Returns: 

Set a custom getter or setter function for a specific property(whose name is `propertyName').

```js
tokenEnv.set('user_roles, {
  setter: (value) => {
    ...
    return result;
  },
});
```
If a custom setter function is set for specific propertyName, the registered setter function is to be called during tokenEnv.sign() procedures for the property.
The value of the property of the payload will be the first argument for the setter function, and the return value will goes into the token, after encoding.

```js
tokenEnv.set('user_roles, {
  getter: (value, targetObj) {
    ...
  }
});
```
If a custom getter functin is set for specific propertyName, the registered getter function is to be called during tokenEnv.verify() procedures.

The first argument of the getter function(value on the above): The value decoded from the token.
The second argument of the getter function(targetObj): The object to be returned , under construction, will be the second argument for thecan be altered by the getter functi

If `propertyName` is a function, set() first executes the the function, and the return value is delivered to set() function again.
If `propertyName` is a object, object should have either of the setter/getter property or both.

### tokenEnv.setUserCode(code, thing) 

`code` \<string\> The user-defined code. base64url characters(A-Z, a-z, 0-9, '-' and '_' can be used.
`thing` 

* Returns: reference to tokenEnv instance.

  Registers the code and thing in the tokenEnv instance,

### tokenEnv.sign(payload)

* Returns: string
  
### tokenEnv.verify(tokenStr);
* `tokenStr` string
  
* Returns: object

> Note that, `key` is not required to verify a token, as it is already stored in the tokenEnv instance.

## Custom functions.

### setter function


