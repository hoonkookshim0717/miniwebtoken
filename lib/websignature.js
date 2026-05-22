import crypto from 'crypto';

const supportsKeyObjects = typeof crypto.createPublicKey === 'function';

const errMsgs = {
	invalidEncodingType: ' is not a supported encoding type.\n',
	invalidSignatureEncoding: 'Supported encodings for signature are: "base64url", "base64", "hex", "latin1".',
	invalidPayloadEncoding: 'Supported encodings for payloads are: "utf8", "ascii", "latin1", "base64", "hex"',

	missingSecretKey: '"secretKey" should be set or given to sign or verify using hs***.',
	missingPrivateKey: '"privateKey" should be set or given to sign.',
	missingPublicKey: '"publicKey" should be set or given to verify a signature.',
	
	invalidSecretKey: 'Secret key must be a string or a buffer' + (supportsKeyObjects ? ' or a KeyObject instance' : '' + '.'),
	invalidPrivateKey: 'Private key must be a string, a buffer or an object.',
	invalidPublicKey: 'Public key must be a string or a buffer' + (supportsKeyObjects ? ' or a KeyObject instance' : '' + '.'),
	
	invalidAlgName: ' is not a valid algorithm.\n'
		+ 'Supported algorithms are:\n  "HS256", "HS384", "HS512", "RS256", "RS384", "RS512", "PS256", "PS384", "PS512", "ES256", "ES384", and "ES512".',
}

const
	MAX_OCTET = 0x80,
	CLASS_UNIVERSAL = 0,
	PRIMITIVE_BIT = 0x20,
	TAG_SEQ = 0x10,
	TAG_INT = 0x02,
	ENCODED_TAG_SEQ = (TAG_SEQ | PRIMITIVE_BIT) | (CLASS_UNIVERSAL << 6),
	ENCODED_TAG_INT = TAG_INT | (CLASS_UNIVERSAL << 6);

class WebSignature {

	static defaultOptions = {
		alg: 'hs256',

		signatureEncoding: 'base64url',
		payloadEncoding: 'utf8',

		secretKey: null,
		privateKey: null,
		publicKey: null,
	}

	constructor(options) {
		for(const [key, value] of Object.entries(WebSignature.defaultOptions)) this.schema[key](value);
		this.set(options);
	}

	set alg(algorithmName) { this.schema.alg(algorithmName); }
	
	set signatureEncoding(encodingName) { this.schema.signatureEncoding(encodingName); }
	set payloadEncoding(encodingName) { this.schema.payloadEncoding(encodingName); }
	
	set secretKey(key) { this.schema.secretKey(key); }
	set privateKey(key) { this.schema.privateKey(key); }
	set publicKey(key) { this.schema.publicKey(key); }

	set(options) {
		if(typeof options === 'object') {
			for(const [key, value] of Object.entries(options)) {
				if(!this.schema[key]) {
					console.error(`Warning: ${key} is not a proper option for WebSignature. Discarding it.`);
					continue;
				}
				this.schema[key](value);
			}
		}
		return this;
	}

	with(options) {
		const newWS = Object.create(Object.getPrototypeof(this), Object.getOwnPropertyDescriptors(this));
		newWS.set(options);
		return newWS;
	}

	schema = {
		alg: (algorithmName) => {
			if(!algorithmName) {
				this._algCode = algorithmName;
				this._esCode = algorithmName;
				return;
			}
			
			if(typeof algorithmName !== 'string') throw new TypeError(algorithmName + errMsgs.invalidAlgName);
			
			const algName = algorithmName.toLowerCase();

			let hashSize, esSize;
			if(algName.includes('256')) (hashSize = 256, esSize = 256);
			else if(algName.includes('384')) (hashSize = 384, esSize = 384);
			else if(algName.includes('512')) (hashSize = 512, esSize = 521);
			else throw new TypeError(algCode + errMsgs.invalidAlgName);
			
			(this.esCode = undefined, this.esSize = undefined, this.esMaxLength = undefined);

			if(algName.includes('hs')) {
				this.sign = this.signHmac;
				this.verify = this.verifyHmac;
				this._algCode = 'sha' + hashSize;
				return;
			}
			else if(algName.includes('rs')) {
				this.sign = this.signKey;
				this.verify = this.verifyKey;
				this._algCode = 'RSA-SHA' + hashSize;
				return;
			}
			else if(algName.includes('ps')) {
				this.sign = this.signPSSKey;
				this.verify = this.verifyPSSKey;
				this.algCode = 'RSA-SHA' + hashSize;
				return;
			}
			else if(algName.includes('es')) {
				this.sign = this.signECDSA;
				this.verify = this.verifyECDSA;
				this._algCode = 'RSA-SHA' + hashSize;

				this._esCode = 'ES' + hashSize;
				this._esSize = ((esSize / 8) | 0) + (esSize % 8 === 0 ? 0 : 1);
				this._esMaxLength = this._esSize + 1;
				return;
			}
			else throw new TypeError(algCode + errMsgs.invalidAlgName);
		},

		signatureEncoding: (encodingName) => {
			if(!encodingName) {
				this._signatureEncoding = encodingName;
				return;
			}
			if(typeof encodingName !== 'string') throw new TypeError(encodingName + errMsgs.invalidEncodingType + errMsgs.invalidSignatureEncoding);

			const encName = encodingName.toLowerCase()
			if(encName === 'base64url' || encName === 'base64' || encName === 'hex' || encName === 'latin1') this._signatureEncoding = encName;
			else throw new TypeError(encodingName + errMsgs.invalidEncodingType + errMsgs.invalidSignatureEncoding);
		},
		payloadEncoding: (encodingName) => {
			if(!encodingName) {
				this._signatureEncoding = encodingName;
				return;
			}
			if(typeof encodingName !== 'string') throw new TypeError(encodingName + errMsgs.invalidEncodingType + errMsgs.invalidPayloadEncoding);

			const encName = encodingName.toLowerCase();
			if(encName === 'utf8' || encName === 'ascii' || encName === 'latin1' || encName === 'base64' || encName === 'hex') this._payloadEncoding = encName;
			else throw new TypeError(encodingName + errMsgs.invalidEncodingType + errMsgs.invalidPayloadEncoding);
		},

		secretKey: (key) => {
			if(!key) {
				this._secretKey = key;
				return;
			}
			if (Buffer.isBuffer(key) || typeof key === 'string') this._secretKey = key;
			else if (!supportsKeyObjects || typeof key !== 'object') throw new TypeError(errMsgs.invalidSecretKey);
			else if (key.type !== 'secret' || typeof key.export !== 'function') throw new TypeError(errMsgs.invalidSecretKey);
			this._secretKey = key;
		},
		privateKey: (key) => {
			if(!key) {
				this._privateKey = key;
				return;
			}
			if (Buffer.isBuffer(key) || typeof key === 'string' || typeof key === 'object') this._privateKey = key;
			else throw new TypeError(errMsgs.invalidPrivateKey);
		},
		publicKey: (key) => {
			if(!key) {
				this._publicKey = key;
				return;
			}
			if (Buffer.isBuffer(key) || typeof key === 'string') this._publicKey = key;
			else if (typeof key !== 'object' || !supportsKeyObjects) throw new TypeError(errMsgs.invalidPublicKey);
			else if (typeof key.type !== 'string' || typeof key.asymmetricKeyType !== 'string' || typeof key.export !== 'function')
				throw new TypeError(errMsgs.invalidPublicKey);
			this._publicKey = key;
		},
	}

	signHmac(payload) {
		if(!this._secretKey) throw new TypeError(errMsgs.missingSecretKey);
		payload = stringify(payload);
		const signature = crypto.createHmac(this._algCode, this._secretKey)
			.update(payload, this._payloadEncoding)
			.digest(this._signatureEncoding);
		return signature;
	}

	verifyHmac(payload, signature) {
		const expectedSignature = this.signHmac(payload);

		return crypto.timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expectedSignature)
		);
	}

	signKey(payload) {
		if(!this._privateKey) throw new TypeError(errMsgs.missingPrivateKey);
		payload = stringify(payload);
		const signature = crypto.sign(
			this._algCode,
			Buffer.from(payload, this._payloadEncoding),
			this._privateKey
		);
		return signature.toString(this._signatureEncoding);
	}

	verifyKey(payload, signature) {
		if(!this._publicKey) throw new TypeError(errMsgs.missingPublicKey);
		payload = stringify(payload);
		return crypto.verify(
			this._algCode,
			Buffer.from(payload, this._payloadEncoding),
			this._publicKey,
			Buffer.from(signature, this._signatureEncoding)
		);
	}

	signPSSKey(payload) {
		if(!this._privateKey) throw new TypeError(errMsgs.missingPrivateKey);
		payload = stringify(payload);
		const signature = crypto.sign(
			this._algCode,
			Buffer.from(payload, this._payloadEncoding),
			{
				key: this._privateKey,
				padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
				saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
			}
		);
		return signature.toString(this._signatureEncoding);
	}

	verifyPSSKey(payload, signature) {
		if(!this._publicKey) throw new TypeError(errMsgs.missingPublicKey);
		payload = stringify(payload);
		return crypto.verify(
			this._algCode,
			Buffer.from(payload, this._payloadEncoding),
			{
				key: this._publicKey,
				padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
				saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
			},
			Buffer.from(signature, this._signatureEncoding)
		);
	}

	signECDSA(payload) {
		if(!this._privateKey) throw new TypeError(errMsgs.missingPrvateKey);
		payload = stringify(payload);
		const signature = crypto.sign(
			this._algCode,
			Buffer.from(payload, this._payloadEncoding),
			this._privateKey
		);
		return this.derToJose(signature).toString(this._signatureEncoding);
	}

	verifyECDSA(payload, signature) {
		if(!this._publicKey) throw new TypeError(errMsgs.missingPublicKey);
		payload = stringify(payload);
		signature = this.joseToDer(Buffer.from(signature, this._signatureEncoding));
		return crypto.verify(
			this._algCode,
			Buffer.from(payload, this._payloadEncoding),
			this._publicKey,
			signature			// Already Buffer, by joseToDer().
		);
	}

	derToJose(signature) {
		const inputLength = signature.length;
		let offset = 0;
		
		if(signature[offset++] !== ENCODED_TAG_SEQ)
			throw new Error('Could not find expected "seq". Maybe you provided non-es key');

		let seqLength = signature[offset++];
		if(seqLength === (MAX_OCTET | 1)) seqLength = signature[offset++];

		if(inputLength - offset < seqLength)
			throw new Error('"seq" specified length of "' + seqLength + '"only "' + (inputLength - offset) + '" remaining');

		if(signature[offset++] !== ENCODED_TAG_INT) throw new Error('Could not find expected "int" for "r"');

		const rLength = signature[offset++];

		if(inputLength - offset - 2 < rLength)
			throw new Error('"r" specified length of "' + rLength + '", only "' + (inputLength - offset -2) + '" available');

		if(this._esMaxSize < rLength)
			 throw new Error('"r" specified length of "' + rLength + '", max of "' + this._esMaxSize + '" is acceptable');

		const rOffset = offset;
		offset += rLength;

		if(signature[offset++] !== ENCODED_TAG_INT) throw new Error('Cound not find expected "int" for "s"');

		const sLength = signature[offset++];

		if (inputLength - offset !== sLength)
        	throw new Error('"s" specified length of "' + sLength + '", expected "' + (inputLength - offset) + '"');
	    
		if (this._esMaxSize < sLength)
    		throw new Error('"s" specified length of "' + sLength + '", max of "' + this._esMaxSize + '" is acceptable');

		const sOffset = offset;
		offset += sLength;

		if (offset !== inputLength)
    		throw new Error('Expected to consume entire buffer, but "' + (inputLength - offset) + '" bytes remain');
    
		const
			rPadding = this._esSize - rLength,
			sPadding = this._esSize - sLength;
		let dst = Buffer.allocUnsafe(rPadding + rLength + sPadding + sLength);

		for (offset = 0; offset < rPadding; ++offset) dst[offset] = 0;
		
		signature.copy(dst, offset, rOffset + Math.max(-rPadding, 0), rOffset + rLength);

    	offset = this._esSize;

		for (const o = offset; offset < o + sPadding; ++offset) dst[offset] = 0;
		signature.copy(dst, offset, sOffset + Math.max(-sPadding, 0), sOffset + sLength);

		return dst;
	}

	joseToDer(signature) {
		// Input signature: Buffer
		// Returns signature Buffer.

		const signatureLength = signature.length;
		if (signatureLength !== this._esSize * 2)
			throw new TypeError('"' + this._algCode + '" signatures must be "' + this._esSize * 2 + '" bytes, saw "' + signatureLength + '"');

		const rPadding = countPadding(signature, 0, this._esSize);
		const sPadding = countPadding(signature, this._esSize, signatureLength);
		const rLength = this._esSize - rPadding;
		const sLength = this._esSize - sPadding;

		const rsBytes = 1 + 1 + rLength + 1 + 1 + sLength;

		const shortLength = rsBytes < MAX_OCTET;
		const dst = Buffer.allocUnsafe((shortLength ? 2 : 3) + rsBytes);

		let offset = 0;

		dst[offset++] = ENCODED_TAG_SEQ;
		if (shortLength) dst[offset++] = rsBytes; // Bit 8 has value "0", bits 7-1 give the length.
		else {
			// Bit 8 of first octet has value "1"
			// bits 7-1 give the number of additional length octets.
			dst[offset++] = MAX_OCTET   | 1;
			// length, base 256
			dst[offset++] = rsBytes & 0xff;
		}
		dst[offset++] = ENCODED_TAG_INT;
		dst[offset++] = rLength;
		if (rPadding < 0) {
			dst[offset++] = 0;
			offset += signature.copy(dst, offset, 0, this._esSize);
		} else {
			offset += signature.copy(dst, offset, rPadding, this._esSize);
		}
		dst[offset++] = ENCODED_TAG_INT;
		dst[offset++] = sLength;
		if (sPadding < 0) {
			dst[offset++] = 0;
			signature.copy(dst, offset, this._esSize);
		} else signature.copy(dst, offset, this._esSize + sPadding);

		return dst;
	}
}

function countPadding(buf, start, stop) {
	let padding = 0;
	while(start + padding < stop && buf[start + padding] === 0) ++padding;
	if(buf[start+padding] >= MAX_OCTET) --padding;

	return padding;
}

function stringify(payload) {
  if (!(Buffer.isBuffer(payload) || typeof payload === 'string')) payload = JSON.stringify(payload);
  return payload;
}

function webSignature(options) { return new WebSignature(options); }

export default webSignature;
