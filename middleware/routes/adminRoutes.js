import App from 'express';
const router = App();
import adminControllers from '../controllers/adminControllers.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/login', upload.single('file'), adminControllers.login);

router.post('/regCandidate', adminControllers.verifyToken, adminControllers.regCandidate);

router.put('/setElectionStatus', adminControllers.verifyToken, adminControllers.setElection);

router.get('/getVotingStatistics', adminControllers.verifyToken, adminControllers.getVotingStatistics);

export default router;
