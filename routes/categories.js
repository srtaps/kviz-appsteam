import express from 'express';
import { getCategories } from '../controllers/categoriesController.js';

const router = express.Router();

// Route /api/categories
router.get('/', getCategories);

export default router;