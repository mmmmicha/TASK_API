import { z } from "zod";

export const issueTokenZod = z.object({
	user_id: z.string(),
	password: z.string(),
});

export const issueTokenReturnZod = z.object({
	aToken: z.string(),
	rToken: z.string(),
});

export const refreshTokenZod = z.object({
	aToken: z.string(),
	rToken: z.string(),
});

export const refreshTokenReturnZod = z.object({
	aToken: z.string(),
	rToken: z.string(),
});