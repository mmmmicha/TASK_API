import express from 'express';
import { getTaskById, getTasksByUserId, postTask, patchTask, deleteTask } from '../biz/tasksBiz';
import { CustomError, ResultCode, responseGen } from '../biz/util';
const router = express.Router();

// 유저별 task 조회
router.get('/user', async (req, res, next) => {
	try {
		const params = {
			user_id: req.token.id as string,
		}
		const result = await getTasksByUserId(params);
		return responseGen({ res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
	} catch (error) {
		console.error('Error in GET /tasks/user' + error);
		if (error instanceof CustomError) {
			return responseGen({ res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
		} else {
			return responseGen({ res, payload: error, httpCode: 500,  msg: 'Unknown error' });
		}
	}
});

// 특정 task 조회
router.get('/:id', async (req, res, next) => {
	try {
		const params = {
			id: req.params.id,
		}
		const result = await getTaskById(params);
		return responseGen({ res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
	} catch (error) {
		console.error(`Error in GET /tasks/${req.params.id} ${error}`);
		if (error instanceof CustomError) {
			return responseGen({ res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
		} else {
			return responseGen({ res, payload: error, httpCode: 500,  msg: 'Unknown error' });
		}
	}
});

// 새로운 task 등록
router.post('/', async (req, res, next) => {
  	try {
		const params = {
			user_id: req.token.id as string,
			...req.body,
		}
		const result = await postTask(params);
		return responseGen({ res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
	} catch (error) {
		console.error('Error in POST /tasks' + error);
		if (error instanceof CustomError) {
			return responseGen({ res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
		} else {
			return responseGen({ res, payload: error, httpCode: 500,  msg: 'Unknown error' });
		}
	}
});

// 기존 task 수정(내용, 상태)
router.patch('/:id', async (req, res, next) => {
	try {
		const params = {
			id: req.params.id,
			...req.body,
		};
		const result = await patchTask(params);
		return responseGen({ res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
	} catch (error) {
		console.error(`Error in PATCH /tasks/${req.params.id} ${error}`);
		if (error instanceof CustomError) {
			return responseGen({ res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
		} else {
			return responseGen({ res, payload: error, httpCode: 500,  msg: 'Unknown error' });
		}
	}
});

// task 삭제
router.delete('/:id', async (req, res, next) => {
	try {
		const params = {
			id: req.params.id,
		};
		const result = await deleteTask(params);
		return responseGen({ res: res, payload: result, resultCode: ResultCode.OK, httpCode: 200, msg: 'ok', });
	} catch (error) {
		console.error(`Error in DELETE /tasks/${req.params.id} ${error}`);
		if (error instanceof CustomError) {
			return responseGen({ res, payload: error, resultCode: error.resultCode, httpCode: error.httpCode, msg: error.msg });
		} else {
			return responseGen({ res, payload: error, httpCode: 500,  msg: 'Unknown error' });
		}
	}
});

export default router;
