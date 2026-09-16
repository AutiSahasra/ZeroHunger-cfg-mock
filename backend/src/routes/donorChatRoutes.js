const express = require('express');
const router = express.Router({ mergeParams: true });
const { getMessages, sendMessage } = require('../controllers/donorChatController');
const { protect, requireDonor } = require('../middlewares/auth');

router.use(protect);
router.use(requireDonor);

router.route('/')
  .get(getMessages)
  .post(sendMessage);

module.exports = router;
