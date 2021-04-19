/**
 * DONT FORGET TO ADD DB STUFF!!
 * 1) check if email already in db
 * 2) check if username already in db
 * 3) hash password
 * 4) store user
 */

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


// post routes
/*
			// must not already be in database
			// email
			const inDB = false;
			if (inDB) throw 'This email address is already associated with an account. Please log in instead.';

			// must not already be in databaase
			// username
			const inDB = false;
			if (inDB) throw 'This username is already associated with an account. Please log in instead.';
*/

module.exports = router;