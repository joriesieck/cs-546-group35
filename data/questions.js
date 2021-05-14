const mongoCollections = require('../config/mongoCollections');
const questions = mongoCollections.questions;
const userData = require("../data/users");
const { ObjectID } = require('mongodb');

/**
 * {
    "_id": "60553a1494a21813ec1d07e8",
    "userId": "60553a1f94a21813ec1d07e9",
    "title": "Title",
    "questionBody": "Question",
    "tags": ["math", "science"],
    "visible": true,
    "datePosted": "4/2/2021",
    "answers": [{
        "_id": "60553a1494a21813ec1d07e8",
        "userId": "60553a1f94a21813ec1d07e9",
        "date": "4/2/2021",
        "answer": "The answer is true",
        "tutorRatings": ["60553a2794a21813ec1d07ea", "60553a3494a21813ec1d07eb"],
        "studentRatings": ["60553a4194a21813ec1d07ec", "60553a4a94a21813ec1d07ed"]
    }]
}
 */

function createHelper(string) {
    if(string === undefined || typeof string !== 'string' || string.trim().length === 0) {
        return false;
    } else {
        return true;
    }
}

function removeDuplicates(arr) {
	arr1 = arr.sort();
	let newArr = [];
	for(let i = 0; i < arr1.length; i++) {
		if(newArr.includes(arr1[i]) === false) {
			newArr.push((arr1[i]));
		}
	}
	return newArr;
}

async function createQuestion(userId, title, question, tags) {
    if(createHelper(title) === false) throw 'Error: Title must be supplied and must be a string/non all empty space string';
    if(createHelper(question) === false) throw 'Error: Question must be supplied and must be a string/non all empty space string';

    tags = removeDuplicates(tags);
    if(tags === undefined) throw 'Error: A tag must be provided';
    if(Array.isArray(tags) === false) throw 'Error: Tags must be in an array';
    if(tags.length === 0) throw 'Error: At least one tag must be provided';
    if(tags.length > 3) throw 'Error: Please provide a maximum of 3 tags';
    for(let i = 0; i < tags.length; i++) {
        if(createHelper(tags[i]) === false) throw 'Error: All tags must be strings/non all empty space string';
    }

    let visible = true;
    let currentDate = new Date();
    let answerObj = {};

    const questionCollection = await questions();

    let questionObj = {
        userId: userId,
        title: title,
        questionBody: question,
        tags: tags,
        visible: visible,
        datePosted: currentDate,
        answers: [answerObj]
    };

    const insertInfo = await questionCollection.insertOne(questionObj);
    if (insertInfo.insertedCount === 0) throw 'Could not add question';

    const questionId = insertInfo.insertedId;
    let questionIdArr = [questionId];
    const userQuestionObj = {
        id: userId,
        questionIDs: questionIdArr
    };
    await userData.updateUser(userQuestionObj);
    
	const newQuestion = await getQuestionById(questionId);
	return newQuestion;
}

async function createAnswer(userId, answer, questionId) {
    // input checks
    if(createHelper(answer) === false) throw 'Error: Answer must be supplied and must be a string/non all empty space string';
    if (ObjectID.isValid(userId) === false) throw "Error: Invalid userId provided.";
    if (ObjectID.isValid(questionId) === false) throw "Error: Invalid questionId provided.";

    // get the question collection
    const questionCollection = await questions();

    // build the answer object
    let datePosted = new Date();
    const answerId = ObjectID();
    let answerObj = {
        _id: answerId,
        userId: userId,
        date: datePosted,
        answer: answer,
        tutorRatings: [],
        studentRatings: []
    };

    // add the answer to the question
    const insertInfo = await questionCollection.updateOne({_id:questionId}, {$addToSet: {answers:answerObj}});
    if (insertInfo.insertedCount === 0) throw 'Could not add answer';

    // get and return the answer
    const newAnswer = await getAnswerById(answerId);
    return newAnswer;
}

async function getQuestions() {
    const questionCollection = await questions();
    let questionList = await questionCollection.find().sort({"datePosted":-1}).toArray();
    return questionList;
}

async function getAnswers() {
    const answerCollection = await questions();
    let answerList = await answerCollection.find({}, {projection: {answer:1}}).toArray();
    return answerList;
}

async function getQuestionById(id) {
    if(id === undefined) throw "Error: No id parameter provided to remove function";
    if(ObjectID.isValid(id) === false) throw "Error: Invalid ID provided";

    const questionCollection = await questions();
    const question = await questionCollection.findOne({_id: id});
	if(question===null) throw `Error in function getQuestionById: ${id} not found.`;
	return question;
}

async function getAnswerById(id) {
    // input checks
    if (id === undefined) throw "Error: No id parameter provided.";
    if (ObjectID.isValid(id) === false) throw "Error: Invalid ID provided.";

    // get the collection
    const questionCollection = await questions();

    // query questions for the answer
    let answers;
    try {
		({answers} = await questionCollection.findOne({"answers._id":id},{projection: {_id:0, answers: {
			$filter: {input: "$answers", as: "answers", cond: {$eq: ["$$answers._id",id]}}
		}}}));
    } catch (e) {
        throw  `Error: No answer with ID ${id} found: ${e}`;
    }
    // make sure we actually got an answer
    const answer = answers[0];
    if (answer === null) throw `Error: No answer with ID ${id} found.`;

    return answer;
}

async function updateQuestion(questionId, updatedQuestion) {
    if(questionId === undefined) throw "Error: No id parameter provided to rename function";
    if(ObjectID.isValid(questionId) === false) throw "Error: Invalid ID provided";

    let updatedQuestionData = {}
    if(updatedQuestion === undefined) throw 'Error: Must provide updated book information';

    if(updatedQuestion.title) {
        if(createHelper(updatedQuestion.title) === false) throw 'Error: Updated title parameter must be supplied and must be a string/non all empty space string';
        updatedQuestionData.title = updatedQuestion.title;
    }

    if(updatedQuestion.questionBody) {
        if(createHelper(updatedQuestion.questionBody) === false) throw 'Error: Updated question body parameter must be supplied and must be a string/non all empty space string';
        updatedQuestionData.questionBody = updatedQuestion.questionBody;
    }

    if(updatedQuestion.tags) {
        updatedQuestion.tags = removeDuplicates(updatedQuestion.tags);
        if(Array.isArray(updatedQuestion.tags) === false) throw 'Error: Updated tags must be in an array';
        if(updatedQuestion.tags.length === 0) throw 'Error: At least one updated tag must be provided';
        for(let i = 0; i < updatedQuestion.tags.length; i++) {
            if(createHelper(updatedQuestion.tags[i]) === false) throw 'Error: All updated tags must be strings/non all empty space string';
        }
        updatedQuestionData.tags = updatedQuestion.tags;
        updatedQuestionData.tags = removeDuplicates(updatedQuestionData.tags);        
    }

    if(updatedQuestion.visible) {
        if(typeof updatedQuestion.visible !== 'boolean') throw 'Error: Updated visiblity must be a boolean value';
        updatedQuestionData.visible = updatedQuestion.visible;
    }
    updatedQuestionData = updatedQuestion

    const questionCollection = await questions();
    const updatedInfo = await questionCollection.updateOne(
        {_id: ObjectID(questionId)},
        {$set: updatedQuestionData}
    );
    if(!updatedInfo.matchedCount && !updatedInfo.modifiedCount) throw 'Error: Could not update book successfully';
    return await this.getQuestionById(questionId);
}

async function updateAnswer(answerId, updatedAnswer) {
    if (answerId === undefined) throw "Error: No id parameter provided.";
    if (ObjectID.isValid(answerId) === false) throw "Error: Invalid answer ID provided.";

    const updatedAnswerData = {};
    if (updatedAnswer === undefined) throw "Error: Must provide updated answer information.";

    if (updatedAnswer.answer) {
        if (createHelper(updatedAnswer.answer) === false) throw "Error: Updated answer text parameter must be supplied and must be a string/non all empty space string.";
        updatedAnswerData.answer = updatedAnswer.answer;
    }

    let answersArr = [];
    for (i = 0; i < answersArr.length; i++) {
        if (answersArr[i]._id == answerId) {
            answersArr[i] = updatedAnswerData;
        }
    };

    const questionCollection = await questions();
    const updatedInfo = await questionCollection.updateOne(
        {_id: answerId},
        {$set: updatedAnswerData}
    );
    if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) throw 'Error: Could not update answer successfully.';
    return await this.getAnswerById(id);
}

async function deleteQuestion(id) {
    if(id === undefined) throw "Error: No id parameter provided to remove function";
    if(ObjectID.isValid(id) === false) throw "Error: Invalid ID provided";

    const questionCollection = await questions();
    const deletionInfo = await questionCollection.deleteOne({ _id: id });
    if(deletionInfo.deletedCount === 0) throw `Could not delete question/ID does not exist`;
    return true;
}

async function deleteAnswer(id) {
    if (id === undefined) throw "Error: No id parameter provided.";
    if (ObjectID.isValid(id) === false) throw "Error: Invalid ID provided.";

    let parseId = ObjectID(id);
    const answerSubCollection = await questions();
    const deletionInfo = await answerSubCollection.deleteOne({ _id: parseId });
    if (deletionInfo.deletedCount === 0) throw `Could not delete answer/ID does not exist.`;
    return true;
}

module.exports = {
    createQuestion,
    createAnswer,
    getQuestions,
    getAnswers,
    getQuestionById,
    getAnswerById,
    updateQuestion,
    updateAnswer,
    deleteQuestion,
    deleteAnswer
};