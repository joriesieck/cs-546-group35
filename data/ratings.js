const mongoCollections = require('../config/mongoCollections');
const ratings = mongoCollections.ratings;
let { ObjectId } = require('mongodb');
const users = require('./users');

function createHelper(string) {
    if (string === undefined || typeof string !== 'string' || string.trim().length === 0) {
        return false;
    } else {
        return true;
    }
};

module.exports = {
    async createRating(userId, ratedId, rating, type, subject) {
        /* check inputs */
        // userId and ratedId must exist and be valid ObjectIds
        if (userId === undefined) throw "Error: No userId parameter provided.";
        if (ObjectId.isValid(userId) === false) throw "Error: Invalid userId provided.";
        if (ratedId === undefined) throw "Error: No ratedId parameter provided.";
        if (ObjectId.isValid(ratedId) === false) throw "Error: Invalid ratedId provided.";
        // rating must exist and be a number from 1-10
        if (rating === undefined || typeof rating !== 'number'|| rating < 1 || rating > 10) throw "Error: Rating must be supplied and must be a number between 1 through 10!";
        // type must exist, be a nonempty string, and be either 'answerRatingByStudents', 'answerRatingByTutors', or 'tutorRating'
        if (createHelper(type) === false || (type !== 'answerRatingByStudents' && type !== 'answerRatingByTutors' && type !== 'tutorRating')) throw "Error: Rating type must be supplied, must be a string/non all empty space string, and must be either 'answerRatingByStudents', 'answerRatingByTutors', or 'tutorRating'.";
        // for tutorRatings, subject must exist and be a nonempty string 
        if (type === 'tutorRating' && createHelper(subject) === false) throw "Error: Relevant subject must be supplied and must be a string/non all empty space string.";

        // retrieve the user objects for userId and ratedId (these functions throw if the user does not exist)
        const rater = await users.getUserById(userId);
        let ratee = await users.getUserById(ratedId);

        // make sure the ratee is a tutor
        if (ratee.userType !== 'tutor') throw "Only tutors may be rated.";

        // make sure the type of the rater matches the type of the rating
        if (type=='answerRatingByStudents' && rater.userType!=='student') throw "Tutors may not submit 'answerRatingByStudents' ratings, please submit an 'answerRatingByTutors' rating instead.";
        if (type=='answerRatingByTutors' && rater.userType!=='tutor') throw "Students may not submit 'answerRatingByTutors' ratings, please submit an 'answerRatingByTutors' rating instead.";
        if (type==='tutorRating' && rater.userType!=='student') throw "Tutors may not rate other tutors.";

        // if the type of rating is tutorRating, make sure the ratee is in the rater's tutorList
        if (type==='tutorRating') {
            let found = false;
            for (tutor of rater.tutorList) {
                if (ratedId.equals(tutor)) {
                    found = true;
                    break;
                }
            }
            if (!found) throw "Students may not rate tutors they have not interacted with.";
        }

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

        /* add the rating to the ratee's array of ratings */
        const ratingsObj = {};
        ratingsObj[type] = [insertInfo.insertedId];
        // if type is tutorRating, calculate the ratee's new average rating
        if (type==='tutorRating') {
            const oldAvg = ratee.ratings.avgRating;
            const numRatings = ratee.ratings.tutorRating.length;
            ratingsObj.avgRating = (oldAvg + rating) / (numRatings + 1);
        }

        // update the user
        try {
            ratee = await users.updateUser({
                id: ratedId,
                ratings: ratingsObj
            });
        } catch (e) {
            // delete the rating from the collection, since we couldn't update the user
            await this.deleteRating(insertInfo.insertedId);
            // throw an error
            throw `Unable to submit rating for ${ratee.username}: ${e}`;
        }

        // return the rating
        const ratingObj = await this.getRatingById(insertInfo.insertedId)
        return ratingObj;
    },

    async getRatingById(id) {
        if (id === undefined) throw "Error: No id parameter provided.";
        if (ObjectId.isValid(id) === false) throw "Error: Invalid ID provided.";

        const ratingCollection = await ratings();
        let rating = await ratingCollection.findOne({ _id: id });
        if (rating === null) throw `Error: No rating with ID ${id} found.`;

        return rating;
    },

    async deleteRating(id) {
        if (id === undefined) throw "Error: No id parameter provided.";
        if (ObjectId.isValid(id) === false) throw "Error: Invalid ID provided.";

        const ratingCollection = await ratings();
        const deletionInfo = await ratingCollection.deleteOne({ _id: id });
        if (deletionInfo.deletedCount === 0) throw `Could not delete rating/ID does not exist.`;
        return true;
    }
}