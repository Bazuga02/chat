const express = require("express");
const llmController = require("../controllers/llmController");

const router = express.Router();

router.post("/response", llmController.getResponse);

module.exports = router;
