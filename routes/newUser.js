const express = require('express');
const router = express.Router();

// render the create user page
router.get('/',(req,res) => {
	res.render('users/new',{title:"Create Account"});
})

module.exports = router;