const express = require('express');
const router = express.Router();
const xss = require('xss');
const questionData = require('../data/questions');
const userData = require('../data/users');

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
router.get('/post',async (req,res) => {
	if (req.session.user) {
		return res.render('questions/ask-question',{title:"Ask a Question", loggedIn: true});
 	}
	 res.redirect('/login');
});

// Route for posting a new question
router.post('/post', async (req,res) => {
	let questionInfo = xss(req.body);
	let title = xss(req.body.questionTitle);
    let questionBody = xss(req.body.questionBody);
    let tags = xss(req.body.questionTags);

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

	if(createHelper(tags) === false) {
		res.status(400).json({ error: "Error: Tag(s) must be provided and proper type" });
		return;
	}
	
	if(createHelper(tags) === true) {
		tags = tags.split(',');
		for(let i = 0; i < tags.length; i++) {
			tags[i] = tags[i].trim();
            if(createHelper(tags[i]) === false) {
				res.status(400).json({ error: "Error: Each tag must be a string and non all empty space string" });
			}
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

	var regex = /(<([^>]+)>)/ig;
    title = title.replace(regex, "");
	questionBody = questionBody.replace(regex, "");
	for(let i = 0; i < tags.length; i++) {
		tags[i] = tags[i].replace(regex, "");
	}

	let currentUser = await userData.getUserByUsername(req.session.user.username);
	let currentUserId = currentUser._id;

	try {
		const newQuestion = await questionData.createQuestion(
			currentUserId,
			title,
			questionBody,
			tags
		);
		if(newQuestion) {
			res.status(201).json({message:'success'});
		}
	} catch (e) {
		res.status(500).json({ error: e });
	}
});

module.exports = router;