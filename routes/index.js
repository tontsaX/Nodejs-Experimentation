const express = require('express');
const router = express.Router();

const {ensureAuthenticated} = require("../config/auth.js");

/* when client calls address /welcome, the server renders
welcome.ejs page */
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
