// import required files
const users = require('../config/mongoCollections').users;
const { ObjectId } = require('mongodb');

/**
 * An object that maps each input name to its user-friendly title
 */
inputTitles = {
	id: "ID",
	firstName: "First Name",
	lastName: "Last Name",
	email: "Email",
	username: "Username",
	hashedPassword: "Password",
	year: "Graduation Year",
	relevantSubjects: "Subjects",
	userType: "User Type",
	tutorList: "Tutor List",
	questionIDs: "Question IDs",
	ratings: "Ratings"
}

/**
 * checkInputs
 * @param inputs: an object of the form {field: {value,type,required}}
 * @param fn: the name of the calling function
 * @returns an object with all the trimmed strings, or an error if there were input errors
 */
const checkInputs = (inputs, fn) => {
	// the object to hold the values for each input
	const inputVals = {};

	// loop over the inputs and check existence and type, as well as any specific cases
	for (let field in inputs) {
		let value = inputs[field].value;
		let type = inputs[field].type;
		let required = inputs[field].required;

		// input must exist
		if (required && (value===undefined || value===null)) throw `${inputTitles[field]} is required.`;

		// if it's not required, only do checks if it exists
		if (value!==undefined && value!==null) {
			// special case: array
			if (type==='array' && !Array.isArray(value)) throw `${inputTitles[field]} must be an array.`;
			// special case: number
			if (type==='number' && isNaN(value)) throw `${inputTitles[field]} must be a number.`;
			// special case: ObjectId
			if (type==='ObjectId') {
				try {
					if (value !== ObjectId(value)) throw `${inputTitles[field]} must be an ObjectId.`;
				} catch {
					throw `${inputTitles[field]} must be an ObjectId.`;
				}
			}
			// special case: object
			if (type==='object' && Array.isArray(value)) throw `${inputTitles[field]} must be an object.`;
			// all other cases:
			if (type!=='array' && type!=='ObjectId' && typeof value !== type) throw `${inputTitles[field]} must be a ${type}.`;

			// strings must not be all whitespace
			if (type === 'string') {
				if (field!=='hashedPassword') value = value.trim();	// don't trim password
				if (value === '') throw `${inputTitles[field]} must contain at least one non-whitespace character.`;
				// update trimmed value in inputs
				inputs[field].value = value;
			}
		}

		// add value to inputVals
		inputVals[field] = value;
	}

	// check inputs with individual requirements
	// first/last name
	if(inputs.firstName && inputs.firstName.value) {
		const firstName = inputs.firstName.value;
		// must be less than or equal to 254 characters
		if (firstName.length > 254) throw `First Name may not contain more than 254 characters.`;
		// must be alphabet characters, ', -, or space
		const nameRE = /^([a-zA-Z'\- ]+)$/;
		if (!nameRE.test(firstName)) throw `First Name may only contain alphabetical characters, ', -, or space.`;
	}
	if(inputs.lastName && inputs.lastName.value) {
		const lastName = inputs.lastName.value;
		// must be less than or equal to 254 characters
		if (lastName.length > 254) throw `Last Name cannot be longer than 254 characters.`;
		// must be alphabet characters, ', -, or space
		const nameRE = /^([a-zA-Z'\- ]+)$/;
		if (!nameRE.test(lastName)) throw `Last Name may only contain alphabetical characters, ', -, or space.`;
	}

	// email
	if (inputs.email && inputs.email.value) {
		const email = inputs.email.value;
		// must be less than or equal to 254 characters
		if (email.length > 254) throw `Email may not contain more than 254 characters.`;
		// must be in correct email format
		// regex source: https://www.geeksforgeeks.org/write-regular-expressions/
		const emailRE = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
		if (!emailRE.test(email)) throw `Email must be of the format example@domain.suffix.`;
		// set email to all lowercase
		inputVals.email = email.toLowerCase();
	}

	// username
	if (inputs.username && inputs.username.value) {
		const username = inputs.username.value;
		// must be less than or equal to 254 characters
		if (username.length > 254) throw `Username may not contain more than 254 characters.`;
		// can only contain alphabet characters, numbers, -, _, and .
		const usernameRE = /^([a-zA-Z0-9\-\_\.]+)$/;
		if (!usernameRE.test(username)) throw `Username may only contain alphanumeric characters, -, _, and .`;
		// set username to all lowercase
		inputVals.username = username.toLowerCase();
	}

	// year
	if (inputs.year && inputs.year.value) {
		const year = inputs.year.value;
		// must be greater than or equal to 0
		if (year < 0) throw `Graduation Year must be greater than or equal to 0.`;
		// must be of the form YYYY
		const yearRE = /^\d\d\d\d$/;
		if (!yearRE.test(year)) throw `Graduation Year must be of the form YYYY.`;
	}

	// relevantSubjects
	if ((inputs.isTutor && inputs.isTutor.value) || (inputs.relevantSubjects && inputs.relevantSubjects.value)) {
		const relevantSubjects = inputs.relevantSubjects.value;
		// if isTutor, must not be empty
		if ((inputs.isTutor && inputs.isTutor.value) && relevantSubjects.length <= 0) throw `Subjects must contain at least one subject.`;
		// if nonempty, all inputs must be strings and contain at least one non-whitespace character
		relevantSubjects.forEach((subject,i) => {
			// must be strings
			if (typeof subject !== 'string') throw `Subjects may only contain strings.`;
			// must contain at least one non-whitespace character
			subject = subject.trim();
			if (subject==='') throw `Each subject must contain at least one non-whitespace character.`;
			// set relevantSubjects[i] to trimmed subject
			inputs.relevantSubjects[i] = subject;
		});
	}

	// userType (different from isTutor - this refers to the value that actually gets stored in the database)
	if (inputs.userType && inputs.userType.value) {
		let userType = inputs.userType.value;
		// can only be 'student' or 'tutor'
		userType = userType.toLowerCase();
		if (userType!=='student' && userType!=='tutor') throw `Invalid User Type '${userType}', expected 'student' or 'tutor'.`;
	}

	// questionIDs and tutorList
	if (inputs.questionIDs && inputs.questionIDs.value) {
		const questionIDs = inputs.questionIDs.value;
		// can only contain ObjectIds
		questionIDs.forEach((qid) => {
			try {
				if (qid !== ObjectId(qid)) throw `${qid} must be an ObjectId.`;
			} catch {
				throw `${qid} must be an ObjectId.`;
			}
		});
	}
	if (inputs.tutorList && inputs.tutorList.value) {
		const tutorList = inputs.tutorList.value;
		// can only contain ObjectIds
		tutorList.forEach((uid) => {
			try {
				if (uid !== ObjectId(uid)) throw `${uid} must be an ObjectId.`;
			} catch {
				throw `${uid} must be an ObjectId.`;
			}
		});
	}

	// ratings
	if (inputs.ratings && inputs.ratings.value) {
		const ratings = inputs.ratings.value;
		// must contain at least one of answerRatingByStudents, answerRatingByTutors, tutorRating, avgRating
		if (!ratings.answerRatingByStudents && !ratings.answerRatingByTutors && !ratings.tutorRating && !ratings.avgRating) throw `Ratings must have at least one valid key.`;

		// each value for each key must be an array of ObjectIds, except for avgRating which must be a number
		for (key in ratings) {
			const value = ratings[key];
			if (key=='avgRating') {
				if (typeof value !== 'number') throw 'Value for ratings.avgRating must be a number.';
				// must be between 1 and 10
				if (value<1 || value>10) throw 'Value for ratings.avgValue must be between 1 and 10 inclusive.';
			} else {
				if (!Array.isArray(value)) throw `Each value for ratings.${key} must be an array.`;
				value.forEach((rid) => {
					try {
						if (rid !== ObjectId(rid)) throw `${rid} must be an ObjectId.`;
					} catch {
						throw `${rid} must be an ObjectId.`;
					}
				});
			}
		}
	}

	// return the values from the inputs object (with trimmed strings)
	return inputVals;
}

/**
 * createUser
 * @param userInfo: an object with the info for the user to be created
 * @returns the newly created user, or an error if the user could not be created
 */
const createUser = async (userInfo) => {
	// make sure an object was passed in
	if (userInfo===undefined || userInfo===null) throw 'User Information is required.';
	if (typeof userInfo !== 'object' || Array.isArray(userInfo)) throw 'User Information must be an object.';
	
	// check inputs - firstName, lastName, email, username, hashedPassword, year, relevantSubjects, and isTutor existence and type
	const numInputs = Object.keys(userInfo).length;
	if (numInputs < 8) throw `User Information may not contain less than 8 inputs.`;

	const { firstName, lastName, email, username, hashedPassword, year, relevantSubjects, isTutor } =  checkInputs({
		firstName: {value:userInfo.firstName, type:'string', required:true},
		lastName: {value:userInfo.lastName, type:'string', required:true},
		email: {value:userInfo.email, type:'string', required:true},
		username: {value:userInfo.username, type:'string', required:true},
		hashedPassword: {value:userInfo.hashedPassword, type:'string', required:true},
		year: {value:userInfo.year, type:'number', required:true},
		relevantSubjects: {value:userInfo.relevantSubjects, type:'array', required:true},
		isTutor: {value:userInfo.isTutor, type:'boolean', required:true}
	},
	'createUser');

	// make sure user doesn't already exist in the database
	// email
	try {
		await getUserByEmail(email);
		// user is already in the database, so error
		throw `There is already an account associated with ${email}. Please log in instead.`;
	} catch (e) {
		// if the error isn't user not found, bubble it
		if (!`${e}`.includes('not found')) throw e;
	}
	// username
	try {
		await getUserByUsername(username);
		// user is already in the database, so error
		throw `There is already an account associated with ${username}. Please log in instead.`;
	} catch (e) {
		// if the error isn't user not found, bubble it
		if (!`${e}`.includes('not found')) throw e;
	}

	// get the collection
	const userCollection = await users();

	// define an object with the appropriate fields
	const user = {
		name:{firstName, lastName},
		email,
		username,
		hashedPassword,
		userType: isTutor ? "tutor" : "student",
		year,
		relevantSubjects,
		questionIDs: [],
		tutorList: [],
		ratings: isTutor ? {
			answerRatingByStudents: [],
			answerRatingByTutors: [],
			tutorRating: [],
			avgRating:null
		} : null
	}

	// insert the user into the collection
	const insertInfo = await userCollection.insertOne(user);
	// throw error if user could not be inserted
	if (insertInfo.insertedCount <= 0) throw `Sorry, something went wrong. User ${username} could not be created.`;

	// get and return the newly inserted user
	const id = insertInfo.insertedId;
	const newUser = await getUserById(id);
	return newUser;
}

/**
 * getUserById
 * @param id: the id of the user to be obtained
 * @returns the user with the given id, or an error if the user could not be found
 */
 const getUserById = async (id) => {
	// check id - existence and type
	 checkInputs({id: {value:id, type:'ObjectId', required:true}},
	'getUserById');

	// get the collection
	const userCollection = await users();

	// search for the given user and throw if not found
	const user = await userCollection.findOne({_id: id});
	if (user===null) throw `User ${id} not found.`;

	// return user
	return user;
}

/**
 * getUserByEmail
 * @param email: the email address of the user to be obtained
 * @returns the user with the given email, or an error if the user could not be found
 */
 const getUserByEmail = async (email) => {
	// check email - existence, type, and format
	 checkInputs({email: {value:email, type:'string', required:true}},
	'getUserByEmail');

	// get the collection
	const userCollection = await users();

	// search for the given user and throw if not found
	const user = await userCollection.findOne({email});
	if (user===null) throw `User with email ${email} not found.`;

	// return user
	return user;
}

/**
 * getUserByUsername
 * @param username: the username of the user to be obtained
 * @returns the user with the given username, or an error if the user could not be found
 */
const getUserByUsername = async (username) => {
	// check username - existence, type, and format
	({username} = checkInputs({username: {value:username, type:'string', required:true}}),
	'getUserByUsername');

	// get the collection
	const userCollection = await users();

	// search for the given user and throw if not found
	const user = await userCollection.findOne({username});
	if (user===null) throw `User with username ${username} not found.`;

	// return user
	return user;
}

/**
 * getRelatedUsers
 * @param id: the id of the user whose relevant users should be obtained
 * @returns an array of user objects corresponding to the given user's tutorList
 */
const getRelatedUsers = async (id) => {
	// check id - existence and type
	 checkInputs({id: {value:id, type:'ObjectId', required:true}},
	'getRelatedUsers');

	// get the user data - throws if no user exists
	const user = await getUserById(id);

	// loop over the tutorList array and get each user object
	const relUsers = [];
	for (relUserId of user.tutorList) {
		// check relUserId - existence and type
		// if a userID is invalid, just skip it
		try {
			if (relUserId!==undefined && relUserId!==null && relUserId === ObjectId(relUserId)) {
				const userObj = await getUserById(relUserId);
				// remove hashedPassword
				delete userObj.hashedPassword;
				// add userObj to relUsers
				relUsers.push(userObj);
			}
		} catch {
			// no op - just move on to the next user
		}
	}

	// return relUsers - if there weren't any, this will just be an empty array
	return relUsers;
}

/**
 * updateUser
 * @param userInfo: an object containing all of the fields to be updated
 * @returns the newly updated user, or an error if the user could not be updated
 */
 const updateUser = async (userInfo) => {
	// check inputs - id must exist, all others are optional but there must be at least one updateable field
	if (userInfo===undefined || userInfo===null) throw 'User Information is required.'
	if (typeof userInfo !== 'object' || Array.isArray(userInfo)) throw 'User Information must be an object.';

	const numInputs = Object.keys(userInfo).length;
	if (numInputs < 2) throw `User Information must contain at least 2 inputs.`;

	userInfo =  checkInputs({
		id: {value:userInfo.id, type:'ObjectId', required:true},
		firstName: {value:userInfo.firstName, type:'string', required:false},
		lastName: {value:userInfo.lastName, type:'string', required:false},
		email: {value:userInfo.email, type:'string', required:false},
		username: {value:userInfo.username, type:'string', required:false},
		hashedPassword: {value:userInfo.hashedPassword, type:'string', required:false},
		year: {value:userInfo.year, type:'number', required:false},
		relevantSubjects: {value:userInfo.relevantSubjects, type:'array', required:false},
		userType: {value:userInfo.userType, type:'string', required:false},
		tutorList: {value:userInfo.tutorList, type:'array', required:false},
		questionIDs: {value:userInfo.questionIDs, type:'array', required:false},
		ratings: {value:userInfo.ratings, type:'object', required: false}
	}, 'updateUser');

	// get the user id and delete it from userInfo so it doesn't get readded
	const id = userInfo.id;
	delete userInfo.id;
	// make sure only provided fields get updated and data doesn't get removed from arrays or objects
	const currentUser = await getUserById(id);
	for (field in userInfo) {
		let value = userInfo[field];

		// if value is an array, add to the old value, except for subjects which should just be overwritten
		if (Array.isArray(value) && field!=='relevantSubjects') {
			let oldValue = currentUser[field];
			// make sure values aren't already in the array
			if (oldValue) {
				let fieldUpdated = false;
				// loop over given values
				value.forEach((singleVal) => {
					// loop over old values and compare singleVal with each old value
					let dup = false;
					for (let i=0;i<oldValue.length;i++) {
						if (oldValue[i].equals(singleVal)) {
							dup = true;
							break;
						}
					}
					// if singleVal is not a duplicate, add it to oldValue and set fieldUpdated to true
					if (!dup) {
						oldValue.push(singleVal);
						fieldUpdated = true;
					}
				})
				userInfo[field] = oldValue;
				if (!fieldUpdated) delete userInfo[field];
			}
			// if there are no old values, userInfo[field] will just stay the same
		}

		// if field wasn't provided, delete it
		if (value===undefined || value===null || value===[]) {
			delete userInfo[field];
		}
	}

	// deal with ratings and name separately since they're special cases
	let ratingsUpdated = false;
	for (key in userInfo.ratings) {
		if (key!=='avgRating') {
			const oldValue = currentUser.ratings[key];
			let value = userInfo.ratings[key];
			// make sure values aren't already in the array
			if (oldValue) {
				// loop over given values
				value.forEach((singleVal) => {
					// loop over old values and compare singleVal with each old value
					let dup = false;
					for (let i=0;i<oldValue.length;i++) {
						if (oldValue[i].equals(singleVal)) {
							dup = true;
							break;
						}
					}
					// if singleVal is not a duplicate, add it to oldValue and set ratingsUpdated to true
					if (!dup) {
						oldValue.push(singleVal);
						ratingsUpdated = true;
					}
				});

				userInfo.ratings[key] = oldValue;
			}
			// if there are no old values, userInfo.ratings[key] will just stay the same
		}
	}
	// if nothing was updated in ratings, remove it
	if (!ratingsUpdated && (userInfo.ratings && !userInfo.ratings.avgRating)) delete userInfo.ratings;
	// make sure old fields are not overwritten in ratings
	if (userInfo.ratings) {
		for (key in currentUser.ratings) {
			// if key is not in userInfo, add key and value from currentUser
			if (!userInfo.ratings[key]) {
				userInfo.ratings[key] = currentUser.ratings[key];
			}
		}
	} else {
		// ratings is empty, so delete it
		delete userInfo.ratings;
	}

	if (userInfo.firstName || userInfo.lastName) {
		// if either name was provided, update the provided name
		userInfo.name = {
				firstName: userInfo.firstName || currentUser.name.firstName,
				lastName: userInfo.lastName || currentUser.name.lastName
			};

		// delete the fields for firstName and lastName
		delete userInfo.firstName;
		delete userInfo.lastName;
	}
	// if user is changing to a tutor, update ratings to be
	// 	{
	// 		answerRatingByStudents: [],
	// 		answerRatingByTutors: [],
	// 		tutorRating: [],
	// 		avgRating:null
	// 	}
	// instead of null, and vice versa
	// but if ratings were also passed in, just leave them
	if (userInfo.userType && !userInfo.ratings) {
		userInfo.ratings = userInfo.userType==='student' ? null : {
			answerRatingByStudents: [],
			answerRatingByTutors: [],
			tutorRating: [],
			avgRating:null
		};
	}

	// if userInfo is empty at this point, throw an error
	if (Object.keys(userInfo).length<=0) throw 'User Information does not contain any valid inputs, so no update was performed.';

	// get the collection
	const userCollection = await users();

	// update user and throw if unsuccessful
	const updateInfo = await userCollection.updateOne({_id:id}, {$set: userInfo});
	if (updateInfo.modifiedCount<=0) throw `Sorry, something went wrong. User ${id} could not updated.`;

	// get and return the updated user
	const updatedUser = getUserById(id);
	return updatedUser;
}

/**
 * deleteUser
 * @param id: the id of the user to be deleted
 * @returns the (now deleted) username if the user was successfully deleted or an error if the user could not be deleted
 */
 const deleteUser = async (id) => {
	// check id - existence and type
	checkInputs({id: {value:id, type:'ObjectId', required:true}},
	'deleteUser');

	// get the collection
	const userCollection = await users();

	// remove the given user, getting their username in the process, and throw if not found
	const deleteInfo = await userCollection.findOneAndDelete({_id:id}, {projection: {username:1}});
	if (!deleteInfo.value) throw `Sorry, something went wrong. User ${id} could not be deleted.`;

	// return delete message
	return `${deleteInfo.value.username} has been successfully deleted.`;
}

/**
 * removeUserFromTutorList
 * @param userToRemove: the id of the person to be removed
 * @param userRemoveFrom: the id of the person whose tutorList userToRemove should be removed from
 * @returns a successfully removed message
 */
const removeUserFromTutorList = async (userToRemove, userRemoveFrom) => {
	// check userToRemove and userRemoveFrom existence and type
	checkInputs({userToRemove: {value:userToRemove, type:'ObjectId', required:true}, userRemoveFrom: {value:userRemoveFrom, type:'ObjectId', required:true}},
	'removeUserFromTutorList');

	// get the collection
	const userCollection = await users();

	// pull userToRemove from userRemoveFrom's tutorList array
	const updateInfo = await userCollection.updateOne({_id:userRemoveFrom}, {$pull: {tutorList: userToRemove}});
	if (updateInfo.modifiedCount<=0) throw `Sorry, something went wrong. User ${userRemoveFrom} could not be updated.`;

	// return a success message
	return `User ${userToRemove} has been successfully removed from ${userRemoveFrom}'s tutorList.`;
}


module.exports = {
	checkInputs, createUser, getUserById, getUserByEmail, getUserByUsername, getRelatedUsers, updateUser, deleteUser, removeUserFromTutorList
}