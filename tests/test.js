import isonwebtoken from '../index.js';
import { TTL_HOUR, SINCE_2026 } from '../index.js';

const samplePayload = {
	user_id: 2583,
	user_name: 'KilDong Hong',
	user_roles: 187,
	add_info: -117837484,
}

const iwt = isonwebtoken({
	alg: 'hs256',
	payloadEncoding: 'utf8',
	secretKey: 'testpass',
});

iwt.set(isonwebtoken.expIn(TTL_HOUR, SINCE_2026));
iwt.set("user_id", "user_name", "user_roles", "add_info");

const resultIsonStr = iwt.sign(samplePayload);		// In case of login/token refresh. 여러 사용자에 대해서 수행되어야 함.

console.log("Result Ison String: ", resultIsonStr);
console.log("Legnth of iwt: ", resultIsonStr.length);
const recoveredObj = iwt.verify(resultIsonStr);		// In a router.

console.log("Recovered Object: ", recoveredObj);
