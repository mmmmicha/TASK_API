import { Request, Response, NextFunction } from "express";
import { CustomError, responseGen, ResultCode } from "../biz/util";
import jwt from "jsonwebtoken";

export const CheckAuth = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
        try {
            let authorization = req.headers.authorization as string;
            const token = authorization.replace('Bearer ', '');
            let verifiedToken;
            try {
                verifiedToken = jwt.verify(token, process.env.OLD_JWT_SECRET);    
            } catch (error) {
                throw new CustomError(401, ResultCode.PermissionDenied, "Invalid Token");
            }
            req.token = verifiedToken;
            return next();
        } catch (err) {
            if (err instanceof CustomError) return responseGen({ res, payload: err, resultCode: err.resultCode, httpCode: err.httpCode, msg: err.msg });
            else return responseGen({ res, payload: err, httpCode: 500, msg: 'Unknown error' });
        }
    }

    res.status(401).end();
};