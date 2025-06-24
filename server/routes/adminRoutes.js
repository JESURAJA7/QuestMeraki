import express from 'express';
import { registerAdmin, loginAdmin ,stateAdmin ,getAdminStats ,getTrendingBlogs , fetchRecentActivity} from '../Controllers/adminController.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/stats',stateAdmin); 

router.get('/getAdminStats', getAdminStats);
router.get('/trending-blogs', getTrendingBlogs);
router.get('/fetchRecentActivity', fetchRecentActivity);

export default router;