import express from "express";
import { getQuestions } from "../controllers/questionsController.js";

const router = express.Router();

// Route /api/questions
router.get('/', getQuestions);

export default router;