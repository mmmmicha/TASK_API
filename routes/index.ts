import express from 'express';
import Users from '../model/users';
const router = express.Router();

router.get('/health-check', async (req, res, next) => {
	res.status(200).json({ msg: 'ok' });
});

router.post('/webhook', async (req, res, next) => {
	res.status(200).json({ msg: 'ok' });
});

router.post('/initiation', async (req, res, next) => {
	const user = await Users.findOne({ id: 'test' });
	if (!user) {
		const newUser = new Users({
			id: 'test',
			password: '1234',
			userName: 'test',
		});
		await newUser.save();
	}
	res.status(200).json({ msg: 'ok', resultCode: 1, payload: { id: 'test', password: '1234' } });
});

export default router;
