const express = require('express');
const router = express.Router();
const userData = require('../data/users');
const ratingsData = require('../data/ratings');
//getAllUsersRatings //getAllRatings

router.get('/', async (req, res) => {
    //query the database for the top 10 users by each rating
    //tutorAnswer, studentAnswer, and tutor experience
    //return each of these lists separately
    //ajax can then take these and make them pretty
});

router.use('*', (req, res) => {
    res.redirect('/toptutors');
});

module.exports = router;