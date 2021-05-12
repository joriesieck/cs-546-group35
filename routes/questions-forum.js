const express = require("express");
const router = express.Router();
const xss = require("xss");
const questionData = require("../data/questions");
const userData = require("../data/users");
const { ObjectID } = require('mongodb');

function createHelper(string) {
	if (string === undefined || typeof string !== "string" || string.trim().length === 0) {
		return false;
	} else {
		return true;
	}
}

// Route to display all questions asked
router.get("/", async (req, res) => {
	let questionList = await questionData.getQuestions();
	let monthPosted;
	let dayPosted;
	let yearPosted;
	let fullDatePosted;

	for(let i = 0; i < questionList.length; i++) {
		monthPosted = questionList[i].datePosted.getMonth() + 1;
		dayPosted = questionList[i].datePosted.getDate() ;
		yearPosted = questionList[i].datePosted.getFullYear();
		fullDatePosted = `${monthPosted}/${dayPosted}/${yearPosted}`;
		questionList[i].datePosted = fullDatePosted;

		if(questionList[i].answers.length == 0) {
			questionList[i].answered = "No";
		} 
		if(questionList[i].answers.length > 0) {
			questionList[i].answered = "Yes";
		} 
	}

	if(!!req.session.user === false) {
		return res.render("questions/questions-forum", {
			title: "Question Forum",
			loggedIn: !!req.session.user,
			questions: questionList
		});
	}

	if(!!req.session.user === true) {
		return res.render("questions/questions-forum", {
			title: "Question Forum",
			loggedIn: !!req.session.user,
			questions: questionList,
			isTutor: req.session.user.isTutor
		});
	}

});

// TODO: Route to display single question asked
// router.get("/:id", async (req, res) => {
	
// });

// Route to ask a new question page
router.get("/post", async (req, res) => {
	if (req.session.user) {
		return res.render("questions/ask-question", {
			title: "Ask a Question",
			loggedIn: true,
		});
	}
	res.redirect("/login");
});

// Route for posting a new question
router.post("/post", async (req, res) => {
	if (req.session.user) {
		let questionInfo = xss(req.body);
		let title = xss(req.body.questionTitle);
		let questionBody = xss(req.body.questionBody);
		let tags = xss(req.body.questionTags);

		if (!questionInfo) {
			res.status(400).json({
				error: "You must provide data to ask a question",
			});
			return;
		}

		if (createHelper(title) === false) {
			res.status(400).json({
				error: "Error: Title must be provided and proper type",
			});
			return;
		}

		if (createHelper(questionBody) === false) {
			res.status(400).json({
				error: "Error: Question body must be provided and proper type",
			});
			return;
		}

		if (createHelper(tags) === false) {
			res.status(400).json({
				error: "Error: Tag(s) must be provided and proper type",
			});
			return;
		}

		if (createHelper(tags) === true) {
			tags = tags.split(",");
			for (let i = 0; i < tags.length; i++) {
				tags[i] = tags[i].trim();
				if (createHelper(tags[i]) === false) {
					res.status(400).json({
						error:
							"Error: Each tag must be a string and non all empty space string",
					});
				}
			}
			if(tags.length > 3) {
				res.status(400).json({
					error: "Error: Please provide a maximum of three tags",
				});
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

		var regex = /(<([^>]+)>)/gi;
		title = title.replace(regex, "");
		questionBody = questionBody.replace(regex, "");
		for (let i = 0; i < tags.length; i++) {
			tags[i] = tags[i].replace(regex, "");
		}

		let currentUser = await userData.getUserByUsername(
			req.session.user.username
		);
		let currentUserId = currentUser._id;

		try {
			const newQuestion = await questionData.createQuestion(
				currentUserId,
				title,
				questionBody,
				tags
			);
			let questionId = [newQuestion._id];
			const userQuestionObj = {
				id: currentUserId,
				questionIDs: questionId
			};
			await userData.updateUser(userQuestionObj);
			if(newQuestion) {
				res.status(201).json({ message: "success" });
			}
		} catch (e) {
			res.status(500).json({ error: e });
		}
	} else {
		res.sendStatus(403);
	}
});

// Route to edit a question page
router.get("/:id/edit", async (req, res) => {
	if (req.session.user && req.session.user.isTutor === true) {
		let questionID = req.params.id
		questionID = ObjectID(questionID);
		const oldQuestion = await questionData.getQuestionById(questionID);
		let oldTitle = oldQuestion.title;
		let oldQuestionBody = oldQuestion.questionBody;
		let oldQuestionTags = oldQuestion.tags;
		return res.render("questions/edit-question", {
			title: "Edit a Question",
			loggedIn: true,
			oldTitle: oldTitle,
			oldBody: oldQuestionBody,
			oldTags: oldQuestionTags
		});
	} 
	if (req.session.user && req.session.user.isTutor === false) {
		res.status(401).json({error: "Unathorized access!"});
	} 
	if(!req.session.user) {
		res.redirect("/login");
	}
});

router.put("/:id/edit", async (req, res) => {
	if (req.session.user && req.session.user.isTutor === true) {
		let questionInfo = xss(req.body);
		let title = xss(req.body.questionTitle);
		let questionBody = xss(req.body.questionBody);
		let tags = xss(req.body.questionTags);
		let visibility = xss(req.body.questionVisibility);
		let updatedQuestionObj = {};

		if(!questionInfo) {
			res.status(400).json({error: "You must provide data to update a question"});
			return;
		}
		if(createHelper(title) === false) {
			res.status(400).json({ error: "Error: Title must be provided and proper type" });
			return;
		}
		if(createHelper(questionBody) === false) {
			res.status(400).json({ error: "Error: Title must be provided and proper type" });
			return;
		}
		if(createHelper(tags) === false) {
			res.status(400).json({ error: "Error: Tags must be provided and proper type" });
			return;
		}
		let tagsArray = tags.split(",");
		if(tagsArray === undefined || Array.isArray(tagsArray) === false || tagsArray.length === 0) {
			res.status(400).json({ error: "Error: Failed to put tags into an array" });
			return;
		}
		for(let i = 0; i < tagsArray.length; i++) {
			if(createHelper(tagsArray[i]) === false) {
				res.status(400).json({ error: "Error: All elements in tags array must be strings/non all empty space string" });
				return;
			}
		}
		tags = tagsArray;

		let boolVisiblility;
		if(createHelper(visibility) === false) {
			res.status(400).json({ error: "Error: Question visbility option must be provided and proper type" });
			return;
		} else {
			if(visibility === 'visible') {
				boolVisiblility = true;
			} 
			if(visibility === 'not-visible') {
				boolVisiblility = false;
			} 
		}
		
		if(
			!title ||
			!questionBody ||
			!tags ||
			!visibility
		) {
			res.status(400).json({ error: "You must supply all fields" });
			return;
		}

		try {
			let questionID = req.params.id
			questionID = ObjectID(questionID);
			const oldQuestion = await questionData.getQuestionById(questionID);
			updatedQuestionObj.userId = oldQuestion.userId;
			updatedQuestionObj.title = title;
			updatedQuestionObj.questionBody = questionBody;
			updatedQuestionObj.tags = tags;
			updatedQuestionObj.visible = boolVisiblility;
			updatedQuestionObj.datePosted = oldQuestion.datePosted;
			updatedQuestionObj.answers = oldQuestion.answers;
		} catch (e) {
			res.status(404).json({ error: "Book not found" });
			return;
		}

		try {
			let questionID = req.params.id
			//questionID = ObjectID(questionID);
			const updatedQuestion = await questionData.updateQuestion(
				questionID,
				updatedQuestionObj
			);

			let currentUser = await userData.getUserByUsername(
				req.session.user.username
			);
			let currentUserId = currentUser._id;
			let questionIdArr = [ObjectID(req.params.id)];
			const userQuestionObj = {
				id: currentUserId,
				questionIDs: questionIdArr
			};
			await userData.updateUser(userQuestionObj);

			if(updatedQuestion) {
				res.status(201).json({ message: "success" });
			}
		} catch (e) {
			res.status(500).json({ error: e });
		}
	}
});

module.exports = router;
