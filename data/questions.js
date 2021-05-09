const mongoCollections = require('../config/mongoCollections');
const questions = mongoCollections.questions;
const { ObjectID } = require('mongodb');
const { ObjectId } = require('mongodb');

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

    const questionCollection = await questions();

    let questionObj = {
        userId: userId,
        title: title,
        questionBody: question,
        tags: tags,
        visible: visible,
        datePosted: currentDate,
        answers: []
    };

    const insertInfo = await questionCollection.insertOne(questionObj);
    if (insertInfo.insertedCount === 0) throw 'Could not add question';

    const questionId = insertInfo.insertedId;
	const newQuestion = await getQuestionById(questionId);
    
    //when a question is asked, it needs to be added to someones array of questions
    //so get the user (require the user data)
    //isolate the user's id
    //and the user's current questions
    //then update the user by sending back the id and the questions plus this new one's id

	return newQuestion;
}

async function getQuestions() {
    const questionCollection = await questions();
    let questionList = await questionCollection.find().sort({"datePosted":-1}).toArray();
    return questionList;
}

async function getQuestionById(id) {
    if(id === undefined) throw "Error: No id parameter provided to remove function";
    if(ObjectID.isValid(id) === false) throw "Error: Invalid ID provided";

    const questionCollection = await questions();
    const question = await questionCollection.findOne({_id: id});
	if(question===null) throw `Error in function getQuestionById: ${id} not found.`;
	return question;
}

async function updateQuestion(questionId, updatedQuestion) {
    if(id === undefined) throw "Error: No id parameter provided to rename function";
    if(ObjectID.isValid(id) === false) throw "Error: Invalid ID provided";

    const updatedQuestionData = {}
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
        if(Array.isArray(tags) === false) throw 'Error: Updated tags must be in an array';
        if(tags.length === 0) throw 'Error: At least one updated tag must be provided';
        for(let i = 0; i < tags.length; i++) {
            if(createHelper(tags[i]) === false) throw 'Error: All updated tags must be strings/non all empty space string';
        }
        updatedQuestionData.tags = updatedQuestion.tags;
        updatedQuestionData.tags = removeDuplicates(updatedQuestionData.tags);        
    }

    if(updatedQuestion.visible) {
        if(typeof updatedQuestion.visible !== 'boolean') throw 'Error: Updated visiblity must be a boolean value';
        updatedQuestionData.visible = updatedQuestion.visible;
    }

    const questionCollection = await questions();
    const updatedInfo = await questionCollection.updateOne(
        {_id: questionId},
        {$set: updatedQuestionData}
    );
    if(!updatedInfo.matchedCount && !updatedInfo.modifiedCount) throw 'Error: Could not update book successfully';
    return await this.getBookById(id);
}

async function deleteQuestion(id) {
    if(id === undefined) throw "Error: No id parameter provided to remove function";
    if(ObjectID.isValid(id) === false) throw "Error: Invalid ID provided";

    const questionCollection = await questions();
    const deletionInfo = await questionCollection.deleteOne({ _id: id });
    if(deletionInfo.deletedCount === 0) throw `Could not delete question/ID does not exist`;
    return true;
}

module.exports = {
    createQuestion,
    getQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion
};