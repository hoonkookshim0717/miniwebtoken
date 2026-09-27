
import mwt from '../index.js';

const originalPayload = { user_id: 12345, user_name: 'KilDong Hong', user_roles: 0 };

const tokenEnv = mwt({ alg: 'hs256', secretKey: 'testpass' });
tokenEnv.setKeys('user_id', 'user_name', 'user_roles');

const resultMwtStr = tokenEnv.sign(originalPayload);		
console.log("Resulting mwt: ", resultMwtStr);
console.log("Legnth of mwt: ", resultMwtStr.length);

const extractedPayload = tokenEnv.verify(resultMwtStr);

console.log("The extracted payload: ", extractedPayload);