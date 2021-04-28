const express = require('express');
const router = express.Router();
const xss = require('xss');
const questionData = require('../data/questions');

// Route to display all questions asked
router.get('/', async (req, res) => {
    let questionList = await questionData.getQuestions();
})

// Route to ask a new question page
router.get('/post',(req,res) => {
	if (!req.session.user) {
		res.render('users/new-landing',{title:"Create an Account"});
	}
	return res.render('questions/ask-question',{title:"Ask a Question"});
});

// Route for posting a new question
router.post('/',(req,res) => {
	let title = xss(req.body.title);
    let questionBody = xss(req.body.questionBody);
    let tags = xss(req.body.tags);
    
});