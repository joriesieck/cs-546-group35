const express = require('express');
const router = express.Router();
const xss = require('xss');
const bcrypt = require('bcryptjs');
const userData = require('../data/users');
const questionsData = require('../data/questions');
const ratingsData = require('../data/ratings');
const { ObjectId } = require('mongodb');

const saltRounds = 16;

//Always user's own profile
router.get('/', async (req, res) => {
    //if no logged in user redirect to login
    try{
        if (!req.session.user){
            return res.redirect('/login');
        }
        //if logged in, user should be getting their own profile page with their 
        const user = await userData.getUserByUsername(req.session.user.username);
        if (!user){
            res.redirect('/login');
        } else {
            //we have a user and can render it
            if (user.userType === "student"){
                //get their questions list to facilitate printing them
                const questionsList = await questionsData.getAllUsersQuestions(user._id);
                res.status(200).render('profile/student',{
                    user: user,
                    self: true,
                    title: `${user.username}'s Profile`,
                    questions: questionsList,
                    loggedIn: true
                });
            } else{ //is a tutor
                //get their answers list to facilitate printing them
                let answersList = [];
                for (answerId of user.questionIDs) {
                    try {
                        answersList.push(await questionsData.getAnswerById(answerId));
                    } catch (e) {
                        // just move on (no op)
                    }
                }
                res.status(200).render('profile/tutor',{
                    user: user,
                    self: true,
                    title: `${user.username}'s Profile`,
                    answers: answersList,
                    loggedIn: true
                });
            }
           
        }
    } catch(e) {
        res.status(400).json({error: `in GET /profile, ${e}`});
    }
});

//Making a change to the profile/user information
//all fields optional
router.post('/', async (req, res) => {
    //if posting to root route, user can only be editing their own profile
    if (!req.session.user){
        res.redirect('/login');
    }
    let firstName = xss(req.body.firstName);
    let lastName = xss(req.body.lastName);
    let email = xss(req.body.email);
    let newUsername = xss(req.body.username);
    let year = xss(req.body.year);
    let relevantSubjects = req.body.relevantSubjects;
    let username = req.session.user.username;

    // xss relevantSubjects
    for (let i=0; i<relevantSubjects.length;i++) {
        relevantSubjects[i] = xss(relevantSubjects[i]);
    }

    let changeFields = {}; //updateUser accepts an object
    let numChanged = 0;

    if (firstName!==undefined && firstName!==null && firstName.trim()!==''){
        changeFields['firstName'] = firstName;
        numChanged++;
    }
    if (lastName!==undefined && lastName!==null && lastName.trim()!==''){
        changeFields['lastName'] = lastName;
        numChanged++;
    }
    if (email!==undefined && email!==null && email.trim()!==''){
        changeFields['email'] = email;
        numChanged++;
    }
    if (newUsername!==undefined && newUsername!==null && newUsername.trim()!==''){
        changeFields['username'] = newUsername;
        numChanged++;
    }
    if (year!==undefined && year!==null && year!==''){
        changeFields['year'] = parseInt(year);
        numChanged++;
    }
    if (relevantSubjects!==undefined && relevantSubjects!==null && relevantSubjects!==[] && Array.isArray(relevantSubjects)){
        changeFields['relevantSubjects'] = relevantSubjects;
        numChanged++;
    }
    if (numChanged === 0){
        //they aren't changing any fields...what
        res.status(400).json({error: 'Nothing to change!'});
        return;
    }
    let userId;
    try{
        const user = await userData.getUserByUsername(username);
        if (!user || !user._id){
            throw 'User could not be found';
        }
        userId = user._id;
    } catch(e){
        res.status(400).json({error: `Error in POST /profile while getting the user: ${e}`});
        return;
    }

    changeFields['id'] = userId;

    try{
        const updatedUser = await userData.updateUser(changeFields);
        if (updatedUser){
            req.session.user.username = updatedUser.username;
            res.status(200).json({message: "success"});
        }
    } catch(e){
        res.status(400).json({error: `Error in POST /profile while updating the user in db: ${e}`});
        return;
    }
});

router.post('/password', async (req, res) => {
    //as all fields here are required, I felt a separate function made sense
    //no matter where the post request is made from, the user can only change their own password
    if (!req.session.user){
        res.redirect('/login');
    }
    let username = req.session.user.username;
    let currentPassword = xss(req.body.currentPassword);
    let newPassword = xss(req.body.newPassword);
    let confirmPassword = xss(req.body.confirmPassword);

    let hashedPassword, userId;
    try{
        if (!currentPassword || currentPassword === undefined || currentPassword === null) throw 'Current Password is missing';
        if (!newPassword || newPassword === undefined || newPassword === null) throw 'New Password is missing';
        if (!confirmPassword || confirmPassword === undefined || confirmPassword === null) throw 'Confirm Password is missing';

        if (typeof currentPassword !== 'string') throw 'Current Password must be a string';
        if (typeof newPassword !== 'string') throw 'New Password must be a string';
        if (typeof confirmPassword !== 'string') throw 'Confirm Password must be a string';

        newPassword = newPassword.trim();
        confirmPassword = confirmPassword.trim();

        if (newPassword === '') throw 'New Password cannot be only spaces/empty';
        if (confirmPassword === '') throw 'Confirm Password cannot be only spaces/empty';

        if (newPassword !== confirmPassword) throw 'New password and confirmed password do not match';

        if (newPassword.length < 8 || confirmPassword.length < 8) throw 'New password may not be less than 8 characters';
        if (newPassword.length > 254 || confirmPassword.length > 254) throw 'New password may not have more than 254 characters';
        const passwordNumberRE = /[0-9]+/;
		const passwordLetterRE = /[a-zA-Z]+/;
        if (!passwordNumberRE.test(newPassword) || !passwordNumberRE.test(confirmPassword) || !passwordLetterRE.test(newPassword) || !passwordLetterRE.test(confirmPassword)){
            throw 'New password must contain at least one letter and one number';
        }

        const user = await userData.getUserByUsername(username);
        if (!user){
            throw `Could not get user with username ${username}`;
        }
        hashedPassword = user.hashedPassword;
        userId = user._id;
        if (!hashedPassword) throw `No password found for user ${username}.`;

        const match = await bcrypt.compare(currentPassword, hashedPassword);

        if (!match) throw "Cannot change password - current password is incorrect";

    }catch(e){
        res.status(400).json({error: `Error in /password POST: ${e}`});
        return;
    }

    //if we've gotten here, user is authenticated again and passwords are ok, so we can now work to change the password

    //hash password to get ready to pass to database
    bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
        if (err) {
            res.status(400).json({error: err}); //bubble it
            return;
        }
        try {
            const user = await userData.updateUser({
                id: userId,
                hashedPassword: hash
            });
            if (user){
                res.status(200).json({message: "success"});
            } else {
                throw 'Your password could not be changed';
            }
        } catch(e){
            res.status(400).json({error: e});
            return;
        }
    });
});


//getting another user's profile
router.get('/:username', async (req,res) =>{
    try{
        if (!req.session.user){
            return res.redirect('/login');
        }
        if (!req.params.username || typeof req.params.username !== 'string' || req.params.username === ""){
            throw "Username is incorrect";
        }
        //only tutors can access this route as others cant see profiles
        const user = await userData.getUserByUsername(req.session.user.username); //get the user requesting the route
        if (!user) throw "No user found with this username";

        const retrievedUser = await userData.getUserByUsername(req.params.username);
        if (!retrievedUser){
            //the user doesn't exist
            //send to the main page
            return res.redirect('/login');
        } else {
            //got it
            if (req.session.user.username === retrievedUser.username){
                return res.redirect('/profile'); //they're requesting their own profile for some reason?
            }
            if (retrievedUser.userType === "tutor"){
                //tutor type
                let answersList = [];
                for (answerId of retrievedUser.questionIDs) {
                    try {
                        answersList.push(await questionsData.getAnswerById(answerId));
                    } catch (e) {
                        // just move on (no op)
                    }
                }
                res.status(200).render('profile/tutor', {
                    user: retrievedUser,
                    self: false,
                    title: `${retrievedUser.username}'s Profile`,
                    answers: answersList,
                    loggedIn: true
                });
                return;
            } else{
                if (user.userType !== "tutor"){
                    res.status(403).json({error: "You cannot visit this profile, as you are not a tutor"});
                    return;
                }
                const questionsList = await questionsData.getAllUsersQuestions(retrievedUser._id);
                res.status(200).render('profile/student', {
                    user: retrievedUser,
                    self: false,
                    title: `${retrievedUser.username}'s Profile`,
                    loggedIn: true,
                    questions: questionsList
                });
                return;
            }
        }
    } catch (e) {
        res.status(400).json({error: e});
        return;
    }   
});


//allows us to see if the user is allowed to rate the other user
router.post('/rating', async (req, res) => {
    if (!req.session.user){
        return res.redirect('/login');
    }
    //id of user that is desired to be rated rated
    let ratedUsername = xss(req.body.ratedUsername);
    try{
        if (!ratedUsername || ratedUsername === undefined || ratedUsername === null || typeof ratedUsername !== 'string' || ratedUsername.trim() === ''){
            throw "Username for the rated user is of improper format";
        }
        if (req.session.user.username === ratedUsername){
            res.status(200).json({message: 'SELF'});
            return;
        }
    
        const userRating = await userData.getUserByUsername(req.session.user.username);
        if (!userRating) throw "Could not find rater's user details";
        const userBeingRated = await userData.getUserByUsername(ratedUsername);
        if (!userBeingRated) throw "Could not find the desired-to-be-rated's user details";

        if (userBeingRated.userType !== 'tutor'){
            res.status(200).json({message: 'FALSE'});
            return;
        }

        if (userRating.userType !== 'student') {
            res.status(200).json({message: 'You are ineligible to rate this tutor'});
            return;
        }
        let found = false;
        for (tutor of userRating.tutorList){
            if (tutor.equals(userBeingRated._id)){
                found = true;
                break;
            }
        }
        if (!found){
            res.status(200).json({message: 'This is not a tutor on your tutor list'});
            return;
        }
        let hasRated = false;
        let savedRatingVal;
        const usersRatings = await ratingsData.getAllUsersRatings(userBeingRated._id);
        if (!usersRatings) throw "COULD NOT GET USER RATINGS";
        // console.log(usersRatings);
        if (usersRatings.length > 0){
            for (rating of usersRatings){
                // console.log(rating.userId);
                // console.log(userRating._id);
                if (rating.userId === userRating._id && rating.ratingType === "tutorRating"){
                    //the user has rated before
                    hasRated = true;
                    savedRatingVal = rating.ratingValue;
                    // console.log(`RATED ${savedRatingVal}`);
                    break;
                }
            }
        }
        if (hasRated){
            res.status(200).json({
                message: `You have already rated this tutor ${savedRatingVal}`, 
            });
            // console.log("HAVE RATED");
            return;
        } else {
            // console.log("OK");
            //should be able to submit a rating given all of this
            res.status(200).json({message: 'OK'});
        }
    } catch(e){
        // console.log(e);
        res.status(400).json({error: e});
        return;
    }   
});

router.post('/addRating', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    let ratedUsername = xss(req.body.ratedUsername);
    // console.log(ratedUsername);
    let rating = xss(req.body.rating);

    try{
        if (ratedUsername === undefined || ratedUsername === null || ratedUsername === ''){
            throw "Username for the rated user is of improper format"
        }
        if (typeof ratedUsername !== 'string') throw "Username for the rated user is not an string";
        if (rating === undefined || rating === null || rating === ''){
            throw "Rating is of improper format";
        }
        rating = parseInt(rating);
        if (isNaN(rating)) throw "Rating must be a valid integer";
        if (rating < 1 || rating > 10) throw "Rating may only be an integer from 1-10";
        const userSubmittingRating = await userData.getUserByUsername(req.session.user.username);
        if (!userSubmittingRating) throw "No user found by this username";
        const userBeingRated = await userData.getUserByUsername(ratedUsername);
        if (!userBeingRated) throw "No user found by this id";
        // console.log(`userBeingRated._id: ${userBeingRated._id}`)
        //we have all the info we need to make a rating, but need to make sure the tutor hasn't been rated by this other user
        const usersRatings = await ratingsData.getAllUsersRatings(userBeingRated._id);
        if (usersRatings.length !== 0){
            //we definitely need to check then!
            for (i = 0; i < usersRatings.length; i++){
                if (usersRatings[i].userId === userSubmittingRating._id){
                    throw "You cannot rate this tutor more than once";
                }
            }
        }
        //if we get here, the user has not rated the tutor before so this can be safely submitted
        const returnedRating = await ratingsData.createRating(userSubmittingRating._id, userBeingRated._id, rating, 'tutorRating');
        if (!returnedRating){
            throw "Something went wrong while attempting to create this rating";
        } else{
            res.status(200).json({message: 'success'});
            return;
        }
        
    } catch(e){
        // console.log(`error in POST /profile/addRating ${e}`);
        res.status(400).json({error: e});
        return;
    }
});

router.get('/tutors/:username', async (req,res) => {
    if (!req.session.user){
        return res.redirect('/login');
    }
    let username = req.params.username;
    try{
        if (!username || username === null || username === undefined || username.trim() === '' || typeof username !== 'string'){
            throw "Username is not in correct format";
        }
        const user = await userData.getUserByUsername(username);
        if (!user) throw "No user found with that username";
        let tutors = user.tutorList;
        let newTutorList = [];
        if (!tutors || tutors === [] || tutors.length < 1) return ['None'];
        for (i = 0; i < tutors.length; i++){
            const tutor = await userData.getUserById(tutors[i]);
            if (!tutor) throw "Not all tutors can be found";
            newTutorList[i] = tutor;
        }
        //console.log(newTutorList);
        res.status(200).send(newTutorList);
        return;
    }catch(e){
        return `Error: ${e}`;
    }
});

router.use('*', (req, res) => {
    res.redirect('/profile');
});

module.exports = router;