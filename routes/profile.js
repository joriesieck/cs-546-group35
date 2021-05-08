const express = require('express');
const router = express.Router();
const xss = require('xss');
const bcrypt = require('bcryptjs');
const userData = require('../data/users');

const saltRounds = 16;

//Always user's own profile
router.get('/', async (req, res) => {
    //if no logged in user redirect to login
    try{
        if (!req.session.user){
            res.redirect('/login');
        }
        //if logged in, user should be getting their own profile page with their 
        const user = await userData.getUserByUsername(req.session.user.username);
        if (!user){
            res.redirect('/login');
        } else {
            console.log(user);
            //we have a user and can render it
            if (user.userType === "student"){
                res.status(200).render('profile/student',{
                    user: user,
                    self: true,
                    title: `${user.username}'s Profile`
                });
            } else{ //is a tutor
                res.status(200).render('profile/tutor',{
                    user: user,
                    self: true,
                    title: `${user.username}'s Profile`
                });
            }
           
        }
    } catch(e) {
        res.status(400).json({error: e});
    }
});

//Making a change to the profile 
router.post('/', (req, res) => {
    //if posting to root route, user can only be editing their own profile
    try{
        if (!req.session.user){
            res.redirect('/login');
        }

        const updatedUser = userData.updateUser();
    } catch(e){

    }

    //call updateUser
    //must have at least one field changed and include the _id

    //render the profile handlebars page again with the new user data status 200
    //any issues 401
});

router.get('/:username', (req,res) =>{
    try{
        if (!req.session.user){
            res.redirect('/');
        }
        if (!req.params.username || typeof req.params.username !== 'string' || req.params.username === ""){
            throw "Username is incorrect";
        }
        //only tutors can access this route as others cant see profiles
        const user = userData.getUserByUsername(req.session.user.username); //get the user requesting the route
        //check if they're a tutor
        if (user.userType !== "tutor"){
            //they're a student and can't access this route
            res.redirect('/');
        } else {
            //they're a tutor and can
            const retrievedUser = userData.getUserByUsername(req.params.username);
            if (!retrievedUser){
                //the user doesn't exist
                //send to the main page
                res.redirect('/');
            } else {
                //got it
                if (req.session.user.username === retrievedUser.username){
                    res.redirect('/profile'); //they're requesting their own profile for some reason?
                }
                if (retrievedUser.userType === "tutor"){
                    //tutor type
                    res.status(200).render('profile/tutor', {
                        user: retrievedUser,
                        self: false,
                        title: `${retrievedUser.username}'s Profile`,
                        loggedIn: true
                    })
                } else{
                    res.status(200).render('profile/student', {
                        user: retrievedUser,
                        self: false,
                        title: `${retrievedUser.username}'s Profile`,
                        loggedIn: true
                    });
                }
            }
        }
    } catch (e) {
        res.status(400).json({error: e});
    }   
});

router.use('*', (req, res) => {
    res.redirect('/profile');
});

module.exports = router;