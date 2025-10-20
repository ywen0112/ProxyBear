const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getUserInfo,
  updateBasicInfo,
  updatePassword,
  upsertBillingInfo,
  createSubuser,
  getSubuserList,
  deleteSubuser,
  spend,
} = require('../controllers/userController');

const router = express.Router();
router.use(protect);

router.patch('/me', updateBasicInfo);             
router.post('/me/password', updatePassword);       // POST  /api/users/me/password
router.post('/me/billing', upsertBillingInfo);     // POST  /api/users/me/billing

router.post('/me/subusers', createSubuser);                // POST   /api/users/me/subusers
router.get('/me/subusers', getSubuserList);                // GET    /api/users/me/subusers
router.delete('/me/subusers/:subId', deleteSubuser);       // DELETE /api/users/me/subusers/:subId

router.post('/spend', spend);                       // POST /api/users/spend

router.get('/:id', getUserInfo);

module.exports = router;
