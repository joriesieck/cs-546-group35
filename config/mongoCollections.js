/**
 * mongoCollections.js
 * source: Lecture 4 code
 */

 const dbConnection = require("./mongoConnection");

 const getCollectionFN = (collection) => {
	 let _col = undefined;
 
	 return async () => {
		 if (!_col) {
			 const db = await dbConnection();
			 _col = await db.collection(collection);
		 }
 
		 return _col;
	 }
 }
 
 module.exports = {
	 users: getCollectionFN('users')
 }