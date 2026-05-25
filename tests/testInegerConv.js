import mwt from '../index.js';

const MAX_INTEGER = 2048;

const tokenEnv = mwt({
	alg: 'hs256',
	secretKey: 'testpass',
});

const testObject = {}

// Positive test.
for(let index = 0; index < 2048; index++) testObject['test' + index] = index;

let token = tokenEnv.sign(testObject);
let revertedObject = tokenEnv.verify(token);

let testPass = true;

for(let index = 0; index < 2048; index++) {
	if(testObject['test'+ index] !== revertedObject['test' + index]) {
		testPass=false;
		break;
	}
}

console.log("Result: ", testPass);
