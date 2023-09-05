import { generateKeyPairSync } from 'crypto';
import { CustomError, redis, redisRead, ResultCode } from './util';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import UserV2 from '../model/userv2';
import dotenv from 'dotenv';
import { issueTokenZod, issueTokenReturnZod, refreshTokenZod, refreshTokenReturnZod } from './zod/tokensZod';
dotenv.config();

export const issueToken = async (inputs: z.infer<typeof issueTokenZod>): Promise<z.infer<typeof issueTokenReturnZod>> => {
	const params = issueTokenZod.safeParse(inputs);
	// @ts-ignore 
	if (!params.success) throw new CustomError(400, ResultCode.InvalidArgument, `Invalid parameters: ${JSON.stringify(params.error.issues)}`);
	let jwtbase = inputs as any;
	const refreshSecret = uuidv4();
	const refreshJWT = {
		secret: refreshSecret,
		expires: Number(((Date.now() + 7 * 24 * 60 * 60 * 1000) / 1000).toFixed(0)),
	};

	jwtbase.refresh = refreshJWT;
	const rToken = jwt.sign(refreshJWT, process.env.OLD_JWT_SECRET, {
		expiresIn: '7d',
	});
	const aToken = jwt.sign(jwtbase, process.env.OLD_JWT_SECRET, {
		expiresIn: '1d',
		subject: `${inputs._id}`,
		algorithm: 'HS256',
	});

	return { aToken, rToken };
};

export const refreshToken = async (inputs: z.infer<typeof refreshTokenZod>): Promise<z.infer<typeof postRefreshTokenReturnZod>> => {
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