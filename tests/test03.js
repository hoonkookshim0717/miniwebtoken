import mwt from '../index.js';

const originalPayload = { user_id: 12345, user_name: 'Kil Dong Hong', user_roles: 12001 };

const tokenEnv = mwt({ alg: 'hs256', secretKey: 'testpass' });
tokenEnv.setKeys(...Object.keys(originalPayload));

tokenEnv.setGetterFor('user_roles', function (value, targetObj) {
	if(value > 10000) targetObj.isAdmin = true;
	else targetObj.isAdmin = false;
	return value;
});

const token = tokenEnv.sign(originalPayload);		

const payload = tokenEnv.verify(token);

console.log(token);         // mts6mRU18fAXKHfJ28J61T-zmAJq2WdeT_WLCQlNOsk.DA5~S2lsIERvbmcgSG9uZw.C7h
console.log(token.length);  // 70

console.log(payload);       // { user_id: 12345, user_name: 'Kil Dong Hong', isAdmin: true }
