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
	// if user is a tutor, display an error
	if (req.session.user.isTutor) return res.render('users/request-tutor', {title: "Something Went Wrong", error: true, errorMessage: `Sorry, tutors may not request other tutors. Please create a Student Account if you would like private tutoring.`, loggedIn:true});

	// get the user object from the database
	let user;
	try {
		user = await userData.getUserByUsername(req.session.user.username);
	} catch (e) {
		return res.render('users/request-tutor', {title: "Something Went Wrong", error: true, errorMessage: `Sorry, something went wrong while retrieving potential tutors: ${e}`, loggedIn:true});
	}
	

	// get the user objects for all tutors with less than 10 tutees
	const possibleTutors = await userData.getAllEligibleTutors();

	// for each remaining tutor, get name, username, and subjects
	const tutorList = [];
	possibleTutors.forEach((tutor) => tutorList.push({name: `${tutor.name.firstName} ${tutor.name.lastName}`, username: tutor.username, subjects: tutor.relevantSubjects}));

	// render the page with the tutorList
	res.render('users/request-tutor', {title: "Request a Tutor", tutorList, hasTutors:tutorList.length>0, loggedIn:true});
});

// handle tutor request
router.post('/', async (req, res) => {
	// if user is not logged in, redirect to login page
	if (!req.session.user) {
		return res.redirect('/login');
	}
	// if user is a tutor, display an error
	if (req.session.user.isTutor) return res.render('users/request-tutor', {title: "Something Went Wrong", error: true, errorMessage: `Sorry, tutors may not request other tutors. <a href="/new-user/student"><button class="new-user-landing">Create a Student Account</button></a> if you would like private tutoring.`, loggedIn:true});

	// get the username of the requested tutor from the request body
	const requestedTutor = xss(req.body.requestedTutor);

	// if no tutor was provided or requestedTutor is not a string, return an error
	if (!requestedTutor || typeof requestedTutor !== 'string') {
		res.status(400).json({error: 'Please select a tutor.'});
		return;
	}

	// get the user object for the user
	let user;
	try {
		user = await userData.getUserByUsername(req.session.user.username);
	} catch (e) {
		res.status(400).json({error: `Sorry, something went wrong: ${e}`});
		return;
	}
	// get the user object for the tutor
	let tutor;
	try {
		tutor = await userData.getUserByUsername(requestedTutor);
	} catch (e) {
		res.status(400).json({error: `Sorry, something went wrong: ${e}`});
		return;
	}

	// if the tutor is in the user's tutorList or vice versa, error
	for (tutorId of user.tutorList) {
		if (tutorId.equals(tutor._id)) {
			res.status(400).json({error: `Sorry, ${tutor.username} is already in your tutor list.`});
			return;
		}
	}
	for (studentId of tutor.tutorList) {
		if (studentId.equals(user._id)) {
			res.status(400).json({error: `Sorry, you are already in ${tutor.username}'s tutor list.`});
			return;
		}
	}


	// add the user to the requestedTutor's tutorList and vice versa
	try {
		tutor = await userData.updateUser({id: tutor._id, tutorList: [user._id]});
	} catch (e) {
		res.status(400).json({error: `Sorry, something went wrong: ${e}`});
		return;
	}
	try {
		user = await userData.updateUser({id: user._id, tutorList: [tutor._id]});
	} catch (e) {
		res.status(400).json({error: `Sorry, something went wrong: ${e}`});
		return;
	}

	// return success and the tutor's email
	res.status(200).json({message:'success',tutorEmail:tutor.email});
	return;
})

module.exports = router;
