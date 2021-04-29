const express = require('express');
const router = express.Router();
const xss = require('xss');
const questionData = require('../data/questions');

function createHelper(string) {
    if(string === undefined || typeof string !== 'string' || string.trim().length === 0) {
        return false;
    } else {
        return true;
    }
}

// Route to display all questions asked
router.get('/', async (req, res) => {
    let questionList = await questionData.getQuestions();
})

// Route to ask a new question page
router.get('/post',(req,res) => {
	// if (!req.session.user) {
	// 	res.render('users/new-landing',{title:"Create an Account"});
	// }
	return res.render('questions/ask-question',{title:"Ask a Question"});
});

// Route for posting a new question
router.post('/post', async (req,res) => {
	let questionInfo = xss(req.body);
	let title = xss(req.body.title);
    let questionBody = xss(req.body.questionBody);
    let tags = xss(req.body.tags);
    
	console.log(questionInfo)
	console.log(title)
	console.log(questionBody)
	console.log(tags)

	if (!questionInfo) {
		res.status(400).json({error: "You must provide data to ask a question"});
		return;
	}

	if(createHelper(title) === false) {
		res.status(400).json({ error: "Error: Title must be provided and proper type" });
		return;
	}

	if(createHelper(questionBody) === false) {
		res.status(400).json({ error: "Error: Question body must be provided and proper type" });
		return;
	}

	if(tags === undefined || Array.isArray(tags) === false || tags === 0) {
		res.status(400).json({ error: "Error: Tag(s) must be provided and proper type" });
		return;
	}
	for(let i = 0; i < tags.length; i++) {
        if(createHelper(tags[i]) === false) {
			res.status(400).json({ error: "Error: All tags must be strings/non all empty space string" });
			return;
		}
	}

	if (!title) {
		res.status(400).json({ error: "You must provide a title" });
		return;
	}

	if (!questionBody) {
		res.status(400).json({ error: "You must provide a question body" });
		return;
	}

	if (!tags) {
		res.status(400).json({ error: "You must provide atleast one tag" });
		return;
	}

	try {
		const newQuestion = await questionData.createQuestion(
			
			title,
			questionBody,
			tags
		);
		res.json(newQuestion);
	} catch (e) {
		res.status(500).json({ error: e });
	}
});

module.exports = router;