const express = require('express');
const router = express.Router();

// how to get type of user?

// render the login landing page
router.get('/',(req,res) => {
	res.render('users/login-landing',{title:"Login"});
});

// render the login student page
router.get('/student',(req,res) => {
	res.render('users/login',{title:"Login as Student",isTutor:0});
});

// render the login tutor page
router.get('/tutor',(req,res) => {
	res.render('users/login',{title:"Login as Tutor",isTutor:1});
});

module.exports = router;