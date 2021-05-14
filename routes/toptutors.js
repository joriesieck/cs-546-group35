const express = require('express');
const router = express.Router();
const userData = require('../data/users');

router.get('/', async (req, res) => {
    if (!req.session.user){
        res.redirect('/');
    }

    try{
        const tutors = await userData.getTopTutors();
        if (!tutors || tutors.length < 1) {
            throw "No tutors to rank";
        }
        else{
            res.status(200).render('users/toptutors',{
                tutors: tutors
            });
            return;
        }
    }catch(e){
        res.status(400).json({error: e});
    }
    
});

router.use('*', (req, res) => {
    res.redirect('/toptutors');
});

module.exports = router;