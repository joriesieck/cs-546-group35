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

// Route to display the single question with answers page
router.get("/:id", async (req, res) => {
	let id = req.params.id;
	// input checks
	try {
		id = ObjectID(id);
	} catch (e) {
		res.status(400).json({error: "Invalid question ID provided"});
	}
	// get the question and its answers
	let singleQuestion = await questionData.getQuestionById(id);
	let answerList = singleQuestion.answers;
	let monthPosted;
	let dayPosted;
	let yearPosted;
	let fullDatePosted;

	// format the date
	for(let i = 0; i < answerList.length; i++) {
		monthPosted = answerList[i].date.getMonth() + 1;
		dayPosted = answerList[i].date.getDate() ;
		yearPosted = answerList[i].date.getFullYear();
		fullDatePosted = `${monthPosted}/${dayPosted}/${yearPosted}`;
		answerList[i].date = fullDatePosted;
	}

	if(answerList.length > 0) {
		for(let i = 0; i < answerList.length; i++) {
			let username = await userData.getUserById(answerList[i].userId);
			answerList[i].username = username.username;
		}
	}

	// render the appropriate page, depending on whether user is logged in
	if(!!req.session.user === false) {
		return res.render("answers/answers-page", {
			title: "Answers",
			loggedIn: !!req.session.user,
			question: singleQuestion,
			answers: answerList
		});
	}

	if(!!req.session.user === true) {
		return res.render("answers/answers-page", {
			title: "Answers",
			loggedIn: !!req.session.user,
			question: singleQuestion,
			answers: answerList,
			isTutor: req.session.user.isTutor
		});
	}
});

// Route to ask a new question page
router.get("/post-question", async (req, res) => {
	if (req.session.user) {
		if(req.session.user.isTutor === true) {
			//return res.status(401).json({error: "Please create a student account to ask a question!"});
			return res.render("questions/ask-question", {title: "Something Went Wrong", error: true, errorMessage: `Please create a student account to ask a question!`, loggedIn:true, isTutor: req.session.user.isTutor});
		} 
		return res.render("questions/ask-question", {
			title: "Ask a Question",
			loggedIn: true,
			isTutor: req.session.user.isTutor
		});
	}
	res.redirect("/login");
});

// Route to create a new answer page
router.get("/:id/post-answer", async (req, res) => {
	if (req.session.user) {
		if(req.session.user.isTutor === false) {
			return res.render("answers/create-answer", {
				title: "Something went wrong",
				error: true,
				errorMessage: `Only tutors can answer questions!`,
				loggedIn: true,
				isTutor: req.session.isTutor
			});
		} else {
			let questionID = req.params.id
			questionID = ObjectID(questionID);
			const question = await questionData.getQuestionById(questionID);
			let questionTitle = question.title;
			let questionBody = question.questionBody;
			return res.render("answers/create-answer", {
				title: "Create an Answer",
				questionTitle: questionTitle,
				questionBody: questionBody,
				loggedIn: true,
				isTutor: req.session.user.isTutor,
				questionId: req.params.id
			});
		}
	} 
	res.redirect("/login");
});

// Route for posting a new question
router.post("/post-question", async (req, res) => {
	if (req.session.user) {
		if(req.session.user.isTutor === true) {
			return res.status(401).json({error: "Please create a student account to ask a question!"});
		} 
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
			// let questionId = [newQuestion._id];
			// const userQuestionObj = {
			// 	id: currentUserId,
			// 	questionIDs: questionId
			// };
			// await userData.updateUser(userQuestionObj);
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

// Route to post a new answer
router.post("/post-answer", async (req, res) => {
	if (req.session.user) {
		// get the answer and the questionId
		let answerBody = xss(req.body.answerBody);
		let questionId = xss(req.body.questionId);

		// check inputs
		if (createHelper(answerBody) === false) {
			res.status(400).json({
				error: "Error: Answer body must be provided and of proper type",
			});
			return;
		}
		if (!answerBody) {
			res.status(400).json({ error: "You must provide an answer body" });
			return;
		}
		var regex = /(<([^>]+)>)/gi;
		answerBody = answerBody.replace(regex, "");

		// check questionId existence
		if (!questionId) {
			res.status(400).json({error: "Missing Question Id"});
			return;
		}

		// get the current user
		let currentUser = await userData.getUserByUsername(
			req.session.user.username
		);
		let currentUserId = currentUser._id;

		// convert questionId to an ObjectId, erroring if it's invalid
		try {
			questionId = ObjectID(questionId);
		} catch (e) {
			res.status(400).json({error: "Invalid Question Id"});
			return;
		}

		// create the answer
		try {
			const newAnswer = await questionData.createAnswer(
				currentUserId,
				answerBody,
				questionId
			);

			if(newAnswer) {
				res.status(201).json({ message: "success", questionId });
			}
		} catch (e) {
			res.status(500).json({ error: e });
		}
	} else {
		res.sendStatus(403);
	}
});

// Route to edit a question page
router.get("/:id/edit-question", async (req, res) => {
	try {
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
			//return res.status(401).json({error: "Unathorized access!"});
			return res.status(401).render("questions/edit-question", {title: "Something Went Wrong", error: true, errorMessage: `Unauthorized access`, loggedIn:true, isTutor: req.session.user.isTutor});
		} 
		if(!req.session.user) {
			return res.redirect("/login");
		}
	} catch(e) {
		if (req.session.user) {
			if(req.session.user.isTutor === false){
				return res.status(401).render("questions/edit-question", {title: "Something Went Wrong", error: true, errorMessage: `Unauthorized access`, loggedIn:true, isTutor: req.session.user.isTutor});
			} else {
				return res.status(401).render("questions/edit-question", {title: "Something Went Wrong", error: true, errorMessage: `No question with this ID. Please check the question you are trying to edit.`, loggedIn:true, isTutor: req.session.user.isTutor});
			}
		} 
	}
});

router.put("/:id/edit-question", async (req, res) => {
	if (req.session.user && req.session.user.isTutor === false) {
		return res.status(401).json({error: "Unathorized access!"});
	} 
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
			res.status(404).json({ error: "Question not found" });
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

			let currentUserQuestionIDs = currentUser.questionIDs;
			for(let i = 0; i < currentUserQuestionIDs.length; i++) {
				currentUserQuestionIDs[i] = currentUserQuestionIDs[i].toString();
			}
			if(currentUserQuestionIDs.includes(req.params.id) === false) {
				console.log("hi")
				await userData.updateUser(userQuestionObj);
			}

			if(updatedQuestion) {
				res.status(201).json({ message: "success" });
			}
		} catch (e) {
			res.status(500).json({ error: e });
		}
	}
});

// Route to edit an answer page
router.get("/:id/edit-answer", async (req, res) => {
	try {
		let currentUser = await userData.getUserByUsername(req.session.user.username);
		let answerUserId = currentUser.userId;
		if (req.session.user && req.session.user.isTutor && answerUserId === true) {
			let answerID = req.params.id
			answerID = ObjectID(answerID);
			const oldAnswer = await questionData.getAnswerById(answerID);
			let oldAnswerBody = oldAnswer.answerBody;
			return res.render("answers/edit-answer", {
				title: "Edit Your Answer",
				loggedIn: true,
				oldBody: oldAnswerBody
			});
		}
		if (req.session.user && req.session.user.isTutor && answerUserId === false) {
			res.status(401).json({error: "Unathorized access!"});
		} 
		if(!req.session.user) {
			res.redirect("/login");
		}
	} catch(e) {
		let currentUser = await userData.getUserByUsername(req.session.user.username);
		let answerUserId = currentUser.userId;
		if (req.session.user) {
			if(req.session.user.isTutor && answerUserId === false){
				return res.status(401).render("answers/edit-answer", {title: "Something Went Wrong", error: true, errorMessage: `Unauthorized access`, loggedIn:true, isTutor: req.session.user.isTutor});
			} else {
				return res.status(401).render("answers/edit-answer", {title: "Something Went Wrong", error: true, errorMessage: `No answer with this ID. Please check the answer you are trying to edit.`, loggedIn:true, isTutor: req.session.user.isTutor});
			}
		} 
	}
});

router.put("/:id/edit-answer", async (req,res) => {
	let currentUser = await userData.getUserByUsername(req.session.user.username);
	let answerUserId = currentUser.userId;
	if (req.session.user && req.session.user.isTutor && answerUserId === false) {
		return res.status(401).json({error: "Unathorized access!"});
	}
	if (req.session.user && req.session.user.isTutor && answerUserId === true) {
		let answerInfo = xss(req.body);
		let answerBody = xss(req.body.answerBody);
		let updatedAnswerObj = {};

		if(!answerInfo) {
			res.status(400).json({error: "You must provide data to update your answer"});
			return;
		}
		if(createHelper(answerBody) === false) {
			res.status(400).json({ error: "Error: Answer body must be provided and of proper type" });
			return;
		}

		if(
			!answerBody
		) {
			res.status(400).json({ error: "You must supply the answer body" });
			return;
		}

		try {
			let answerID = req.params.id
			answerID = ObjectID(answerID);
			const oldAnswer = await questionData.getAnswerById(answerID);
			updatedAnswerObj.userId = oldAnswer.userId;
			updatedAnswerObj.answerBody = answerBody;
			updatedAnswerObj.datePosted = oldAnswer.datePosted;
			updatedAnswerObj.answers = oldAnswer.answers;
		} catch (e) {
			res.status(404).json({ error: "Answer not found" });
			return;
		}

		try {
			let answerID = req.params.id
			const updatedAnswer = await questionData.updateAnswer(
				answerID,
				updatedAnswerObj
			);

			let currentUserId = currentUser._id;
			let answerIdArr = [ObjectID(req.params.id)];
			const userAnswerObj = {
				id: currentUserId,
				answerIDs: answerIdArr
			};

			let currentUserAnswerIDs = currentUser.answerIDs;
			for (let i = 0; i < currentUserAnswerIDs.length; i++) {
				currentUserAnswerIDs[i] = currentUserAnswerIDs[i].toString();
			}
			if (currentUserAnswerIDs.includes(req.params.id) === false) {
				console.log("hi");
				await userData.updateUser(userAnswerObj);
			}

			if(updatedAnswer) {
				res.status(201).json({ message: "success" });
			}
		} catch (e) {
			res.status(500).json({ error: e });
		}
	}
});

module.exports = router;
