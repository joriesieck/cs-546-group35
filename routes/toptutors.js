const express = require('express');
const router = express.Router();
const userData = require('../data/users');
const ratingsData = require('../data/ratings');
//getAllUsersRatings //getAllRatings

router.get('/', async (req, res) => {
    //
});

router.use('*', (req, res) => {
    res.redirect('/toptutors');
});

module.exports = router;