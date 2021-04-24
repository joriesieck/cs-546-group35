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

	res.render('users/login',{title:"Login as Student",isTutor:0});
});

// render the login tutor page
router.get('/tutor', async (req,res) => {
	// if user is already logged in, redirect to their profile
	if (req.session.user) {
		return res.redirect('/profile');
	}

	res.render('users/login',{title:"Login as Tutor",isTutor:1});
});

// log the user in
router.post('/do-login', async (req,res) => {
	// get the username and password from the request body, one at a time because of xss
	let username = xss(req.body.username);
	let password = xss(req.body.password);

	/* error checking - no point in querying database if missing/invalid inputs */
	// make sure username and password exist
	try {
		if (username===undefined || username===null) throw 'username';
		if (password===undefined || password===null) throw 'password';
	} catch (e) {
		res.status(400).json({error: `Error in POST /login/do-login: missing input "${e}"`});
		return;
	}
	
	// make sure username and password are strings
	try {
		if (typeof username !== 'string') throw 'username';
		if (typeof password !== 'string') throw 'password';
	} catch (e) {
		res.status(400).json({error: `Error in POST /login/do-login: invalid type for input "${e}"`});
		return;	
	}

	// trim and check for all whitespace
	try {
		username = username.trim();
		if (username==='') throw 'username';
		password = password.trim();
		if (password==='') throw 'password';
	} catch (e) {
		res.status(400).json({error: `Error in POST /login/do-login: empty input "${e}"`});
		return;	
	}

	// make sure username does not contain any whitespace
	const usernameRE = /[ 	]/;
	if (usernameRE.test(username)) {
		res.status(400).json({error:'Username must not contain any whitespace characters.'});
		return;
	}

	// get hashedPassword for the user from the database
	let hashedPassword;
	try {
		({hashedPassword} = await userData.getUserByUsername(username));
		// const user = userData.getUserByUsername(username);
		// console.log(user);
		// return;
		if (!hashedPassword) {
			console.log('something went wrong....');
			return;
		}
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
		req.session.user = {username};
		res.status(200).json({message:'success'});
	} else {
		// we don't want to reveal that it was specifically the password, so error with 'invalid username or password'
		res.status(400).json({error: 'Invalid username or password.'});
		return;
	}
});

module.exports = router;