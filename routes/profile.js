const express = require('express');
const router = express.Router();
const userData = require('../data/users');

//handles all routes related to the user profiles for tutors and students

//middleware, must be logged in to access any routes, otherwise redirect to login

router.get('/', (req, res) => {
    //if getting the root route, user should always be logged in.
    //if not redirect to login

    //if logged in, user should be getting their own profile page with their 
    //getRelatedUsers(user) to get tutor list
    //res.status(200).render('profile/userpage', {user: req.session.user})
    //all information should be there

});

router.post('/', (req, res) => {
    //middleware, must be 
    //if posting to root route, user is editing their profile

    //call updateUser
    //must have at least one field changed and include the _id

    //render the profile handlebars page again with the new user data status 200
    //any issues 401
});

router.get('/:username', (req,res) =>{
    //middleware, only tutors can access this route as others cant see profiles

    //
});