//on load of this page, get all the user's questions by id
//replace the questions array with the actual question objects so info can be retrieved from handlebars

//also replace the tutor IDs with links to tutor profiles
//get the user by ID and make sure the link shows name

(function($){
    //getting content
    var shownInfo = $('#shownInfo');

    //get buttons
    var infoButton = $('#userInfoChange');
    var passwordButton = $('#passwordChange');

    //getting divs containing forms
    var passwordChange = $('#passwordChangeForm');
    var infoChange = $('#userInfoChangeForm');

    //when the user wants to change their password
    passwordButton.click((event) => {
        //hide the shown information
        shownInfo.toggle();
        //show the password form
        passwordChange.toggle();
    });

    infoButton.click((event) =>{
        //hide shown information
        shownInfo.css("display", "none");
        //show the info change details
        infoChange.css("display", "block");
    });

    var passwordChangeForm = $('#passChange');
    var infoChangeForm = $('#infoChange');

    //on submit of password change form
    passwordChangeForm.submit(function(event){
        event.preventDefault();

        //get the fields
        var currentPassword = $('#currentPassword').val();
        var newPassword = $('#newPassword').val();
        var confirmPassword = $('#confirmPassword').val();
        try{
            if (!currentPassword || currentPassword === undefined || currentPassword === null){
                throw "Missing current password";
            }
            if (!newPassword || newPassword === undefined || newPassword === null){
                throw "Missing new password";
            }
            if (!confirmPassword || confirmPassword === undefined || confirmPassword === null){
                throw "Missing confirmation of new password";
            }
            if (typeof currentPassword !== 'string' || currentPassword.trim() === ""){
                throw "Current password is of incorrect type";
            }  
            if (typeof newPassword !== 'string' || newPassword.trim() === ""){
                throw "New password is of incorrect type";
            }
            if (typeof confirmPassword !== 'string' || confirmPassword.trim() === ""){
                throw "Confirm password is of incorrect type";
            }
            if (newPassword.trim() !== confirmPassword.trim()) {
                throw "New passwords do not match";
            }
            //same password requirements as in the create user - 8 - 254 characters, at least 1 # and 1 letter
            //checking current password because if it doesn't meet the requirements, it can't be right
            if (currentPassword.length < 8) throw 'Current password must contain at least 8 characters';
            if (newPassword.length < 8 || confirmPassword.length < 8) throw 'New password must contain at least 8 characters';
            
            if (currentPassword.length > 254) throw 'Current password may contain at maximum 254 characters';
            if (newPassword.length > 254 || confirmPassword.length > 254) throw 'New password may contain at maximum 254 characters';

            const passwordNumberRE = /[0-9]+/;
			const passwordLetterRE = /[a-zA-Z]+/;
			if (!passwordNumberRE.test(currentPassword) || !passwordLetterRE.test(currentPassword)) throw 'Current password must contain at least one letter and one number.';
			if (!passwordNumberRE.test(newPassword) || !passwordLetterRE.test(newPassword) || !passwordNumberRE.test(confirmPassword) || !passwordLetterRE.test(confirmPassword)) throw 'New password must contain at least one letter and one number.';

            var requestConfig = {
                method: 'POST',
                url: '/profile',
                contentType: 'application/json',
                data: JSON.stringify({
                    currentPassword,
                    newPassword
                }),
                error: function (e){
                    console.log(e);
                }
            };
            $.ajax(requestConfig).then(function (res) {
                if (res.message === "currentPassword"){
                    //current password was wrong, so password could not be changed
                } else if (res.message === "newPassword") {
                    //new password was a problem, so password could not be changed
                } else if (res.message === "success"){
                    //PASSWORD COULD BE CHANGED ONLY
                } else {
                    //unspecified error, throw and check value
                }
            })

            //make a request to the server to figure out if the currentPassword matches the db
            //post request to the profiles route
            //if it matches, call updateUser with our user's id and the hashed password
            //if it does not match, clear all the fields, throw an error, and leave up the password update page

        } catch(e){

        }
    });

    $(".return").click((event) => {
        //if the return button is clicked, hide both forms just in case
        passwordChange.css("display", "none");
        infoChange.css("display", "none");
        //unhide the user's profile/shownInfo
        shownInfo.css("display", "block");
    });


    //on change of user information
    infoChangeForm.submit((event)=>{
        event.preventDefault();

        var username = $('#username').val();
        var profilePicture = $('#profilePicture').val();
        var firstName = $('#firstName').val();
        var lastName = $('#lastName').val();
        var email = $('#email').val().toLowerCase();
        //relevant subjects ?
        var year = parseInt($('#year').val());

        if (username !== undefined && username !== null && username.trim() !== ''){
            //the user would like to change their username as they included the value
            //must check the username input
            try{
                if (typeof username !== 'string') throw "Username must be a string";
                username = username.trim();
                if (username.length > 254) throw "Username has a maximum length of 254 characters";
                const usernameRE = /^([a-zA-Z0-9\-\_\.]+)$/;
                if (!usernameRE.test(username)) throw 'Username may only contain alphanumeric characters, ., _, or -.';
            } catch(e) {
                //TODO figure out what to do with errors when thrown
            }
        }
        
        if (year !== undefined && year !== null && year.trim() !== ''){
            //the user would like to change their grad year
            //check input
            try{
                if (isNaN(year)) throw 'Grad year must be a number';
                if (year < 1900 || year > 2100) throw 'Grad year must make sense :)';
                year = year.trim();
                const yearRE = /^\d\d\d\d$/;
			    if (!yearRE.test(year)) throw 'Graduation Year must be of the form YYYY.';
            } catch (e) {
                //TODO
            }
            
        }

        //profile picture check

        //first and last name check
        if (firstName !== undefined && firstName !== null && firstName.trim() !== ''){
            //the user would like to change their first name
            //check the input
            try{
                if (typeof firstName !== 'string') throw 'First name must be a string';
                firstName = firstName.trim();
                if (firstName.length > 254) throw 'First name may not contain more than 254 characters';
                const nameRE = /^([a-zA-Z'\- ]+)$/;
			    if (!nameRE.test(firstName)) throw 'First Name may only contain alphabet characters, \' , -, or spaces.';
            }catch (e){
                //TODO
            }
        }

        if (lastName !== undefined && lastName !== null && lastName.trim() !== ''){
            //the user would like to change their last name
            //check the input
            try {
                if (typeof lastName !== 'string') throw 'Last name must be a string';
                lastName = lastName.trim();
                if (lastName.length > 254) throw 'Last Name may not contain more than 254 characters';
                const nameRE = /^([a-zA-Z'\- ]+)$/;
			    if (!nameRE.test(lastName)) throw 'Last Name may only contain alphabet characters, \' , -, or space.';
            } catch (e) {
                //TODO
            }
        }

        //email check
        if (email !== undefined && email !== null && email.trim() !== ''){
            //user would like to change their email
            //check the input
            try{
                if (typeof email !== 'string') throw 'Email must be a string';
                if (email.length > 254) throw 'Email may not contain more than 254 characters';
                if (email.length < 6) throw 'Email must make sense :)';
                // must be in correct email format
                // regex source: https://www.geeksforgeeks.org/write-regular-expressions/
                const emailRE = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
                if (!emailRE.test(email)) throw 'Email must be of the format example@domain.suffix.';
            } catch(e){
                //TODO
            }
        }

        //if all fields are checked and errors, show the user the errors and prevent their submission
        //else, set up the request, and send it
        //if successful, return the user back to the main page, and show a box that says successful
        //if unsuccessful, keep the user on the change password page and report back on errors
    });

})(window.jQuery);