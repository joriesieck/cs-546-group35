const mongoCollections = require('../config/mongoCollections');
const answers = mongoCollections.answers;
let { ObjectId } = require('mongodb');

function createHelper(string) {
    if (string === undefined || typeof string !== 'string' || string.trim().length === 0) {
        return false;
    } else {
        return true;
    }
};

module.exports = {
    async createAnswer(userId, answer) {
        if(createHelper(answer) === false) throw "Error: Answer must be supplied and must be a string/non all empty space string";

        let datePosted = new Date();

        let newAnswer = {
            userId: userId,
            date: datePosted,
            answer: answer,
        };
        const answerCollection = await answers();
        const insertInfo = await answerCollection.insertOne(newAnswer);
        if (insertInfo.insertedCount === 0) throw "Error: Could not add answer.";
    },

    async getAnswers() {
        const answerCollection = await answers();
        let answerList = await answerCollection.find({}, {projection: {answer:1}}).toArray();
        return answerList;
    },

    async getAnswerById(id) {
        if (id === undefined) throw "Error: No id parameter provided.";
        if (ObjectId.isValid(id) === false) throw "Error: Invalid ID provided.";

        let parseId = ObjectId(id);
        const answerCollection = await answers();
        let answerId = await answerCollection.findOne({ _id: parseId });
        if (answerId === null) throw `Error: No answer with ID ${id} found.`;
        answerId._id = answer._id.toString();

        return answerId;
    },

    async updateAnswer(answerId, updatedAnswer) {
        if (answerId === undefined) throw "Error: No id parameter provided.";
        if (ObjectID.isValid(id) === false) throw "Error: Invalid ID provided.";
    
        const updatedAnswerData = {}
        if (updatedAnswer === undefined) throw "Error: Must provide updated book information.";
    
        if (updatedAnswer.answer) {
            if (createHelper(updatedAnswer.answer) === false) throw "Error: Updated answer text parameter must be supplied and must be a string/non all empty space string.";
            updatedAnswerData.answer = updatedAnswer.answer;
        }
    
        const answerCollection = await answers();
        const updatedInfo = await answerCollection.updateOne(
            {_id: answerId},
            {$set: updatedAnswerData}
        );
        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) throw 'Error: Could not update book successfully';
        return await this.getBookById(id);
    },
    
    async deleteAnswer(id) {
        if (id === undefined) throw "Error: No id parameter provided.";
        if (ObjectID.isValid(id) === false) throw "Error: Invalid ID provided.";

        let parseId = ObjectId(id);
        const answerCollection = await answers();
        const deletionInfo = await answerCollection.deleteOne({ _id: parseId });
        if (deletionInfo.deletedCount === 0) throw `Could not delete answer/ID does not exist.`;
        return true;
    }
}