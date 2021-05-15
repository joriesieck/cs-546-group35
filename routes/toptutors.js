const express = require('express');
const router = express.Router();
const userData = require('../data/users');

router.get('/', async (req, res) => {
    if (!req.session.user){
        return res.redirect('/');
    }
    try{
        const tutors = await userData.getAllTutors();
        if (!tutors || tutors.length < 1) {
            throw "No tutors to rank";
        }
        tutors.sort(function(a,b){
            let ratingA = a.ratings.avgRating;
            let ratingB = b.ratings.avgRating;
            //descending order
            if (ratingA < ratingB) return 1;
            if (ratingA > ratingB) return -1;
            return 0;
        });
        res.status(200).render('users/toptutors',{
            title: "Top Rated Tutors",
            tutors: tutors,
            loggedIn: true
        });
        return;
    }catch(e){
        res.status(400).json({error: e});
    }
    
});

router.use('*', (req, res) => {
    res.redirect('/toptutors');
});

module.exports = router;