const express = require('express');
const router = express.Router();

// render the create user landing page
router.get('/',(req,res) => {
	res.render('users/new-landing',{title:"Create an Account"});
});

// render the create student user page
router.get('/student',(req,res) => {
	res.render('users/new',{title:"Create a Student Account",isTutor:0});
});

// render the create tutor user page
router.get('/tutor',(req,res) => {
	res.render('users/new',{title:"Create a Tutor Account",isTutor:1});
});

// just for testing purposes - render the testing creation page
router.get('/student-test',(req,res) => {
	res.render('dummy/test-new',{title: "Create an Account", isTutor:0});
});
router.get('/tutor-test',(req,res) => {
	res.render('dummy/test-new',{title: "Create an Account", isTutor:1});
});

module.exports = router;