const express = require('express');
const router = express.Router();

// how to get type of user?

// render the login page
router.get('/',(req,res) => {
	res.render('users/login',{title:"Log In"});
})

module.exports = router;