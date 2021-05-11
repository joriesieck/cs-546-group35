// import bcrypt
const bcrypt = require('bcryptjs');
// import connection and data
const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const users = data.users;
const { ObjectId } = require('mongodb');
const { getUserById } = require('../data/users');

/**
	 * generate hashedPasswords for seed users - 
	 * this uses the sync method only bc it's simpler + i'm just testing, but will need to figure out a better way for the actual seed file
	 * also it only uses 1 salt round bc i got tired of waiting
*/
const genHP = (plainTextPW) => {
	return bcrypt.hashSync(plainTextPW, 1);
}

/**
 * test error checks and proper inputs
 */
const main = async () => {
	// open the db connection
	const db = await dbConnection();
	// drop the database
	await db.dropDatabase();

	// keep track of total number of tests for each function and indices of failed tests
	cuTotalTests = 0;	// create user
	cuFailedTests = [];
	giTotalTests = 0;	// get user by id
	giFailedTests = [];
	geTotalTests = 0;	// get user by email
	geFailedTests = [];
	guTotalTests = 0;	// get user by username
	guFailedTests = [];
	duTotalTests = 0;	// delete user
	duFailedTests = [];
	uuTotalTests = 0;	// update user
	uuFailedTests = [];
	grTotalTests = 0;	// get related users
	grFailedTests = [];
	ruTotalTests = 0;	// remove user from tutorList
	ruFailedTests = [];

	/* create user */
	console.log("createUser:")
	// 0 - successful creation of student
	let user1;
	cuTotalTests++;
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
		cuFailedTests.push(`0: ${e}`);
	}

	// 1 - successful creation of tutor
	let user2;
	cuTotalTests++;
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
		cuFailedTests.push(`1: ${e}`);
	}

	// 2 - no inputs
	cuTotalTests++;
	try {
		let user = await users.createUser();
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`2: ${e}`);
	}

	// 3 - empty object
	cuTotalTests++;
	try {
		let user = await users.createUser({});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`3: ${e}`);
	}

	// 4 - not an object
	cuTotalTests++;
	try {
		let user = await users.createUser(true);
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`4: ${e}`);
	}

	// 5 - missing firstName
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`5: ${e}`);
	}

	// 6 - missing lastName
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`6: ${e}`);
	}

	// 7 - missing email
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`7: ${e}`);
	}

	// 8 - missing username
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`8: ${e}`);
	}

	// 9 - missing hashedPassword
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`8: ${e}`);
	}

	// 10 - missing year
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`10: ${e}`);
	}

	// 11 - missing relevantSubjects
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`11: ${e}`);
	}

	// 12 - missing isTutor
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`12: ${e}`);
	}

	// 13 - firstName undefined
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`13: ${e}`);
	}

	// 14 - lastName undefined
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`14: ${e}`);
	}

	// 15 - email undefined
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`15: ${e}`);
	}

	// 16 - username undefined
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`16: ${e}`);
	}

	// 17 - hashedPassword undefined
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`17: ${e}`);
	}

	// 18 - year undefined
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`18: ${e}`);
	}

	// 19 - relevantSubjects undefined
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`19: ${e}`);
	}

	// 20 - isTutor undefined
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`20: ${e}`);
	}

	// 21 - firstName null
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`21: ${e}`);
	}

	// 22 - lastName null
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`22: ${e}`);
	}

	// 23 - email null
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`23: ${e}`);
	}

	// 24 - username null
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`24: ${e}`);
	}

	// 25 - hashedPassword null
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`25: ${e}`);
	}

	// 26 - year null
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`26: ${e}`);
	}

	// 27 - relevantSubjects null
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`27: ${e}`);
	}

	// 28 - isTutor null
	cuTotalTests++;
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
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`28: ${e}`);
	}

	// 29 - firstName wrong type
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: 12345,
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`29: ${e}`);
	}

	// 30 - lastName wrong type
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: true,
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`30: ${e}`);
	}

	// 31 - email wrong type
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: () => console.log('function'),
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`31: ${e}`);
	}

	// 32 - username wrong type
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: {username: 'username'},
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`32: ${e}`);
	}

	// 33 - hashedPassword wrong type
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: ['hashedPW123'],
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`33: ${e}`);
	}

	// 34 - year wrong type
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: '2022',
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`34: ${e}`);
	}

	// 35 - relevantSubjects wrong type
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: 'this is a subject',
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`35: ${e}`);
	}

	// 36 - isTutor null
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: 'false'
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`36: ${e}`);
	}

	// 37 - firstName all whitespace
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: '             ',
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`37: ${e}`);
	}

	// 38 - lastName all whitespace
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: '',
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`38: ${e}`);
	}

	// 39 - email all whitespace
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: '    ',
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`39: ${e}`);
	}

	// 40 - username all whitespace
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: '                                                                                 ',
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`40: ${e}`);
	}

	// 41 - hashedPassword empty
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: '',
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`41: ${e}`);
	}

	// 42 - year empty - this should actually trigger the wrong type case
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: '',
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`42: ${e}`);
	}

	// 43 - relevantSubjects only contains whitespace
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: ['         ', ''],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`43: ${e}`);
	}

	// 44 - isTutor empty - this should actually trigger the wrong type case
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: ''
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`44: ${e}`);
	}

	// 45 - email wrong format
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`45: ${e}`);
	}

	// 46 - username contains whitespace characters
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user 5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`46: ${e}`);
	}

	// 47 - year < 0
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: -2022,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`47: ${e}`);
	}

	// 48 - year wrong format
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 22,
			relevantSubjects: [],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`48: ${e}`);
	}

	// 49 - user is tutor, but relevantSubjects is empty
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [],
			isTutor: true
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`49: ${e}`);
	}

	// 50 - relevantSubjects contains non-strings
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "user5",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: [4, 'abc'],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`50: ${e}`);
	}

	// 51 - username already exists - uppercase
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "email@stevens.edu",
			username: "JORIE",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: ['abc'],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`51: ${e}`);
	}

	// 52 - email already exists - mixed case
	cuTotalTests++;
	try {
		let user = await users.createUser({
			firstName: "First",
			lastName: "Last",
			email: "jSiEcK@sTeVeNs.edu",
			username: "testusername",
			hashedPassword: genHP("test"),
			year: 2022,
			relevantSubjects: ['abc'],
			isTutor: false
		});
		cuFailedTests.push(user);
	} catch (e) {
		console.log(`52: ${e}`);
	}

	/* get user by id */
	console.log("\ngetUserById:")
	// 0 - successfully get user
	giTotalTests++;
	try {
		const user = await users.getUserById(user1._id);
		console.log(user);
	} catch (e) {
		giFailedTests.push(`0: ${e}`);
	}
	// 1 - no inputs
	giTotalTests++;
	try {
		const user = await users.getUserById();
		giFailedTests.push(user);
	} catch (e) {
		console.log(`1: ${e}`);
	}
	// 2 - id undefined
	giTotalTests++;
	try {
		const user = await users.getUserById(undefined);
		giFailedTests.push(user);
	} catch (e) {
		console.log(`2: ${e}`);
	}
	// 3 - id null
	giTotalTests++;
	try {
		const user = await users.getUserById(null);
		giFailedTests.push(user);
	} catch (e) {
		console.log(`3: ${e}`);
	}
	// 4 - wrong type
	giTotalTests++;
	try {
		const user = await users.getUserById('thisisanid');
		giFailedTests.push(user);
	} catch (e) {
		console.log(`4: ${e}`);
	}
	// 5 - invalid ObjectId
	giTotalTests++;
	try {
		const user = await users.getUserById(123456789);
		giFailedTests.push(user);
	} catch (e) {
		console.log(`5: ${e}`);
	}
	// 6 - user not found
	giTotalTests++;
	try {
		const user = await users.getUserById(ObjectId());
		giFailedTests.push(user);
	} catch (e) {
		console.log(`6: ${e}`);
	}

	/* get user by email */
	console.log("\ngetUserByEmail:")
	// 0 - successfully get user
	geTotalTests++;
	try {
		const user = await users.getUserByEmail("jsieck@stevens.edu");
		console.log(user);
	} catch (e) {
		geFailedTests.push(`0: ${e}`);
	}
	// 1 - no inputs
	geTotalTests++;
	try {
		const user = await users.getUserByEmail();
		geFailedTests.push(user);
	} catch (e) {
		console.log(`1: ${e}`);
	}
	// 2 - email undefined
	geTotalTests++;
	try {
		const user = await users.getUserByEmail(undefined);
		geFailedTests.push(user);
	} catch (e) {
		console.log(`2: ${e}`);
	}
	// 3 - email null
	geTotalTests++;
	try {
		const user = await users.getUserByEmail(null);
		geFailedTests.push(user);
	} catch (e) {
		console.log(`3: ${e}`);
	}
	// 4 - wrong type
	geTotalTests++;
	try {
		const user = await users.getUserByEmail(123456789);
		geFailedTests.push(user);
	} catch (e) {
		console.log(`4: ${e}`);
	}
	// 5 - wrong format
	geTotalTests++;
	try {
		const user = await users.getUserByEmail("abcdgmail.com");
		geFailedTests.push(user);
	} catch (e) {
		console.log(`5: ${e}`);
	}
	// 6 - all whitespace
	geTotalTests++;
	try {
		const user = await users.getUserByEmail("                    ");
		geFailedTests.push(user);
	} catch (e) {
		console.log(`6: ${e}`);
	}
	// 7 - user not found
	geTotalTests++;
	try {
		const user = await users.getUserByEmail("arandomemail@gmail.com");
		geFailedTests.push(user);
	} catch (e) {
		console.log(`7: ${e}`);
	}

	/* get user by username */
	console.log("\ngetUserByUsername:")
	// 0 - successfully get user
	guTotalTests++;
	try {
		const user = await users.getUserByUsername("jorie");
		console.log(user);
	} catch (e) {
		guFailedTests.push(`0: ${e}`);
	}
	// 1 - no inputs
	guTotalTests++;
	try {
		const user = await users.getUserByUsername();
		guFailedTests.push(user);
	} catch (e) {
		console.log(`1: ${e}`);
	}
	// 2 - username undefined
	guTotalTests++;
	try {
		const user = await users.getUserByUsername(undefined);
		guFailedTests.push(user);
	} catch (e) {
		console.log(`2: ${e}`);
	}
	// 3 - username null
	guTotalTests++;
	try {
		const user = await users.getUserByUsername(null);
		guFailedTests.push(user);
	} catch (e) {
		console.log(`3: ${e}`);
	}
	// 4 - wrong type
	guTotalTests++;
	try {
		const user = await users.getUserByUsername(123456789);
		guFailedTests.push(user);
	} catch (e) {
		console.log(`4: ${e}`);
	}
	// 5 - contains whitespace
	guTotalTests++;
	try {
		const user = await users.getUserByUsername("jorie sieck");
		guFailedTests.push(user);
	} catch (e) {
		console.log(`5: ${e}`);
	}
	// 6 - all whitespace
	guTotalTests++;
	try {
		const user = await users.getUserByUsername("                    ");
		guFailedTests.push(user);
	} catch (e) {
		console.log(`6: ${e}`);
	}
	// 7 - user not found
	guTotalTests++;
	try {
		const user = await users.getUserByUsername("thisisnotausername");
		guFailedTests.push(user);
	} catch (e) {
		console.log(`7: ${e}`);
	}

	/* delete user */
	console.log("\ndeleteUser:")
	// 0 - successfully delete user
	duTotalTests++;
	try {
		const message = await users.deleteUser(user1._id);
		console.log(`0: ${message}`);
	} catch (e) {
		duFailedTests.push(`0: ${e}`);
	}
	// 1 - no inputs
	duTotalTests++;
	try {
		const user = await users.deleteUser();
		duFailedTests.push(user);
	} catch (e) {
		console.log(`1: ${e}`);
	}
	// 2 - id undefined
	duTotalTests++;
	try {
		const user = await users.deleteUser(undefined);
		duFailedTests.push(user);
	} catch (e) {
		console.log(`2: ${e}`);
	}
	// 3 - id null
	duTotalTests++;
	try {
		const user = await users.deleteUser(null);
		duFailedTests.push(user);
	} catch (e) {
		console.log(`3: ${e}`);
	}
	// 4 - wrong type
	duTotalTests++;
	try {
		const user = await users.deleteUser('thisisanid');
		duFailedTests.push(user);
	} catch (e) {
		console.log(`4: ${e}`);
	}
	// 5 - invalid ObjectId
	duTotalTests++;
	try {
		const user = await users.deleteUser(123456789);
		duFailedTests.push(user);
	} catch (e) {
		console.log(`5: ${e}`);
	}
	// 6 - user not found
	duTotalTests++;
	try {
		const user = await users.deleteUser(ObjectId());
		duFailedTests.push(user);
	} catch (e) {
		console.log(`6: ${e}`);
	}

	// create more users
	let user3;
	try {
		user1 = await users.createUser({
			firstName: "Sebastian",
			lastName: "Muriel",
			email: "smuriel@stevens.edu",
			username: "sebastian",
			hashedPassword: genHP("user1sverysecurepassword"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		user3 = await users.createUser({
			firstName: "Brandon",
			lastName: "Cao",
			email: "bcao4@stevens.edu",
			username: "brandon",
			hashedPassword: genHP("user3ssupersecurepassword"),
			year: 2022,
			relevantSubjects: [],
			isTutor: false
		});
		console.log(`\nCreated users ${user1.username} and ${user3.username}`);
	} catch (e) {
		console.log(`\nCREATEUSER ERROR: ${e}`);
	}


	/* update user */
	console.log('\nupdateUser:');
	// 0 - successfully update user's tutorList
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user2._id, tutorList:[user1._id, user3._id]});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`0: ${e}`);
	}
	// 1 - successfully update user's firstName only
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id, firstName: "NewFirstName"});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`1: ${e}`);
	}
	// 2 - successfully add to a user's relevantSubjects
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user3._id, relevantSubjects: ['CS 546']});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`2: ${e}`);
	}
	// 3 - successfully change a user's email and username
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user3._id, email: "bcao4@gmail.com", username:"brandoncao"});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`3: ${e}`);
	}
	// 4 - successfully change a user's type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id, userType:"tutor"});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`4: ${e}`);
	}
	// 5 - successfully add to a user's ratings
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id, ratings:{answerRatingByStudents: [user2._id]}});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`5: ${e}`);
	}
	// 6 - successfully update a user's first and last name
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id, firstName:"       Sebastian", lastName:"NewLastName"});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`6: ${e}`);
	}
	// 7 - successfully change a user's password (hashedPassword)
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user2._id, hashedPassword:genHP("myawesomenewpassword")});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`7: ${e}`);
	}
	// 8 - successfully add to a user's questionIDs
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user2._id, questionIDs:[user1._id, ObjectId()]});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`8: ${e}`);
	}
	// 9 - successfully change a user's graduation year
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user3._id, year:2021});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`9: ${e}`);
	}
	// 10 - no input
	uuTotalTests++;
	try {
		const user = await users.updateUser();
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`10: ${e}`);
	}
	// 11 - empty object
	uuTotalTests++;
	try {
		const user = await users.updateUser({});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`11: ${e}`);
	}
	// 12 - too few fields in input object
	uuTotalTests++;
	try {
		const user = await users.updateUser({firstName:"name"});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`12: ${e}`);
	}
	// 13 - missing id
	uuTotalTests++;
	try {
		const user = await users.updateUser({firstName:"name", lastName:"name"});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`13: ${e}`);
	}
	// 14 - id undefined
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:undefined,firstName:"name", lastName:"name"});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`14: ${e}`);
	}
	// 15 - id wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:"thisisanidstring",firstName:"name", lastName:"name"});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`15: ${e}`);
	}
	// 16 - invalid ObjectId
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:123456789,firstName:"name", lastName:"name"});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`16: ${e}`);
	}
	// 17 - user doesn't exist
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:ObjectId(),firstName:"name", lastName:"name"});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`17: ${e}`);
	}
	// 18 - input provided but undefined
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,firstName:undefined});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`18: ${e}`);
	}
	// 19 - firstName provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,firstName:1234});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`19: ${e}`);
	}
	// 20 - lastName provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,lastName:1234});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`20: ${e}`);
	}
	// 21 - email provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,email:1234});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`21: ${e}`);
	}
	// 22 - email provided but wrong format
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,email:"test@notavalidemail"});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`22: ${e}`);
	}
	// 23 - username provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,username:1234});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`23: ${e}`);
	}
	// 24 - username provided but wrong format
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,username:"this username has spaces"});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`24: ${e}`);
	}
	// 25 - hashedPassword provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,hashedPassword:1234});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`25: ${e}`);
	}
	// 26 - year provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,year:"1234"});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`26: ${e}`);
	}
	// 27 - relevantSubjects provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,relevantSubjects:1234});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`27: ${e}`);
	}
	// 28 - relevantSubjects provided but contains nonstrings
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,relevantSubjects:[1234]});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`28: ${e}`);
	}
	// 29 - relevantSubjects provided but contains empty strings
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,relevantSubjects:['  ']});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`29: ${e}`);
	}
	// 30 - userType provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,userType:1234});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`30: ${e}`);
	}
	// 31 - userType provided but empty string
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,userType:'   '});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`31: ${e}`);
	}
	// 32 - userType provided but invalid string
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,userType:'iamnotavalidusertype'});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`32: ${e}`);
	}
	// 33 - tutorList provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,tutorList:1234});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`33: ${e}`);
	}
	// 34 - tutorList provided but contains non-ObjectIds
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,tutorList:[1234]});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`34: ${e}`);
	}
	// 35 - questionIDs provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,questionIDs:1234});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`35: ${e}`);
	}
	// 36 - questionIDs provided but contains non-ObjectIds
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,questionIDs:[1234]});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`36: ${e}`);
	}
	// 37 - ratings provided but wrong type
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,ratings:1234});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`37: ${e}`);
	}
	// 38 - ratings provided but empty
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,ratings:{}});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`38: ${e}`);
	}
	// 39 - ratings provided but contains wrong key
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,ratings:{thisisthewrongkey: [ObjectId()]}});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`39: ${e}`);
	}
	// 40 - ratings provided but contains invalid values
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,ratings:{tutorRating: ObjectId()}});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`40: ${e}`);
	}
	// 41 - ratings provided but contains invalid values
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,ratings:{tutorRating: ['thisisnotanid']}});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`41: ${e}`);
	}
	// 42 - successfully overwrite subjects
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user2._id, relevantSubjects:['new subject1','new subject2']});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`42: ${e}`);
	}
	// 43 - ratings.avgRating provided but wrong format
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,ratings: {avgRating: "rating"}});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`43: ${e}`);
	}
	// 44 - ratings.avgRating provided but wrong format
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,ratings: {avgRating: [user1._id]}});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`44: ${e}`);
	}
	// 45 - successfully update ratings.avgRating
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id, ratings:{avgRating: 3}});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`45: ${e}`);
	}
	// 46 - ratings.avgRating provided but out of range
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,ratings: {avgRating: 0}});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`46: ${e}`);
	}
	// 47 - ratings.avgRating provided but out of range
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id,ratings: {avgRating: 11}});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`47: ${e}`);
	}
	// 48 - ratings.answerRatingByStudents provided but duplicate (should error because no valid inputs)
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user1._id, ratings:{answerRatingByStudents: [user2._id]}});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`48: ${e}`);
	}
	// 49 - questionIDs provided but duplicate (should error because no valid inputs)
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user2._id, questionIDs:[user1._id]});
		uuFailedTests.push(user);
	} catch (e) {
		console.log(`49: ${e}`);
	}
	// 50 - successfully updated questionIDs
	uuTotalTests++;
	try {
		const user = await users.updateUser({id:user2._id, questionIDs:[ObjectId(), ObjectId(), ObjectId()]});
		console.log(user);
	} catch (e) {
		uuFailedTests.push(`45: ${e}`);
	}


	/* get related users */
	console.log("\ngetRelatedUsers:")
	// 0 - successfully get users
	grTotalTests++;
	try {
		const relUsers = await users.getRelatedUsers(user2._id);
		console.log(relUsers);
	} catch (e) {
		grFailedTests.push(`0: ${e}`);
	}
	// 1 - no inputs
	grTotalTests++;
	try {
		const user = await users.getRelatedUsers();
		grFailedTests.push(user);
	} catch (e) {
		console.log(`1: ${e}`);
	}
	// 2 - id undefined
	grTotalTests++;
	try {
		const user = await users.getRelatedUsers(undefined);
		grFailedTests.push(user);
	} catch (e) {
		console.log(`2: ${e}`);
	}
	// 3 - id null
	grTotalTests++;
	try {
		const user = await users.getRelatedUsers(null);
		grFailedTests.push(user);
	} catch (e) {
		console.log(`3: ${e}`);
	}
	// 4 - wrong type
	grTotalTests++;
	try {
		const user = await users.getRelatedUsers('thisisanid');
		grFailedTests.push(user);
	} catch (e) {
		console.log(`4: ${e}`);
	}
	// 5 - invalid ObjectId
	grTotalTests++;
	try {
		const user = await users.getRelatedUsers(123456789);
		grFailedTests.push(user);
	} catch (e) {
		console.log(`5: ${e}`);
	}
	// 6 - user not found
	grTotalTests++;
	try {
		const user = await users.getRelatedUsers(ObjectId());
		grFailedTests.push(user);
	} catch (e) {
		console.log(`6: ${e}`);
	}

	/* remove user from tutorList */
	console.log('\nremoveUserFromTutorList:');
	// 0 - successfully update user's tutorList
	ruTotalTests++;
	console.log(await getUserById(user2._id))
	try {
		const message = await users.removeUserFromTutorList(user1._id,user2._id);
		console.log(message);
	} catch (e) {
		ruFailedTests.push(`0: ${e}`);
	}
	ruTotalTests++;
	try {
		const user = await users.removeUserFromTutorList();
		ruFailedTests.push(user);
	} catch (e) {
		console.log(`1: ${e}`);
	}
	// 2 - id undefined
	ruTotalTests++;
	try {
		const user = await users.removeUserFromTutorList(undefined,user2._id);
		ruFailedTests.push(user);
	} catch (e) {
		console.log(`2: ${e}`);
	}
	// 3 - id null
	ruTotalTests++;
	try {
		const user = await users.removeUserFromTutorList(user2._id,null);
		ruFailedTests.push(user);
	} catch (e) {
		console.log(`3: ${e}`);
	}
	// 4 - wrong type
	ruTotalTests++;
	try {
		const user = await users.removeUserFromTutorList('thisisanid',user1._id);
		ruFailedTests.push(user);
	} catch (e) {
		console.log(`4: ${e}`);
	}
	// 5 - invalid ObjectId
	ruTotalTests++;
	try {
		const user = await users.removeUserFromTutorList(user1._id,123456789);
		ruFailedTests.push(user);
	} catch (e) {
		console.log(`5: ${e}`);
	}
	// 6 - user not found
	ruTotalTests++;
	try {
		const user = await users.removeUserFromTutorList(ObjectId(),user2._id);
		ruFailedTests.push(user);
	} catch (e) {
		console.log(`6: ${e}`);
	}
	// 7 - user's tutorList is empty
	ruTotalTests++;
	try {
		const message = await users.removeUserFromTutorList(user2._id, user1._id);
		ruFailedTests.push(`7: ${message}`);
	} catch (e) {
		console.log(`7: ${e}`);
	}


	// display total number of tests + any failed tests
	console.log('\nResults:')
	console.log(`createUser tests: ${cuTotalTests}, failed: ${cuFailedTests.length}`);
	cuFailedTests.forEach((test) => console.log(test));
	console.log(`\ngetUserById tests: ${giTotalTests}, failed: ${giFailedTests.length}`);
	giFailedTests.forEach((test) => console.log(test));
	console.log(`\ngetUserByEmail tests: ${geTotalTests}, failed: ${geFailedTests.length}`);
	geFailedTests.forEach((test) => console.log(test));
	console.log(`\ngetUserByUsername tests: ${guTotalTests}, failed: ${guFailedTests.length}`);
	guFailedTests.forEach((test) => console.log(test));
	console.log(`\ndeleteUser tests: ${duTotalTests}, failed: ${duFailedTests.length}`);
	duFailedTests.forEach((test) => console.log(test));
	console.log(`\nupdateUser tests: ${uuTotalTests}, failed: ${uuFailedTests.length}`);
	uuFailedTests.forEach((test) => console.log(test));
	console.log(`\ngetRelatedUsers tests: ${grTotalTests}, failed: ${grFailedTests.length}`);
	grFailedTests.forEach((test) => console.log(test));
	console.log(`\nremoveUserFromTutorList tests: ${ruTotalTests}, failed: ${ruFailedTests.length}`);
	ruFailedTests.forEach((test) => console.log(test));

	console.log('\nDone seeding database');
	await db.serverConfig.close();
}

main();