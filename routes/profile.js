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
                    title: `${user.username}'s Profile`,
                    loggedIn: true
                });
            } else{ //is a tutor
                res.status(200).render('profile/tutor',{
                    user: user,
                    self: true,
                    title: `${user.username}'s Profile`,
                    loggedIn: true
                });
            }
           
        }
    } catch(e) {
        res.status(400).json({error: e});
    }
});

//Making a change to the profile/user information
//all fields optional
router.post('/', (req, res) => {
    //if posting to root route, user can only be editing their own profile
    if (!req.session.user){
        res.redirect('/login');
    }
    let firstName = xss(req.body.firstName);
    let lastName = xss(req.body.lastName);
    let email = xss(req.body.email);
    let username = xss(req.body.username);
    let year = parseInt(xss(req.body.year));
    let subjects = xss(req.body.subjects);

    let username = req.session.user.username;

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
    if (username!==undefined && username!==null && username.trim()!==''){
        changeFields['username'] = username;
        numChanged++;
    }
    if (year!==undefined && year!==null && year.trim()!==''){
        changeFields['year'] = year;
        numChanged++;
    }
    if (subjects!==undefined && subjects!==null && subjects!==[]){
        changeFields['relevantSubjects'] = subjects;
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
        const updatedUser = userData.updateUser(changeFields);
        if (updatedUser){
            if (updatedUser.userType === 'student'){
                res.status(200).render('profile/student',{
                    user: updatedUser,
                    self: true,
                    title: `${updatedUser.username}'s Profile`,
                    loggedIn: true,
                    message: 'Successfully changed user information!'
                });
            } else { //tutor
                res.status(200).render('profile/tutor',{
                    user: updatedUser,
                    self: true,
                    title: `${updatedUser.username}'s Profile`,
                    loggedIn: true,
                    message: 'Successfully changed user information!'
                });
            }
        }
    } catch(e){
        res.status(400).json({error: `Error in POST /profile while updating the user in db: ${e}`});
        return;
    }
});

router.post('/password', (req, res) => {
    //as all fields here are required, I felt a separate function made sense
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

        ({userId, hashedPassword} = await userData.getUserByUsername(username));
        if (!hashedPassword) throw `No password found for user ${username}.`;

        const match = await bcrypt.compare(currentPassword, hashedPassword);

        if (!match) throw "Cannot change password - current password is incorrect";

    }catch(e){
        res.status(400).json({error: `Error in /password POST: {e}`});
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
                if (user.userType === 'student'){
                    res.status(200).render('profile/student',{
                        user: user,
                        self: true,
                        title: `${user.username}'s Profile`,
                        loggedIn: true,
                        message: 'Successfully changed password!'
                    });
                } else {
                    //tutor
                    res.status(200).render('profile/tutor',{
                        user: user,
                        self: true,
                        title: `${user.username}'s Profile`,
                        loggedIn: true,
                        message: 'Successfully changed password!'
                    });
                }
            } else {
                throw 'Your password could not be changed';
            }
        } catch(e){
            res.status(400).json({error: e});
            return;
        }
    });
})

//getting another user's profile
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
        return;
    }   
});

router.use('*', (req, res) => {
    res.redirect('/profile');
});

module.exports = router;