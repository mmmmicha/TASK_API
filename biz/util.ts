import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

export enum ResultCode {
	OK = 1,
	AlreadyExists = -1,
	InvalidArgument = -2,
	InvalidOperation = -3,
	DataNotFound = -4,
	PermissionDenied = -5,
	InvalidRefreshToken = -6,
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