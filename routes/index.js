const express = require('express');
const router = express.Router();

const {ensureAuthenticated} = require("../config/auth.js");

router.get('/', (req,res) => {
    res.render('welcome');
});
/*
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', {
        user: req.user
    });
});
*/
// Export the router instance so that it can be used in other files.
module.exports = router;
