import express from 'express';
import { getCurrentKeyInfo, postIssueToken, postKeyPair, postRefreshToken } from '../biz/auth';
import { CustomError, responseGen, ResultCode } from '../biz/util';
const router = express.Router();

// 유저 생성 및 토큰 발급
router.post('/', async (req, res, next) => {
	try {
		const accessToken = req.headers.authorization.replace('Bearer ', '');
		const params = {
			aToken: accessToken,
			rToken: req.headers['kr-rtoken'],
		}
	  const result = await getCurrentKeyInfo();
	  return responseGen({ req: req, res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
  } catch (error) {
	  console.error('Error in /currentKeyInfo' + error);
	  if (error instanceof CustomError) {
		  return responseGen({ req, res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
	  } else {
		  return responseGen({ req, res, payload: error, httpCode: 500,  msg: 'Unknown error' });
	  }
  }
});

// token refresh
router.put('/', async (req, res, next) => {
	try {
		const accessToken = req.headers.authorization.replace('Bearer ', '');
		const params = {
			aToken: accessToken,
			rToken: req.headers['kr-rtoken'],
		}
		const result = await postRefreshToken(params);
		return responseGen({ req: req, res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
	} catch (error) {
		console.error('Error in /refresh' + error);
		if (error instanceof CustomError) {
			return responseGen({ req, res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
		} else {
			return responseGen({ req, res, payload: error, httpCode: 500,  msg: 'Unknown error' });
		}
	}
});

export default router;
