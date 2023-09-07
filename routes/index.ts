import express from 'express';
const router = express.Router();

// 유저별 task 조회
router.get('/status-check', async (req, res, next) => {
	res.status(200).json({ msg: 'ok' });
});

export default router;
