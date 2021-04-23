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
	// get the username and password from the request body
	const {username, password} = req.body;

	// get hashedPassword for the user from the database
	const {hashedPassword} = userData.getUserByUsername(username);
	// if no user was found, render an error
	// TODO AJAX

	// compare passwords using bcrypt
	const match = await bcrypt.compare(password,hashedPassword);

	// if the passwords match, set cookie and redirect to home
		// TODO should i include more stuff like name here?
	if (match) {
		req.session.user = {username};
		res.redirect('/');
	} else {
		// show an error
		// TODO AJAX
	}
});

// log the user out
router.get('/logout', async (req, res) => {
	// expire the cookie
	req.session.destroy();
	// redirect to the homepage
	res.redirect('/');
});

module.exports = router;