// import bcrypt - REMOVE IF NO RAW PASSWORDS ALLOWED IN CODE
const bcrypt = require('bcryptjs');
// import connection and data
const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const users = data.users;

/**
	 * generate hashedPasswords for seed users - REMOVE IF NO RAW PASSWORDS ALLOWED IN CODE
	 * also this uses the sync method only bc it's simpler + i'm just testing, but will need to figure out a better way for the actual seed file
	 * also it only uses 1 salt round bc i got tired of waiting
*/
const genHP = (plainTextPW) => {
	return bcrypt.hashSync(plainTextPW, 1);
}

/**
 * more tests
 * enter not an object for userInfo
 * everything wrong type
 * all whitespace
 * etc
 */
/**
 * consider changing undefined checks to undefined AND null checks - update error messages too!
 */


const main = async () => {
	// open the db connection
	const db = await dbConnection();
	// drop the database
	await db.dropDatabase();

	// keep track of total number of tests and indices of failed tests
	totalTests = 0;
	failedTests = [];

	/* create user */
	// 1 - successful creation of student
	let user1;
	totalTests++;
	try {
		user1 = await users.createUser({
			firstName: "Jorie",
			lastName: "Sieck",
			email: "jsieck@stevens.edu",
			username: "jorie",
			hashedPassword: genHP("user1sverysecurepassword"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		console.log(user1);
	} catch (e) {
		failedTests.push(`1: ${e}`);
	}

	// 2 - successful creation of tutor
	let user2;
	totalTests++;
	try {
		user2 = await users.createUser({
			firstName: "Corinne",
			lastName: "Wisniewski",
			email: "cwisnie1@stevens.edu",
			username: "corinne",
			hashedPassword: genHP("user2'sevenmoresecurepassword"),
			year: 2022,
			relevantSubjects: ['CS 146'],
			isTutor: true
		});
		console.log(user2);
	} catch (e) {
		failedTests.push(`2: ${e}`);
	}

	// 3 - no inputs
	totalTests++;
	try {
		let user = await users.createUser();
		failedTests.push(user);
	} catch (e) {
		console.log(`3: ${e}`);
	}

	// 4 - empty object
	totalTests++;
	try {
		let user = await users.createUser({});
		failedTests.push(user);
	} catch (e) {
		console.log(`4: ${e}`);
	}

	// 5 - missing firstName
	totalTests++;
	try {
		let user = await users.createUser({
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`5: ${e}`);
	}

	// 6 - missing lastName
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			email: "email1@stevens.edu",
			username: "user",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`6: ${e}`);
	}

	// 7 - missing email
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			username: "user",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`7: ${e}`);
	}

	// 8 - missing username
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email2@stevens.edu",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`8: ${e}`);
	}

	// 9 - missing hashedPassword
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user",
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`8: ${e}`);
	}

	// 10 - missing year
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user",
			hashedPassword: genHP("test"),
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`10: ${e}`);
	}

	// 11 - missing relevantSubjects
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user",
			hashedPassword: genHP("test"),
			year: 2022,
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`11: ${e}`);
	}

	// 12 - missing isTutor
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: []
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`12: ${e}`);
	}

	// 13 - firstName undefined
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: undefined,
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`13: ${e}`);
	}

	// 14 - lastName undefined
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: undefined,
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`14: ${e}`);
	}

	// 15 - email undefined
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: undefined,
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`15: ${e}`);
	}

	// 16 - username undefined
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: undefined,
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`16: ${e}`);
	}

	// 17 - hashedPassword undefined
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: undefined,
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`17: ${e}`);
	}

	// 18 - year undefined
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: undefined,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`18: ${e}`);
	}

	// 19 - relevantSubjects undefined
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: undefined,
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`19: ${e}`);
	}

	// 20 - isTutor undefined
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: undefined
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`20: ${e}`);
	}

	// 21 - firstName null
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: null,
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`21: ${e}`);
	}

	// 22 - lastName null
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: null,
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`22: ${e}`);
	}

	// 23 - email null
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: null,
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`23: ${e}`);
	}

	// 24 - username null
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: null,
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`24: ${e}`);
	}

	// 25 - hashedPassword null
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: null,
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`25: ${e}`);
	}

	// 26 - year null
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: null,
			relevantSubjects: [],
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`26: ${e}`);
	}

	// 27 - relevantSubjects null
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: null,
			isTutor: false
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`27: ${e}`);
	}

	// 28 - isTutor null
	totalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: null
		});
		failedTests.push(user);
	} catch (e) {
		console.log(`28: ${e}`);
	}

	// display total number of tests + any failed tests
	console.log(`Total tests: ${totalTests}, failed: ${failedTests.length}`);
	failedTests.forEach((test) => console.log(test));

	console.log('Done seeding database');
	await db.serverConfig.close();
}

main();