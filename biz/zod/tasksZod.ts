import { z } from "zod";

export const getCurrentKeyInfoReturnZod = z.object({
	publicKeyArray: z.array(z.string()),
	refreshTime: z.string(),
	privateKey: z.string(),
});

export const postKeyPairReturnZod = z.object({
	publicKey: z.string(),
	privateKey: z.string(),
});

export const postIssueTokenZod = z.object({
	_id: z.string(),
	socialId: z.string(),
	userName: z.string(),
});

export const postIssueTokenReturnZod = z.object({
	aToken: z.string(),
	rToken: z.string(),
	aTokenExp: z.number(),
	rTokenExp: z.number(),
});

export const postRefreshTokenZod = z.object({
	aToken: z.string(),
	rToken: z.string(),
});

export const postRefreshTokenReturnZod = z.object({
	aToken: z.string(),
	rToken: z.string(),
	aTokenExp: z.number(),
	rTokenExp: z.number(),
});