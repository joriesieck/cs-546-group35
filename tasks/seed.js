// import connection and data
const dbConnection = require('../config/mongoConnection');
const data = require('../data');
const users = data.users;

const main = async () => {
	// start the db connection
	const db = await dbConnection();
	// drop the database
	await db.dropDatabase();
	
	// 
}