import express from "express";
import { getSettings, saveSettings } from "../controllers/settingsController.js";

const router = express.Router();

// Route api/settings
router.route('/')
    .get(getSettings)
    .post(saveSettings);

export default router;