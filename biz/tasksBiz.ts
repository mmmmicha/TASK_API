import { generateKeyPairSync } from 'crypto';
import { CustomError, redis, redisRead, ResultCode } from './util';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import UserV2 from '../model/userv2';
import dotenv from 'dotenv';
import { getCurrentKeyInfoReturnZod, postIssueTokenReturnZod, postIssueTokenZod, postKeyPairReturnZod, postRefreshTokenReturnZod, postRefreshTokenZod } from './zod/auth';
dotenv.config();

export const getCurrentKeyInfo = async () : Promise<z.infer<typeof getCurrentKeyInfoReturnZod>> => {
	const stringifiedPublicKeyArray = await redisRead.get('publicKeyArray');
	let publicKeyArray;
	if (!stringifiedPublicKeyArray) {
		publicKeyArray = [];
	} else {
		publicKeyArray = JSON.parse(stringifiedPublicKeyArray);
	}
	const refreshTime = await redisRead.get('refreshTime');
	let returnRefreshTime = `utc long : ${refreshTime}, utc + 0900 : ${new Date(Number(refreshTime) + 1000 * 60 * 60 * 9)}`;
	const privateKey = await redisRead.get('privateKey');

	return {
		publicKeyArray,
		refreshTime: returnRefreshTime,
		privateKey,
	};
};

export const postKeyPair = async () : Promise<z.infer<typeof postKeyPairReturnZod>> => {
	const refreshTime = await redisRead.get('refreshTime');
    if (Number(refreshTime) - 10 * 1000 > Date.now()) {
        return {};
    }
	console.info('Creating new keypair...');
	// 1. keypair 생성(ECDSA secp256k1)
	const keyPair = generateKeyPairSync('ec', 
		{ namedCurve: 'secp256k1',
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem',
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem',
			},
		});
	// 2. get redis public key array
	const stringifiedPublicKeyArray = await redisRead.get('publicKeyArray');
	// 3. push new public key
	let publicKeyArray;
	if (!stringifiedPublicKeyArray) {
		publicKeyArray = [keyPair.publicKey];
	} else {
		publicKeyArray = JSON.parse(stringifiedPublicKeyArray);
		if (publicKeyArray.length !== 3) {
			publicKeyArray.push(keyPair.publicKey);
		} else {
			publicKeyArray = [publicKeyArray[1], publicKeyArray[2], keyPair.publicKey];
		}
	}

	// 4. set redis public key array
	await redis.set('publicKeyArray', JSON.stringify(publicKeyArray));
	await redis.set('refreshTime', Date.now() + 1000 * 60 * 60 * 24 * 7);
	await redis.set('privateKey', keyPair.privateKey);
	console.info('Created new keypair');
	
	return keyPair;
}

export const postIssueToken = async (inputs: z.infer<typeof postIssueTokenZod>): Promise<z.infer<typeof postIssueTokenReturnZod>> => {
	const params = postIssueTokenZod.safeParse(inputs);
	// @ts-ignore 
	if (!params.success) throw new CustomError(400, ResultCode.InvalidArgument, `Invalid parameters: ${JSON.stringify(params.error.issues)}`);
	let jwtbase = inputs as any;
	const refreshSecret = uuidv4();
	const refreshJWT = {
		secret: refreshSecret,
		expires: Number(((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000).toFixed(0)),
	};

	const privateKey = await redisRead.get('privateKey');

	jwtbase.refresh = refreshJWT;
	const rToken = jwt.sign(refreshJWT, process.env.REFRESH_PRIVATE_KEY, {
		expiresIn: '30d',
	});
	const aToken = jwt.sign(jwtbase, privateKey, {
		expiresIn: '7d',
		subject: `${inputs._id}`,
		algorithm: 'ES256',
	});

	const aTokenExp = Number(((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000).toFixed(0));
	const rTokenExp = Number(((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000).toFixed(0));
	return { aToken, rToken, aTokenExp, rTokenExp };
};

export const postRefreshToken = async (inputs: z.infer<typeof postRefreshTokenZod>): Promise<z.infer<typeof postRefreshTokenReturnZod>> => {
	const params = postRefreshTokenZod.safeParse(inputs);
	// @ts-ignore
	if (!params.success) throw new CustomError(400, ResultCode.InvalidArgument, `Invalid parameters: ${JSON.stringify(params.error.issues)}`);

	let verifiedOldAToken;
	let verifiedRToken;
	const decodedAToken = jwt.decode(inputs.aToken, { complete: true });
	if (decodedAToken.header.alg === 'HS256') {
		
		verifiedOldAToken = jwt.verify(inputs.aToken, process.env.OLD_JWT_SECRET);
		verifiedRToken = jwt.verify(inputs?.rToken, process.env.OLD_JWT_SECRET); // refresh token

	} else if (decodedAToken.header.alg === 'ES256') {

		const stringifiedPublicKeyArray = await redisRead.get('publicKeyArray');
		const publicKeyArray = JSON.parse(stringifiedPublicKeyArray);
		for (let i = 0; i < publicKeyArray.length; i++) {
			try {
				verifiedOldAToken = jwt.verify(inputs.aToken, publicKeyArray[i]);
				break;
			} catch (e) {
				console.log(`failed to verify token with ${i}th public key`);
			}
		}	
		verifiedRToken = jwt.verify(inputs?.rToken, process.env.REFRESH_PRIVATE_KEY); // refresh token

	}

	if (new Date(verifiedRToken.exp * 1000) < new Date() || verifiedOldAToken.refresh.secret !== verifiedRToken.secret)
		throw new CustomError(400, ResultCode.InvalidKrRToken, 'invalid kr-rtoken');

	const user = await UserV2.findById(verifiedOldAToken._id); // find user
	const tokenObject = postIssueToken({
		_id: user._id.toString(),
		socialId: user.socialId,
		userName: user.userName,
	});

	return tokenObject;
}