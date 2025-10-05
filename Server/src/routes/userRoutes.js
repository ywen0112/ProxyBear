const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  updateBasicInfo,
  updatePassword,
  upsertBillingInfo,
  getUserInfo  
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.put("/basic", protect, updateBasicInfo);
router.put("/password", protect, updatePassword);
router.post("/billing", protect, upsertBillingInfo);
router.get("/:id", protect, getUserInfo);

module.exports = router;