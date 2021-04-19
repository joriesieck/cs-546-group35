/**
 * old check input method for createUser
 * 	// for (let field of userInfo) {
	// 	let value = userInfo[field];
	// 	// input must exist
	// 	if (value===undefined) throw `Error in function createUser: ${field} undefined.`;

	// 	// year must be a number
	// 	if (field==='year' && (typeof value !== 'number' || isNaN(value))) throw `Error in function createUser: year is not a number.`;
	// 	// relevantSubjects must be an array
	// 	else if (field==='relevantSubjects' && !Array.isArray(value)) throw `Error in function createUser: relevantSubjects is not an array.`;
	// 	// isTutor must be a boolean
	// 	else if (field==='isTutor' && typeof value !== 'boolean') throw `Error in function createUser: isTutor is not an array.`;
	// 	// all other fields must be strings
	// 	else if (typeof value !== 'string') throw `Error in function createUser: ${field} is not a string.`;

	// 	// strings must not be all whitespace - except hashedPasswords
	// 	if (typeof value === 'string') {
	// 		if (field!=='hashedPassword') value = value.trim();	// hashedPasswords can be all strings, but they can't be empty
	// 		if (value === '') throw `Error in function createUser: ${field} is all whitespace characters.`;
	// 		// update trimmed value in userInfo
	// 		userInfo[field] = value;
	// 	}
	// }

	// // deconstruct inputs and check inputs with individual requirements
	// const { firstName, lastName, email, username, hashedPassword, year, relevantSubjects, isTutor } = userInfo;
	
	// // email
	// // must be in correct email format
	// // regex source: https://www.geeksforgeeks.org/write-regular-expressions/
	// const emailRE = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
	// if (!emailRE.test(email)) throw 'Error in function createUser: email is not in correct format.';
	// // must not already be in the database
	// try {
	// 	getUserByEmail(email);
	// 	// user is already in the database, so error
	// 	throw 'Error in function createUser: email exists.';
	// } catch {
	// 	// user is not in the database, so continue (no op)
	// }

	// // username
	// // must not contain any whitespace characters
	// const usernameRE = /[ 	]/;
	// if (usernameRE.test(username)) throw 'Error in function createUser: username contains whitespace characters';
	// // must not already be in the database
	// try {
	// 	getUserByUsername(username);
	// 	// user is already in the database, so error
	// 	throw 'Error in function createUser: username exists.';
	// } catch {
	// 	// user is not in the database, so continue (no op)
	// }

	// // year
	// // must be greater than 0
	// if (year < 0) throw 'Error in function createUser: year is less than 0.';
	// // must be of the form YYYY
	// const yearRE = /^\d\d\d\d$/;
	// if (!yearRE.test(year)) throw 'Error in function createUser: year is not of the form YYYY.';

	// // relevantSubjects
	// // if isTutor, must not be empty
	// if (isTutor && relevantSubjects.length <= 0) throw 'Error in function createUser: user is tutor but relevantSubjects is empty.';
	// // if nonempty, all inputs must be strings and contain at least one non-whitespace character
	// relevantSubjects.forEach((subject,i) => {
	// 	// must be strings
	// 	if (typeof subject !== 'string') throw 'Error in function createUser: relevantSubjects contains nonstrings.';
	// 	// must contain at least one non-whitespace character
	// 	subject = subject.trim();
	// 	if (subject==='') throw 'Error in function createUser: relevantSubjects contains whitespace strings.';
	// 	// set relevantSubjects[i] to trimmed subject
	// 	relevantSubjects[i] = subject;
	// });
 */


// import required files
const users = require('../config/mongoCollections').users;
const { ObjectId } = require('mongodb');

/**
 * __checkInputs
 * @param inputs: an object of the form {field: {value,type,required}}
 * @param fn: the name of the calling function
 * @returns an object with all the trimmed strings, or an error if there were input errors
 */
const __checkInputs = (inputs, fn) => {
	// the object to hold the values for each input
	const inputVals = {};

	// loop over the inputs and check existence and type, as well as any specific cases
	for (let field in inputs) {
		let value = inputs[field].value;
		let type = inputs[field].type;
		let required = inputs[field].required;

		// input must exist
		if (required && value===undefined) throw `Error in function ${fn}: ${field} undefined.`;

		// if it's not required, only do checks if it exists
		if (value!==undefined) {
			// special case: array
			if (type==='array' && !Array.isArray(value)) throw `Error in function ${fn}: ${field} is not an array.`;
			// special case: number
			if (type==='number' && isNaN(value)) throw `Error in function ${fn}: ${field} is not a number.`;
			// special case: ObjectId
			if (type==='ObjectId') {
				try {
					if (value !== ObjectId(value)) throw `Error in function ${fn}: ${value} is not an ObjectId().`;
				} catch {
					throw `Error in function ${fn}: ${value} is not an ObjectId().`;
				}
			}
			// all other cases:
			if (type!=='array' && type!=='ObjectId' && typeof value !== type) throw `Error in function ${fn}: ${field} is not a ${type}.`;

			// strings must not be all whitespace - except hashedPasswords
			if (type === 'string') {
				if (field!=='hashedPassword') value = value.trim();	// hashedPasswords can be all whitespace, but they can't be empty
				if (value === '') throw `Error in function ${fn}: ${field} is all whitespace characters.`;
				// update trimmed value in inputs
				inputs[field].value = value;
			}
		}

		// add value to inputVals
		inputVals[field] = value;
	}

	// check inputs with individual requirements
	// email
	if (inputs.email) {
		const email = inputs.email.value;
		// must be in correct email format
		// regex source: https://www.geeksforgeeks.org/write-regular-expressions/
		const emailRE = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

		if (!emailRE.test(email)) throw `Error in function ${fn}: email is not in correct format.`;
	}

	// username
	if (inputs.username) {
		const username = inputs.username.value;
		// must not contain any whitespace characters
		const usernameRE = /[ 	]/;
		if (usernameRE.test(username)) throw `Error in function ${fn}: username contains whitespace characters`;
	}

	// year
	if (inputs.year) {
		const year = inputs.year.value;
		// must be greater than 0
		if (year < 0) throw `Error in function ${fn}: year is less than 0.`;
		// must be of the form YYYY
		const yearRE = /^\d\d\d\d$/;
		if (!yearRE.test(year)) throw `Error in function ${fn}: year is not of the form YYYY.`;
	}

	// relevantSubjects
	if ((inputs.isTutor && inputs.isTutor.value) || inputs.relevantSubjects) {
		const relevantSubjects = inputs.relevantSubjects.value;
		// if isTutor, must not be empty
		if (inputs.isTutor.value && relevantSubjects.length <= 0) throw `Error in function ${fn}: user is tutor but relevantSubjects is empty.`;
		// if nonempty, all inputs must be strings and contain at least one non-whitespace character
		relevantSubjects.forEach((subject,i) => {
			// must be strings
			if (typeof subject !== 'string') throw `Error in function ${fn}: relevantSubjects contains nonstrings.`;
			// must contain at least one non-whitespace character
			subject = subject.trim();
			if (subject==='') throw `Error in function ${fn}: relevantSubjects contains whitespace strings.`;
			// set relevantSubjects[i] to trimmed subject
			inputs.relevantSubjects[i] = subject;
		});
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
	if (userInfo===undefined || userInfo===null) throw 'Error in function createUser: missing input object.';
	if (typeof userInfo !== 'object' || Array.isArray(userInfo)) throw `Error in function createUser: userInfo is not an object.`;
	
	// check inputs - firstName, lastName, email, username, hashedPassword, year, relevantSubjects, and isTutor existence and type
	const numInputs = Object.keys(userInfo).length;
	if (numInputs < 8) throw `Error in function createUser: ${numInputs} inputs provided, expected 8.`;

	const { firstName, lastName, email, username, hashedPassword, year, relevantSubjects, isTutor } =  __checkInputs({
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
		throw `Error in function ${fn}: email exists.`;
	} catch {
		// user is not in the database, so continue (no op) - THIS IS WRONG
	}
	// username
	try {
		await getUserByUsername(username);
		// user is already in the database, so error
		throw `Error in function ${fn}: username exists.`;
	} catch {
		// user is not in the database, so continue (no op)
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
			tutorRating: []
		} : null
	}

	// insert the user into the collection
	const insertInfo = await userCollection.insertOne(user);
	// throw error if user could not be inserted
	if (insertInfo.insertedCount <= 0) throw `Error in function createUser: user ${username} could not be created.`;

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
	 __checkInputs({id: {value:id, type:'ObjectId', required:true}},
	'getUserById');

	// get the collection
	const userCollection = await users();

	// search for the given user and throw if not found
	const user = await userCollection.findOne({_id: id});
	if (user===null) throw `Error in function getUserById: ${id} not found.`;

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
	 __checkInputs({email: {value:email, type:'string', required:true}},
	'getUserByEmail');

	// get the collection
	const userCollection = await users();

	// search for the given user and throw if not found
	const user = await userCollection.findOne({email});
	if (user===null) throw `Error in function getUserByEmail: ${email} not found.`;

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
	 __checkInputs({iusername: {value:username, type:'string', required:true}},
	'getUserByUsername');

	// get the collection
	const userCollection = await users();

	// search for the given user and throw if not found
	const user = await userCollection.findOne({username});
	if (user===null) throw `Error in function getUserByUsername: ${username} not found.`;

	// return user
	return user;
}

/**
 * getRelevantUsers
 * @param id: the id of the user whose relevant users should be obtained
 * @returns an array of user objects corresponding to the given user's tutorList
 */
const getRelevantUsers = async (id) => {
	// check id - existence and type
	 __checkInputs({id: {value:id, type:'ObjectId', required:true}},
	'getRelevantUsers');

	// get the user data - throws if no user exists
	const user = await getUserById(id);

	// loop over the tutorList array and get each user object
	const relUsers = [];
	user.tutorList.forEach(async (relUserId) => {
		// check relUserId - existence and type
		// if a userID is invalid, just skip it
		try {
			if (relUserId!==undefined && relUserId === ObjectId(id)) {
				const userObj = await getUserById(relUserId)
				// remove hashedPassword
				userObj.hashedPassword = null;
				// add userObj to relUsers
				relUsers.push(userObj);
			}
		} catch {
			// no op - just move on to the next user
		}
	});

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
	if (userInfo===undefined) throw 'Error in function updateUser: missing input object.';

	const numInputs = Object.keys(userInfo).length;
	if (numInputs < 2) throw `Error in function updateUser: ${numInputs} inputs provided, expected at least 2.`;

	userInfo =  __checkInputs({
		id: {value:userInfo.id, type:'ObjectId', required:true},
		firstName: {value:userInfo.firstName, type:'string', required:false},
		lastName: {value:userInfo.lastName, type:'string', required:false},
		email: {value:userInfo.email, type:'string', required:false},
		username: {value:userInfo.username, type:'string', required:false},
		hashedPassword: {value:userInfo.hashedPassword, type:'string', required:false},
		year: {value:userInfo.year, type:'number', required:false},
		relevantSubjects: {value:userInfo.relevantSubjects, type:'array', required:false},
		isTutor: {value:userInfo.isTutor, type:'boolean', required:false}
	}, updateUser);

	// get the collection
	const userCollection = await users();

	// update user and throw if unsuccessful
	const updateInfo = await userCollection.updateOne({_id:userInfo.id}, {$set: userInfo});
	if (updateInfo.modifiedCount<=0) throw `Error in function updateUser: could not update user ${userInfo.username}.`;

	// get and return the updated user
	const updatedUser = getUserById(userInfo.id);
	return updatedUser;
}

/**
 * deleteUser
 * @param id: the id of the user to be deleted
 * @returns the (now deleted) username if the user was successfully deleted or an error if the user could not be deleted
 */
 const deleteUser = async (id) => {
	// check id - existence and type
	 __checkInputs({id: {value:id, type:'ObjectId', required:true}},
	'deleteUser');

	// get the collection
	const userCollection = await users();

	// remove the given user, getting their username in the process, and throw if not found
	const deleteInfo = await userCollection.findOneAndDelete({_id:id}, {projection: {username:1}});
	if (!deleteInfo.value) throw `Error in function deleteUser: could not delete user with id ${id}.`;

	// return delete message
	return `${deleteInfo.value.username} has been successfully deleted.`;
}


module.exports = {
	createUser, getUserById, getUserByEmail, getUserByUsername, getRelevantUsers, updateUser, deleteUser
}