import { Router } from 'express';
import postRouter from './PostRouter';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/posts', postRouter);

// Export the base-router
export default router;
