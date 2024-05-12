const express = require("express");
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/send",
  authMiddleware.authenticateToken,
  chatController.sendMessage
);
router.get(
  "/:userId/:recipientId",
  authMiddleware.authenticateToken,
  chatController.getMessages
);

module.exports = router;
