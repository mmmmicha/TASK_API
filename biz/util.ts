import { Request, Response } from 'express';
import dotenv from 'dotenv';
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

export interface responseGenInterface {
	res: Response;
	payload: any;
	resultCode?: Number;
	httpCode: number;
	msg?: String;
	statusMessage?: String;
}

export const responseGen = ({
	res,
	payload,
	resultCode,
	httpCode,
	msg,
}: responseGenInterface) => {
	if (httpCode === 200)
		return res.status(httpCode).json({ resultCode: resultCode, msg: msg, payload: payload });
	else if (httpCode === 500)
		return res.status(httpCode).json({ msg: msg });
	else
		return res.status(httpCode).json({ resultCode: resultCode, msg: msg });
};

export const convertDateToString = (date: Date) => {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	return `${year}-${month}-${day} ${hour}:${minute}`;
};