import { CustomError, ResultCode } from './util';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import Users from '../model/users';
import dotenv from 'dotenv';
import { issueTokenPairZod, issueTokenPairReturnZod, refreshTokenPairZod, refreshTokenPairReturnZod } from './zod/tokensZod';
dotenv.config();

export const issueTokenPair = async (inputs: z.infer<typeof issueTokenPairZod>): Promise<z.infer<typeof issueTokenPairReturnZod>> => {
	const params = issueTokenPairZod.safeParse(inputs);
	// @ts-ignore 
	if (!params.success) throw new CustomError(400, ResultCode.InvalidArgument, `Invalid parameters: ${JSON.stringify(params.error.issues)}`);

	const user = await Users.findOne({id: inputs.id, password: inputs.password}); // find user
	if (!user) throw new CustomError(400, ResultCode.DataNotFound, 'user not found');

	let jwtbase: any = {
		id: user.id.toString(),
	};

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
		subject: `${inputs.id}`,
		algorithm: 'HS256',
	});

	return { aToken, rToken };
};

export const refreshTokenPair = async (inputs: z.infer<typeof refreshTokenPairZod>): Promise<z.infer<typeof refreshTokenPairReturnZod>> => {
	const params = refreshTokenPairZod.safeParse(inputs);
	// @ts-ignore
	if (!params.success) throw new CustomError(400, ResultCode.InvalidArgument, `Invalid parameters: ${JSON.stringify(params.error.issues)}`);

	let verifiedRToken;
	const decodedAToken = jwt.decode(inputs.aToken, { complete: true });
	verifiedRToken = jwt.verify(inputs?.rToken, process.env.OLD_JWT_SECRET); // refresh token
	const payloadOfDecodedAToken = decodedAToken.payload as jwt.JwtPayload;

	if (new Date(verifiedRToken.exp * 1000) < new Date() || payloadOfDecodedAToken.refresh.secret !== verifiedRToken.secret)
		throw new CustomError(400, ResultCode.InvalidRefreshToken, 'invalid rToken');

		const user = await Users.findOne({ id: payloadOfDecodedAToken.id }); // find user
	if (!user) throw new CustomError(400, ResultCode.DataNotFound, 'user not found');

	const tokenPair = await issueTokenPair({
		id: user.id.toString(),
		password: user.password,
	});

	return tokenPair;
}