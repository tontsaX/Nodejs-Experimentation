const express = require('express');
const router = express.Router();

router.get('/games', (req,res) => {
    res.render('games');
});

module.exports = router;