const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createPlan, listMyPlans, readResidentialPlan, readIPv6Plan,readDatacenterPlan, readMobilePlan, readISPPlan, listPlansByUser, ipv6Whitelist, extendPlanController } = require('../controllers/purchaseController');

const router = express.Router();
router.use(protect);

router.post('/getplan/:option', createPlan);
router.get('/my-plans', listMyPlans);
router.get('/plan/residential/:planId', readResidentialPlan);
router.get('/plan/ipv6/:planId', readIPv6Plan);
router.get('/plan/datacenter/:planId', readDatacenterPlan);
router.get('/plan/mobile/:planId', readMobilePlan);
router.get('/plan/isp/:planId', readISPPlan);
router.get('/plans-by-user/:userId', protect, listPlansByUser);
router.post('/plan/ipv6/whitelist', ipv6Whitelist);
router.patch('/plan/extend', extendPlanController);

module.exports = router;
