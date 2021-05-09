const express = require("express");
const router = express.Router();
const xss = require("xss");
const questionData = require("../data/questions");
const userData = require("../data/users");

function createHelper(string) {
	if (string === undefined || typeof string !== "string" || string.trim().length === 0) {
		return false;
	} else {
		return true;
	}
}

function tagsChecker(newArr, oldArr) {
	for (let i = 0; i < newArr.length; i++) {
		if(oldArr.includes(newArr[i]) === false) {
			return false;
		}
	}
	return true;
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
		return res.render("questions/edit-question", {
			title: "Edit a Question",
			loggedIn: true,
		});
	} 
	if (req.session.user && req.session.user.isTutor === false) {
		res.status(401).json({error: "Unathorized access!"});
	} 
	if(!req.session.user) {
		res.redirect("/login");
	}
});

router.patch("/:id/edit", async (req, res) => {
	if (req.session.user && req.session.user.isTutor === true) {
		let questionInfo = xss(req.body);
		let title = xss(req.body.questionTitle);
		let questionBody = xss(req.body.questionBody);
		let tags = xss(req.body.questionTags);
		let updatedQuestion = {};

		if (Object.keys(questionInfo).length === 0) {
			res.status(400).json({error: "Error: At least one field should be supplied"});
		}

		try {
			const oldQuestion = await questionData.getQuestionById(req.params.id);

			if(title && title !== oldQuestion.title) {
				if(createHelper(title) === false) {
					res.status(400).json({ error: "Error: Title must be provided and proper type" });
					return;
				}
				updatedQuestion.title = title;
			}

			if(questionBody && questionBody !== oldQuestion.questionBody) {
				if(createHelper(questionBody) === false) {
					res.status(400).json({ error: "Error: Question body must be provided and proper type" });
					return;
				}
				updatedQuestion.questionBody = questionBody;
			}

			if(tags && tagsChecker(tags, oldQuestion.tags) === false) {
				if(tags === undefined || Array.isArray(tags) === false || tags.length === 0) {
					res.status(400).json({ error: "Error: Tags must be provided and proper type" });
					return;
				}

				for(let i = 0; i < tags.length; i++) {
					if(createHelper(tags[i]) === false) {
						res.status(400).json({ error: "Error: All elements in tags array must be strings/non all empty space string" });
						return;
					}
				}
				updatedQuestion.tags = tags;
			}
		} catch (e) {
			res.status(404).json({ error: "Question not found" });
			return;
		}

		if (Object.keys(updatedQuestion).length !== 0) {
			try {
				let currentUser = await userData.getUserByUsername(req.session.user.username);
				let currentUserId = currentUser._id;

				const updatedQuestionInfo = await questionData.updateQuestion(
					currentUserId,
					updatedQuestion.title,
					updatedQuestion.questionBody,
					updatedQuestion.tags
				);
				if(updatedQuestionInfo) {
					res.status(201).json({ message: "success" });
				}
			} catch (e) {
				res.status(500).json({ error: e });
			}
		} else {
			res.status(400).json({
				error:
					"No fields have been changed from their inital values, so no update has occurred",
			});
		}
	}
});

module.exports = router;
