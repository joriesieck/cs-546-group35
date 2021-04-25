// import express, xss, and bcrypt
const express = require('express');
const router = express.Router();
const xss = require('xss');
const bcrypt = require('bcryptjs');
// import data
const userData = require('../data/users');

// render the login landing page
router.get('/', async (req,res) => {
	// if user is already logged in, redirect to their profile
	if (req.session.user) {
		return res.redirect('/profile');
	}

	res.render('users/login-landing',{title:"Log In"});
});

// render the login student page
router.get('/student', async (req,res) => {
	// if user is already logged in, redirect to their profile
	if (req.session.user) {
		return res.redirect('/profile');
	}

	res.render('users/login',{title:"Login as Student",isTutor:1});
});

// render the login tutor page
router.get('/tutor', async (req,res) => {
	// if user is already logged in, redirect to their profile
	if (req.session.user) {
		return res.redirect('/profile');
	}

	res.render('users/login',{title:"Login as Tutor",isTutor:2});
});

// log the user in
router.post('/', async (req,res) => {
	// get the username and password from the request body, one at a time because of xss
	let username = xss(req.body.username);
	let password = xss(req.body.password);
	let isTutor = xss(req.body.isTutor);	// '1' = student, '2' = tutor

	/* error checking - no point in querying database if missing/invalid inputs */
	// isTutor = '1' means false/student, '2' means true/tutor
	if (isTutor!=='1' && isTutor!=='2') {
		res.status(400).json({error: 'Error in POST /login: invalid argument for input "isTutor"'});
		return;
	}
	isTutor = isTutor==='2';	// convert to a boolean

	// make sure username and password exist
	try {
		if (username===undefined || username===null) throw 'username';
		if (password===undefined || password===null) throw 'password';
	} catch (e) {
		res.status(400).json({error: `Error in POST /login: missing input "${e}"`});
		return;
	}
	
	// make sure username and password are strings
	try {
		if (typeof username !== 'string') throw 'username';
		if (typeof password !== 'string') throw 'password';
	} catch (e) {
		res.status(400).json({error: `Error in POST /login: invalid type for input "${e}"`});
		return;	
	}

	// trim username, convert to lowercase, check for any whitespace (password should not be trimmed)
	try {
		username = username.trim().toLowerCase();
		if (username==='') throw 'empty';
		const usernameRE = /[ 	]/;
		if (usernameRE.test(username)) throw 'invalid whitespace character in '
	} catch (e) {
		res.status(400).json({error: `Error in POST /login: ${e} input "username"`});
		return;	
	}

	// get hashedPassword and userType for the user from the database
	let hashedPassword, userType;
	try {
		({hashedPassword, userType} = await userData.getUserByUsername(username));
		if (!hashedPassword) throw `No password found for user ${username}.`;	// TODO is this a good message?
		// if userType doesn't match with isTutor, error
		if ((isTutor && userType!=='tutor') || (!isTutor && userType!=='student')) throw `No ${isTutor ? 'tutor' : 'student'} found for this username and password. Try logging in as a ${userType} instead.`;
	} catch (e) {
		// if the error isn't user not found, bubble it
		if (!`${e}`.includes('not found')) {
			res.status(400).json({error: e});
			return;
		}
		// otherwise, we don't want to reveal that it was specifically the username, so error with 'invalid username or password'
		res.status(400).json({error: 'Invalid username or password.'});
		return;
	}

	// compare passwords using bcrypt
	const match = await bcrypt.compare(password,hashedPassword);

	// if the passwords match, set cookie and return success
		// TODO should i include more stuff like name here?
	if (match) {
		req.session.user = {username,isTutor};
		res.status(200).json({message:'success'});
	} else {
		// we don't want to reveal that it was specifically the password, so error with 'invalid username or password'
		res.status(400).json({error: 'Invalid username or password.'});
		return;
	}
});

module.exports = router;