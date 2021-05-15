// import bcrypt
const bcrypt = require('bcryptjs');
// import connection and data
const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const users = data.users;
const ratings = data.ratings;
const questions = data.questions;

/**
 * generate hashedPasswords for seed users
 * uses the synchronous method for simplicity and 10 salt rounds for efficiency
 * @param plainTextPW: the plaintext password to be hashed
 * @returns the hashed password
*/
const genHP = (plainTextPW) => {
	return bcrypt.hashSync(plainTextPW, 10);
}

const main = async () => {
	// start the db connection
	const db = await dbConnection();
	// drop the database
	await db.dropDatabase();
	
	/* create 5 student users */
	let user1;
	try {
		user1 = await users.createUser({
			firstName: "Jorie",
			lastName: "Sieck",
			email: "jsieck@stevens.edu",
			username: "jorie",
			hashedPassword: genHP("jorie111"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
	} catch (e) {
		console.log(`Error in creation of user 1: ${e}`)
	}
	let user2;
	try {
		user2 = await users.createUser({
			firstName: "Brandon",
			lastName: "Cao",
			email: "bcao4@stevens.edu",
			username: "brandon",
			hashedPassword: genHP("brandon1"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
	} catch (e) {
		console.log(`Error in creation of user 2: ${e}`)
	}
	let user3;
	try {
		user3 = await users.createUser({
			firstName: "Ferris",
			lastName: "Bueller",
			email: "fbueller@glenbrook.edu",
			username: "ferris",
			hashedPassword: genHP("ferris11"),
			year: 1986,
			relevantSubjects: [],
			isTutor: false
		});
	} catch (e) {
		console.log(`Error in creation of user 3: ${e}`)
	}
	let user4;
	try {
		user4 = await users.createUser({
			firstName: "Marty",
			lastName: "McFly",
			email: "mmcfly@hillvalley.edu",
			username: "marty",
			hashedPassword: genHP("marty111"),
			year: 1985,
			relevantSubjects: [],
			isTutor: false
		});
	} catch (e) {
		console.log(`Error in creation of user 4: ${e}`)
	}
	let user5;
	try {
		user5 = await users.createUser({
			firstName: "Scott",
			lastName: "Howard",
			email: "showard@beacontown.edu",
			username: "scott",
			hashedPassword: genHP("scott111"),
			year: 1985,
			relevantSubjects: [],
			isTutor: false
		});
	} catch (e) {
		console.log(`Error in creation of user 5: ${e}`)
	}

	/* create 5 tutor users */
	let user6;
	try {
		user6 = await users.createUser({
			firstName: "Corinne",
			lastName: "Wisniewski",
			email: "cwisnie1@stevens.edu",
			username: "corinne",
			hashedPassword: genHP("corinne1"),
			year: 2022,
			relevantSubjects: ['CS 146', 'CS 492'],
			isTutor: true
		});
	} catch (e) {
		console.log(`Error in creation of user 6: ${e}`);
	}
	let user7;
	try {
		user7 = await users.createUser({
			firstName: "Sebastian",
			lastName: "Muriel",
			email: "smuriel@stevens.edu",
			username: "sebastian",
			hashedPassword: genHP("sebastian1"),
			year: 2022,
			relevantSubjects: ['MA 232'],
			isTutor: true
		});
	} catch (e) {
		console.log(`Error in creation of user 7: ${e}`)
	}
	let user8;
	try {
		user8 = await users.createUser({
			firstName: "Patrick",
			lastName: "Hill",
			email: "phill@stevens.edu",
			username: "patrick",
			hashedPassword: genHP("patrick1"),
			year: 2022,
			relevantSubjects: ['CS 546', 'CS 554'],
			isTutor: true
		});
	} catch (e) {
		console.log(`Error in creation of user 8: ${e}`)
	}
	let user9;
	try {
		user9 = await users.createUser({
			firstName: "Allison",
			lastName: "Reynolds",
			email: "areynolds@shermer.edu",
			username: "allison",
			hashedPassword: genHP("allison1"),
			year: 1985,
			relevantSubjects: ['Detention'],
			isTutor: true
		});
	} catch (e) {
		console.log(`Error in creation of user 9: ${e}`)
	}
	let user10;
	try {
		user10 = await users.createUser({
			firstName: "Carrie",
			lastName: "White",
			email: "cwhite@bates.edu",
			username: "carrie",
			hashedPassword: genHP("carrie11"),
			year: 1976,
			relevantSubjects: ['Telekinesis'],
			isTutor: true
		});
	} catch (e) {
		console.log(`Error in creation of user 10: ${e}`)
	}

	/* add tutors to 3 users */
	try {
		user1 = await users.updateUser({id:user1._id, tutorList: [user6._id, user7._id]});
	} catch (e) {
		console.log(`Error updating user 1: ${e}`);
	}
	try {
		user2 = await users.updateUser({id:user2._id, tutorList: [user8._id, user9._id, user10._id]});
	} catch (e) {
		console.log(`Error updating user 2: ${e}`);
	}
	try {
		user3 = await users.updateUser({id:user3._id, tutorList: [user6._id, user7._id,user8._id, user9._id, user10._id]});
	} catch (e) {
		console.log(`Error updating user 3: ${e}`);
	}

	/* add ratings to 3 tutors */
	try {
		const rating1 = await ratings.createRating(user1._id, user6._id, 10, 'answerRatingByStudents');
	} catch (e) {
		console.log(`Error rating user 6: ${e}`);
	}
	try {
		const rating2 = await ratings.createRating(user6._id, user7._id, 9, 'answerRatingByTutors');
	} catch (e) {
		console.log(`Error rating user 7: ${e}`);
	}
	try {
		const rating3 = await ratings.createRating(user2._id, user9._id, 8, 'tutorRating', 'math');
	} catch (e) {
		console.log(`Error rating user 9: ${e}`);
	}

	/* create 5 questions */
	let question1;
	try {
		question1 = await questions.createQuestion(user3._id, "Question" ,"This is question 1" , ['CS 546', 'CS 554']);
	} catch (e) {
		console.log(`Error in creation of question 1: ${e}`)
	}

	console.log('\nDone seeding database');
	await db.serverConfig.close();
}

main();