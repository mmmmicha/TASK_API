import { z } from "zod";

export const issueTokenPairZod = z.object({
	id: z.string(),
	password: z.string(),
});

export const issueTokenPairReturnZod = z.object({
	aToken: z.string(),
	rToken: z.string(),
});

export const refreshTokenPairZod = z.object({
	aToken: z.string(),
	rToken: z.string(),
});

export const refreshTokenPairReturnZod = z.object({
	aToken: z.string(),
	rToken: z.string(),
});