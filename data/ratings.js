const mongoCollections = require('../config/mongoCollections');
const ratings = mongoCollections.ratings;
let { ObjectId } = require('mongodb');

function createHelper(string) {
    if (string === undefined || typeof string !== 'string' || string.trim().length === 0) {
        return false;
    } else {
        return true;
    }
};

module.exports = {
    async createRating(userId, ratedId, rating, type, subject) {
        if (rating === undefined || typeof rating !== 'number'|| rating < 1 || rating > 10) throw "Error: Rating must be supplied and must be a number between 1 through 10!";
        type = type.toLowerCase();
        if (createHelper(type) === false || (type !== 'tutor' && type !== 'answer')) throw "Error: Rating type must be supplied, must be a string/non all empty space string, and must be either 'tutor' or 'answer'.";
        if (createHelper(subject) === false && type === 'tutor') throw "Error: Relevant subject must be supplied and must be a string/non all empty space string.";

        let ratingDate = new Date();

        let newRating = {
            userId: userId,
            ratedId: ratedId,
            ratingDate: ratingDate,
            ratingType: type,
            ratingValue: rating,
            relevantSubject: subject
        };
        const ratingCollection = await ratings();
        const insertInfo = await ratingCollection.insertOne(newRating);
        if (insertInfo.insertedCount === 0) throw "Error: Could not add rating.";
    },

    async getRatingById(id) {
        if (id === undefined) throw "Error: No id parameter provided.";
        if (ObjectId.isValid(id) === false) throw "Error: Invalid ID provided.";

        let parseId = ObjectId(id);
        const ratingCollection = await ratings();
        let ratingId = await ratingCollection.findOne({ _id: parseId });
        if (ratingId === null) throw `Error: No rating with ID ${id} found.`;
        ratingId._id = ratingId._id.toString();

        return ratingId;
    },

    async getAllRatings(){
        const ratingCollection = await ratings();
        let selectedFields = await ratingCollection.find({},{ratedId, ratingType, ratingValue}).sort({ratedId: 1});
        return selectedFields; //can do more work in routes
    },

    async getAllUsersRatings(userId){
        if (!userId || userId === undefined || userId === null || userId === '') throw "Error: id is required";
        if (!ObjectId.isValid(userId)) throw "UserId is not a valid ObjectID";
        const ratingCollection = await ratings();
        let usersRatings = await ratingCollection.find({ratedId: userId},{ratingType, ratingValue});
        //we just need the type and the value I think
        return usersRatings; //can do more work with them in the routes
    },

    async updateRating(ratingId, updatedRating) {
        if (ratingId === undefined) throw "Error: No id parameter provided.";
        if (ObjectID.isValid(ratingId) === false) throw "Error: Invalid rating ID provided.";
    
        const updatedRatingData = {};
        if (updatedRating === undefined) throw "Error: Must provide updated book information.";
    
        if (updatedRating.rating) {
            if (updatedRating.rating === undefined || typeof updatedRating.rating !== 'number' || updatedRating.rating < 1 || updatedRating.rating > 10) throw "Error: Updated rating parameter must be supplied and must be a number 1 through 10.";
            updatedRatingData.rating = updatedAnswer.rating;
        }
    
        const ratingCollection = await ratings();
        const updatedInfo = await ratingCollection.updateOne(
            {_id: ratingId},
            {$set: updatedRatingData}
        );
        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount) throw 'Error: Could not update book successfully';
        return await this.getBookById(id);
    },

    async deleteRating(id) {
        if (id === undefined) throw "Error: No id parameter provided.";
        if (ObjectID.isValid(id) === false) throw "Error: Invalid ID provided.";

        let parseId = ObjectId(id);
        const ratingCollection = await ratings();
        const deletionInfo = await ratingCollection.deleteOne({ _id: parseId });
        if (deletionInfo.deletedCount === 0) throw `Could not delete rating/ID does not exist.`;
        return true;
    }
}