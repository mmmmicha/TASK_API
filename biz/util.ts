import { Request, Response } from 'express';
import dotenv from 'dotenv';
import Redis from 'ioredis';
dotenv.config();

export enum ResultCode {
	OK = 1,
	AlreadyExists = -1,
	InvalidArgument = -2,
	ExpiredData = -3,
	IncorrectData = -4,
	InvalidData = -5,
	InvalidKey = -6,
	InvalidOperation = -7,
	LastMemberInDoorLock = -8,
	DataNotFound = -9,
	Offline = -10,
	OutOfRange = -11,
	PermissionDenied = -12,
	Timeout = -13,
	NotInTime = -30,
	InvalidKrPin = -1001,
	InvalidAccessToken = -1002,
	InvalidKrWallet = -1003,
	InvalidKrRelayToken = -1004,
	InvalidSocialToken = -1005,
	InvalidKrRToken = -1006,
	InvalidAppVer = -1007,
}

export class CustomError {
	resultCode: ResultCode;
	msg: string;
	httpCode: number;
	constructor(httpCode: number, resultCode: ResultCode, msg: string) {
		this.httpCode = httpCode;
		this.resultCode = resultCode;
		this.msg = msg;
	}
}

export interface LoggedRequest extends Request {
	locals: any;
}

export interface responseInterface {
	payload: any;
	resultCode?: Number;
	httpCode: number;
	msg?: String;
	statusMessage?: String;
}

export interface responseGenInterface extends responseInterface {
	res: Response;
	req?: Request | LoggedRequest;
}

export const responseGen = ({
	req,
	res,
	payload,
	resultCode,
	httpCode,
	msg,
}: responseGenInterface) => {
	if (httpCode === 200)
		return res.status(httpCode).json({ resultCode: resultCode, msg: msg, payload: payload });
	else if (httpCode === 500)
		return res.status(httpCode).json({ msg: msg, relayError: payload });
	else
		return res.status(httpCode).json({ resultCode: resultCode, msg: msg, relayError: payload });
};

export const errorAdjuster = (err: Error | any) => {
	return typeof err?.message === 'string' ? err.message : undefined;
}

export const redis = new Redis({
	host: process.env.REDIS_URL, port: Number(process.env.REDIS_PORT), db: Number(process.env.REDIS_DB_ID), commandTimeout: 300, retryStrategy(times) {
		// logtail.error(`redis retry ${times} times`);
		return Math.min(times * 50, 2000);
	}
});

export const redisRead = new Redis({
	host: process.env.REDIS_READ_URL, port: Number(process.env.REDIS_READ_PORT), db: Number(process.env.REDIS_DB_ID), commandTimeout: 300, retryStrategy(times) {
		// logtail.error(`redisRead retry ${times} times`);
		return Math.min(times * 50, 2000);
	}
});