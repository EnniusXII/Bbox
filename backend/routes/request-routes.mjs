import express from 'express';
import { getRequestInfo, getRequests } from '../controllers/requests-controller.mjs';
import { protect } from '../middleware/authorization.mjs';


const router = express.Router();

router.route('/').get(getRequests);
router.route('/:requestId').get(protect, getRequestInfo);


export default router;