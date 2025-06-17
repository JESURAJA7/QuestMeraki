import express from 'express';
import { registerAdmin, loginAdmin ,stateAdmin} from '../Controllers/adminController.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.get('/stats',stateAdmin); 

export default router;