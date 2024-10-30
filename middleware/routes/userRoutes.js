import App from 'express';
const router = App();
import userControllers from '../controllers/userControllers.js';

router.post('/login', userControllers.votingStatus, userControllers.login);

router.post('/login/otp_authenticate', userControllers.votingStatus, userControllers.otp_authenticate);

router.post('/register', userControllers.register);

router.get('/voteSetup', userControllers.votingStatus, userControllers.verifyToken, userControllers.voteSetup);

router.post('/voteService', userControllers.votingStatus, userControllers.verifyToken, userControllers.voteService);

export default router;