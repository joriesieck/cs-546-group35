const express = require('express');
const router = express.Router();

// render the create user landing page
router.get('/',(req,res) => {
	res.render('users/new-landing',{title:"Create An Account"});
});

// render the create student user page
router.get('/student',(req,res) => {
	res.render('users/new',{title:"Create A Student Account",isTutor:false});
});

// render the create tutor user page
router.get('/tutor',(req,res) => {
	res.render('users/new',{title:"Create A Tutor Account",isTutor:true});
})

module.exports = router;