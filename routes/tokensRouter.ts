import express from 'express';
import { issueTokenPair, refreshTokenPair } from '../biz/tokensBiz';
import { CustomError, responseGen, ResultCode } from '../biz/util';
const router = express.Router();

// issue token
router.post('/', async (req, res, next) => {
	try {
		const params = {
			...req.body,
		}
	  const result = await issueTokenPair(params);
	  return responseGen({ res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
  } catch (error) {
	  console.error('Error in POST /tokens' + error);
	  if (error instanceof CustomError) {
		  return responseGen({ res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
	  } else {
		  return responseGen({ res, payload: error, httpCode: 500,  msg: 'Unknown error' });
	  }
  }
});

// token refresh
router.post('/refresh', async (req, res, next) => {
	try {
		const accessToken = req.headers.authorization.replace('Bearer ', '');
		const params = {
			aToken: accessToken,
			rToken: req.headers['rToken'],
		}
		const result = await refreshTokenPair(params);
		return responseGen({ res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
	} catch (error) {
		console.error('Error in POST /tokens/refresh' + error);
		if (error instanceof CustomError) {
			return responseGen({ res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
		} else {
			return responseGen({ res, payload: error, httpCode: 500,  msg: 'Unknown error' });
		}
	}
});

export default router;
