const express = require('express');
const router = express.Router();

// login page
/* when client calls address /welcome, the server renders
welcome.ejs page */
router.get('/', (req,res) => {
    res.render('welcome');
});

// register page
router.get('/register', (req,res) => {
    res.render('register');
});

// Export the router instance so that it can be used in other files.
module.exports = router;
