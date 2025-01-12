// imports
const express = require("express");
const LLM_API_CONTROLLER = require("../controllers/LLM_api_controllers.js");

// intialize router
const router = express.Router();

// AI model text generation
router.post("/", LLM_API_CONTROLLER.AIGeneration);

module.exports = router;