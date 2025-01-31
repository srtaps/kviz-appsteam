import express from 'express';
import { saveContestants,getContestants} from '../controllers/contestantsController.js';

const router = express.Router();

// Route /api/contestants
// Fetch top 50
router.get('/', getContestants);
router.post('/', saveContestants);

export default router;