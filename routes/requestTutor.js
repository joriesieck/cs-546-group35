// import express and xss
const express = require('express');
const router = express.Router();
const xss = require('xss');
// import data
const userData = require('../data/users');

// render the page
router.get('/', async (req, res) => {
	// if user is not logged in, redirect to login page
	if (!req.session.user) {
		return res.redirect('/login');
	}

	// get the user object from the database
	let user;
	try {
		user = await userData.getUserByUsername(req.session.user.username);
	} catch (e) {
		return res.render('users/request-tutor', {title: "Something Went Wrong", error: true, errorMessage: `Sorry, something went wrong while retrieving your tutors: ${e}`, loggedIn:true});
	}
	

	// get the user objects for all of the user's related tutors
	let possibleTutors;
	try {
		possibleTutors = await userData.getRelatedUsers(user._id);
	} catch (e) {
		return res.render('users/request-tutor', {title: "Something Went Wrong", error: true, errorMessage: `Sorry, something went wrong while retrieving your tutors: ${e}`, loggedIn:true});
	}

	// filter out tutors with 10 or more tutees
	possibleTutors = possibleTutors.filter((tutor) => tutor.tutorList.length < 10);

	// for each remaining tutor, get name, username, and subjects
	const tutorList = [];
	possibleTutors.forEach((tutor) => tutorList.push({name: `${tutor.name.firstName} ${tutor.name.lastName}`, username: tutor.username, subjects: tutor.relevantSubjects}));

	// render the page with the tutorList
	res.render('users/request-tutor', {title: "Request a Tutor", tutorList, hasTutors:!!tutorList, loggedIn:true});
});

// handle tutor request
router.post('/', async (req, res) => {
	// if user is not logged in, redirect to login page
	if (!req.session.user) {
		return res.redirect('/login');
	}

	// get the username of the requested tutor from the request body
	const requestedTutor = xss(req.body.requestedTutor);

	// if no tutor was provided or requestedTutor is not a string, return an error
	if (!requestedTutor || typeof requestedTutor !== 'string') {
		res.status(400).json({error: 'Please select a tutor.'});
		return;
	}

	// get the requestedTutor's user object
	let tutor;
	try {
		tutor = await userData.getUserByUsername(requestedTutor);
	} catch (e) {
		res.status(400).json({error: `Sorry, something went wrong: ${e}`});
		return;
	}

	// return success and the tutor's email
	res.status(200).json({message:'success',tutorEmail:tutor.email});
	return;
})

module.exports = router;
