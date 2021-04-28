// import express, xss, and bcrypt
const express = require('express');
const router = express.Router();
const xss = require('xss');
const bcrypt = require('bcryptjs');
// import data
const userData = require('../data/users');

// set number of salt rounds
const saltRounds = 16;

// render the create user landing page
router.get('/',(req,res) => {
	// if user is already logged in, redirect to their profile
	if (req.session.user) {
		return res.redirect('/profile');
	}
	res.render('users/new-landing',{title:"Create an Account", loggedIn: false});
});

// render the create student user page
router.get('/student',(req,res) => {
	// if user is already logged in, redirect to their profile
	if (req.session.user) {
		return res.redirect('/profile');
	}
	res.render('users/new',{title:"Create a Student Account",isTutor:1,subjReq:false, loggedIn: false});
});

// render the create tutor user page
router.get('/tutor',(req,res) => {
	// if user is already logged in, redirect to their profile
	if (req.session.user) {
		return res.redirect('/profile');
	}
	res.render('users/new',{title:"Create a Tutor Account",isTutor:2,subjReq:true, loggedIn: false});
});

// post to create user
router.post('/',async (req,res) => {
	// if user is already logged in, redirect to their profile
	if (req.session.user) {
		return res.redirect('/profile');
	}
	// get inputs from req body, one at a time because of xss
	let firstName = xss(req.body.firstName);
	let lastName = xss(req.body.lastName);
	let email = xss(req.body.email);
	let username = xss(req.body.username);
	let password = xss(req.body.password);
	let year = parseInt(xss(req.body.year));
	let subjects = xss(req.body.subjects);
	let isTutor = xss(req.body.isTutor);	// '1' means student, '2' means student

	/* error check inputs */
	// all inputs must exist
	try {
		if (firstName===undefined || firstName===null) throw 'firstName';
		if (lastName===undefined || lastName===null) throw 'lastName';
		if (email===undefined || email===null) throw 'email';
		if (username===undefined || username===null) throw 'username';
		if (password===undefined || password===null) throw 'password';
		if (year===undefined || year===null) throw 'year';
		if (subjects===undefined || subjects===null) throw 'subjects';
		if (isTutor===undefined || isTutor===null) throw 'isTutor';
	} catch (e) {
		res.status(400).json({error: `Error in POST /new-user: missing input "${e}"`});
		return;
	}

	// isTutor = '1' means false/student, '2' means true/tutor (because of the way xss parses the data)
	if (isTutor!=='1' && isTutor!=='2') {
		res.status(400).json({error: 'Error in POST /new-user: invalid argument for input "isTutor"'});
		return;
	}
	isTutor = isTutor==='2';	// convert to a boolean

	// all inputs must be of the correct type - all strings at this point except for year (number) and isTutor (boolean)
	try {
		if (typeof firstName !== 'string') throw 'firstName';
		if (typeof lastName !== 'string') throw 'lastName';
		if (typeof email !== 'string') throw 'email';
		if (typeof username !== 'string') throw 'username';
		if (typeof password !== 'string') throw 'password';
		if (typeof year !== 'number' || isNaN(year)) throw 'year';
		if (typeof subjects !== 'string') throw 'subjects';
		if (typeof isTutor !== 'boolean') throw 'isTutor';
	} catch (e) {
		res.status(400).json({error: `Error in POST /new-user: invalid type for input "${e}"`});
		return;
	}

	// all inputs except year, isTutor, and subjects if student must not be all whitespace
	// make email and username all lowercase
	try {
		firstName = firstName.trim();
		if (firstName==='') throw 'firstName';
		lastName = lastName.trim();
		if (lastName==='') throw 'lastName';
		email = email.trim().toLowerCase();
		if (email==='') throw 'email';
		username = username.trim().toLowerCase();
		if (username==='') throw 'username';
		password = password.trim();
		if (password==='') throw 'password';
		subjects = subjects.trim();
		if (isTutor && subjects==='') throw 'subjects';
	} catch (e) {
		res.status(400).json({error: `Error in POST /new-user: empty (whitespace) input "${e}"`});
		return;
	}

	// first and last name
	try {
		// must be <= 254 characters
		if (firstName.length > 254) throw 'more than 254 characters';
		// must be alphabet characters, ', -, or space
		const nameRE = /^([a-zA-Z'\- ]+)$/;
		if (!nameRE.test(firstName)) throw 'invalid characters'
	} catch (e) {
		res.status(400).json({error: `Error in POST /new-user: ${e} for input "firstName"`});
		return;
	}
	try {
		// must be <= 254 characters
		if (lastName.length > 254) throw 'more than 254 characters';
		// must be alphabet characters, ', -, or space
		const nameRE = /^([a-zA-Z'\- ]+)$/;
		if (!nameRE.test(lastName)) throw 'invalid characters'
	} catch (e) {
		res.status(400).json({error: `Error in POST /new-user: ${e} for input "lastName"`});
		return;
	}
	
	// email
	try {
		// must be less than or equal to 254 characters
		if (email.length > 254) throw 'more than 254 characters';
		// must be in correct email format
		// regex source: https://www.geeksforgeeks.org/write-regular-expressions/
		const emailRE = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
		if (!emailRE.test(email)) throw 'invalid format';	
	} catch (e) {
		res.status(400).json({error: `Error in POST /new-user: ${e} for input "email"`});
		return;
	}
	
	// username
	try {
		// must be less than or equal to 254 characters
		if (username.length > 254) throw 'more than 254 characters';
		// can only contain alphabet characters, numbers, -, _, and .
		const usernameRE = /^([a-zA-Z0-9\-\_\.]+)$/;
		if (!usernameRE.test(username)) throw 'invalid characters';
	} catch (e) {
		res.status(400).json({error: `Error in POST /new-user: ${e} for input "username"`});
		return;
	}
	
	// password
	try {
		// must be at least 8 characters
		if (password.length < 8) throw 'less than 8 characters';
		// must be less than or equal to 254 characters
		if (password.length > 254) throw 'more than 254 characters';
		// must contain at least one letter and one number
		const passwordNumRE = /[0-9]+/;
		const passwordAlphRE = /[a-zA-Z]+/;
		if (!passwordNumRE.test(password) || !passwordAlphRE.test(password)) throw 'missing required characters';
	} catch (e) {
		res.status(400).json({error: `Error in POST /new-user: ${e} for input "password"`});
		return;
	}

	// year
	try {
		// year must be >= 0 and of the form YYYY
		if (year < 0) throw 'invalid year';
		const yearRE = /^\d\d\d\d$/;
		if (!yearRE.test(year)) throw 'invalid format';
	} catch (e) {
		res.status(400).json({error: `Error in POST /new-user: ${e} for input "year"`});
		return;
	}

	// subjects
	if (subjects) {
		// it was passed in and isn't the empty string, so the input must be valid even if it's not required for the usertype
		try {
			// convert to an array deliminated by ','
			subjects = subjects.split(',');
			// must contain at least one element
			if (subjects.length<=0) throw 'empty input';
			// must contain only strings
			if (!subjects.every((subj) => typeof subj === 'string')) throw 'invalid element type';
			// must contain only non-whitespace strings
			subjects = subjects.map((subj) => subj.trim());	// trim strings
			if (!subjects.every((subj) => subj!=='')) throw 'empty elements';
		} catch (e) {
			res.status(400).json({error: `Error in POST /new-user: ${e} for "subjects"`});
			return;
		}
	} else {
		// it's the empty string but not required, so set to []
		subjects = [];
	}

	// username and email cannot already be in the database
	try {
		const userByUsername = await userData.getUserByUsername(username);
		if (userByUsername) {
			res.status(400).json({error: 'Error in POST /new-user: username exists'});
			return;
		}
	} catch (e) {
		// if the error isn't user not found, bubble it
		if (!`${e}`.includes('not found')) {
			res.status(400).json({error: e});
			return;
		}
	}
	try {
		const userByEmail = await userData.getUserByEmail(email);
		if (userByEmail) {
			res.status(400).json({error: 'Error in POST /new-user: email exists'});
			return;
		}
	} catch (e) {
		// if the error isn't user not found, bubble it
		if (!`${e}`.includes('not found')) {
			res.status(400).json({error: e});
			return;
		}
	}

	/* hash password and pass to database */
	bcrypt.hash(password,saltRounds, async (err,hash) => {
		if (err) {
			// just bubble the error
			res.status(400).json({error: err});
			return;
		}
		
		// pass to database & error check results 
		try {
			const user = await userData.createUser({
				firstName,
				lastName,
				email,
				username,
				hashedPassword:hash,
				year,
				relevantSubjects:subjects,
				isTutor
			});
			// if user was successfully created, log them in and send their username back to the client
			if (user) {
				req.session.user = {username};
				res.status(201).json({message:'success'});
				// redirect to home
				// res.redirect('/');
			}
		} catch (e) {
			// just bubble the error
			res.status(400).json({error: e});
			return;
		}
	});
})

// just for testing purposes - render the testing creation page
router.get('/student-test',(req,res) => {
	res.render('dummy/test-new',{title: "Create an Account", isTutor:1});
});
router.get('/tutor-test',(req,res) => {
	res.render('dummy/test-new',{title: "Create an Account", isTutor:2});
});

module.exports = router;