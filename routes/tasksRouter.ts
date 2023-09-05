import express from 'express';
import { getCurrentKeyInfo, postIssueToken, postKeyPair, postRefreshToken } from '../biz/auth';
import { CustomError, responseGen, ResultCode } from '../biz/util';
const router = express.Router();

// 유저별 task 조회
router.get('/user', async (req, res, next) => {
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

// 특정 task 조회
router.get('/{id}', async (req, res, next) => {
	try {
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

// 새로운 task 등록
router.post('/', async (req, res, next) => {
  	try {
		await postKeyPair();
		return responseGen({ req: req, res: res, payload: null, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
	} catch (error) {
		console.error('Error in /keyPair' + error);
		if (error instanceof CustomError) {
			return responseGen({ req, res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
		} else {
			return responseGen({ req, res, payload: error, httpCode: 500,  msg: 'Unknown error' });
		}
	}
});

// 기존 task 수정(내용, 상태)
router.patch('/', async (req, res, next) => {
	try {
	  await postKeyPair();
	  return responseGen({ req: req, res: res, payload: null, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
  } catch (error) {
	  console.error('Error in /keyPair' + error);
	  if (error instanceof CustomError) {
		  return responseGen({ req, res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
	  } else {
		  return responseGen({ req, res, payload: error, httpCode: 500,  msg: 'Unknown error' });
	  }
  }
});

// task 삭제
router.delete('/', async (req, res, next) => {
	try {
		const result = await postIssueToken(req.body);
		return responseGen({ req: req, res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
	} catch (error) {
		console.error('Error in /issue-token' + error);
		if (error instanceof CustomError) {
			return responseGen({ req, res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
		} else {
			return responseGen({ req, res, payload: error, httpCode: 500,  msg: 'Unknown error' });
		}
	}
});

// token refresh
router.post('/refresh-token', async (req, res, next) => {
	try {
		const accessToken = req.headers.authorization.replace('Bearer ', '');
		const params = {
			aToken: accessToken,
			rToken: req.headers['kr-rtoken'],
		}
		const result = await postRefreshToken(params);
		return responseGen({ req: req, res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
	} catch (error) {
		console.error('Error in /refresh-token' + error);
		if (error instanceof CustomError) {
			return responseGen({ req, res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
		} else {
			return responseGen({ req, res, payload: error, httpCode: 500,  msg: 'Unknown error' });
		}
	}
});

export default router;
