const express = require('express');
const router = express.Router();

router.get('/worm-game', (req,res) => {
    res.render('wormGame');
});

module.exports = router;
