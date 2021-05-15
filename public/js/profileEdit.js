//on load of this page, get all the user's questions by id
//replace the questions array with the actual question objects so info can be retrieved from handlebars
$(document).ready(function(){
    $('#ratingSection').empty();
    $.ajax({
        method: 'POST',
        url: '/profile/rating/',
        contentType: 'application/json',
        data: JSON.stringify({
            ratedUsername: $('#givenUsername').html()
        })
    }).then(function (res){
        //console.log(res);
        if (res.message === 'OK'){
            var newButton = '<button id="ratingButton">Rate this Tutor</button>';
            $('#ratingSection').append(newButton);
            $('#ratingButton').click(function(event){
                event.preventDefault();
                $('#shownInfo').hide();
                $('#ratingFormSection').show();
                //if clicked, hide the shown info and show a rating form
            })
        }
        else{
            console.log(res.message);
            //in all other cases, rating is not possible, so do not display
            $('#ratingSection').empty();
            $('#ratingSection').append(res.message);
        }
    })

    $('#tutorList').empty();
    $.ajax({
        method: 'GET',
        url: `/profile/tutors/${$('#givenUsername').html()}`
    }).then(function(array){ //the new tutor list with info
        console.log("HELLO");
        if (array.length = 0){
            $('#tutorList').append('<p>No tutors assigned at this time</p>');
        } else {
            for (i = 0; i < array.length; i++){
                let string = '<li><a href="/profile/'+array[i].username+'">'+array[i].username+'</a></li>';
                $('#tutorList').appendChild(string);
            }
        }
    });
});

(function($){
    //getting content
    var shownInfo = $('#shownInfo');

    //get buttons
    var infoButton = $('#userInfoChange');
    var passwordButton = $('#passwordChange');

    //getting divs containing forms
    var passwordChange = $('#passwordChangeForm');
    var infoChange = $('#userInfoChangeForm');

    //get error groups
    var passwordErrors = $('#passwordErrors');
    var userInfoErrors = $('#userInfoErrors');

    //when the user wants to change their password
    passwordButton.click((event) => {
        passwordErrors.empty();
        //hide the shown information
        shownInfo.css("display","none");
        //show the password form
        passwordChange.toggle();
    });

    infoButton.click((event) =>{
        userInfoErrors.empty();
        //hide shown information
        shownInfo.css("display", "none");
        //show the info change details
        infoChange.css("display", "block");
    });

    var passwordChangeForm = $('#passChange');
    var infoChangeForm = $('#infoChange');

    //on submit of password change form
    passwordChangeForm.submit(function(event){
        passwordErrors.empty();
        passwordErrors.hide();
        event.preventDefault();
        let numErrors = 0;

        //get the fields
        var currentPassword = $('#currentPassword').val();
        var newPassword = $('#newPassword').val();
        var confirmPassword = $('#confirmPassword').val();
        try{
            if (!currentPassword || currentPassword === undefined || currentPassword === null){
                throw "Missing current password";
            }
            if (typeof currentPassword !== 'string' || currentPassword.trim() === ""){
                throw "Current password is of incorrect type";
            }
        }catch(e){
            passwordErrors.append()
            numErrors++;
        } 
        try{
            if (!newPassword || newPassword === undefined || newPassword === null){
                throw "Missing new password";
            }
            if (typeof newPassword !== 'string' || newPassword.trim() === ""){
                throw "New password is of incorrect type";
            }
            
        } catch(e){
            passwordErrors.append()
            numErrors++;
        }
        try{        
            if (typeof confirmPassword !== 'string' || confirmPassword.trim() === ""){
                throw "Confirm password is of incorrect type";
            }
            if (!confirmPassword || confirmPassword === undefined || confirmPassword === null){
                throw "Missing confirmation of new password";
            }
        }catch(e){
            passwordErrors.append()
            numErrors++;
        }
        try{
            if (newPassword.trim() !== confirmPassword.trim()) {
                throw "New passwords do not match";
            }
            newPassword = newPassword.trim();
            confirmPassword = confirmPassword.trim();
            //same password requirements as in the create user - 8 - 254 characters, at least 1 # and 1 letter
            //checking current password because if it doesn't meet the requirements, it can't be right
            if (currentPassword.length < 8) throw 'Current password must contain at least 8 characters';
            if (newPassword.length < 8 || confirmPassword.length < 8) throw 'New password must contain at least 8 characters';
        } catch(e){
            passwordErrors.append()
            numErrors++;
        }
        const passwordNumberRE = /[0-9]+/;
		const passwordLetterRE = /[a-zA-Z]+/;
        try{
            if (currentPassword.length > 254) throw 'Current password may contain at maximum 254 characters';
            if (!passwordNumberRE.test(currentPassword) || !passwordLetterRE.test(currentPassword)) throw 'Current password must contain at least one letter and one number.';
        } catch(e){
            passwordErrors.append()
            numErrors++;
        }
        try{
            if (newPassword.length > 254 || confirmPassword.length > 254) throw 'New password may contain at maximum 254 characters';
			if (!passwordNumberRE.test(newPassword) || !passwordLetterRE.test(newPassword) || !passwordNumberRE.test(confirmPassword) || !passwordLetterRE.test(confirmPassword)) throw 'New password must contain at least one letter and one number.';
        }catch(e){
            passwordErrors.append()
            numErrors++;
        }
        if (numErrors>0){
            passwordErrors.show();
            //show the errors, don't make a request
        } else{
            var requestConfig = {
                method: 'POST',
                url: '/profile/password',
                contentType: 'application/json',
                data: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword
                }),
                error: function (e){
                    alert(`Password could not be changed ${e}`);
                }
            };
            $.ajax(requestConfig).then(function (res) {
                if (res.message === "success" ){
                    //PASSWORD COULD BE CHANGED ONLY
                    $("#passChange :input").val("");
                    passwordChange.css("display","none");
                    shownInfo.css("display", "block");
                    shownInfo.before("<p>Password Changed successfully</p>");
                }
            });
        }
            

    });

    $(".return").click((event) => {
        event.preventDefault();
        $("#passChange :input").val("");
        $("#infoChange :input").val("");
        $("#ratingForm :input").val("");
        //if the return button is clicked, hide all forms just in case
        passwordChange.css("display", "none");
        infoChange.css("display", "none");
        $("#ratingFormSection").css("display", "none");
        //unhide the user's profile/shownInfo
        shownInfo.css("display", "flex");
    });


    //on change of user information
    infoChangeForm.submit((event)=>{
        event.preventDefault();

        var username = $('#username').val();
        var firstName = $('#firstName').val();
        var lastName = $('#lastName').val();
        var email = $('#email').val().toLowerCase();
        //relevant subjects ?
        var year = $('#year').val();

        let fieldsToChange = {};
        let numChanged = 0;

        if (username !== undefined && username !== null && username.trim() !== ''){
            //the user would like to change their username as they included the value
            //must check the username input
            try{
                if (typeof username !== 'string') throw "Username must be a string";
                username = username.trim();
                if (username.length > 254) throw "Username has a maximum length of 254 characters";
                const usernameRE = /^([a-zA-Z0-9\-\_\.]+)$/;
                if (!usernameRE.test(username)) throw 'Username may only contain alphanumeric characters, ., _, or -.';
                fieldsToChange['username'] = username;
            } catch(e) {
                console.log(e);
                //TODO figure out what to do with errors when thrown
            }
        }
        
        if (year !== undefined && year !== null && year !== ''){
            //the user would like to change their grad year
            //check input
            try{
                year = parseInt(year);
                if (isNaN(year)) throw 'Grad year must be a number';
                if (year < 1900 || year > 2100) throw 'Grad year must make sense :)';
                const yearRE = /^\d\d\d\d$/;
			    if (!yearRE.test(year)) throw 'Graduation Year must be of the form YYYY.';
                fieldsToChange['year'] = year;
            } catch (e) {
                //TODO
                console.log(e);
            }
            
        }

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
                fieldsToChange['firstName'] = firstName;
            }catch (e){
                //TODO
                console.log(e);
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
                fieldsToChange['lastName'] = lastName;
            } catch (e) {
                //TODO
                console.log(e);
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
                fieldsToChange['email'] = email;
            } catch(e){
                //TODO
                console.log(e);
            }
        }
        //if all fields are checked and errors, show the user the errors and prevent their submission
        //else, set up the request, and send it
        var requestConfig = {
            method: 'POST',
            url: '/profile',
            contentType: 'application/json',
            data: JSON.stringify(fieldsToChange),
            error: function (e){
                infoChangeForm.before(`<p>User information could not be changed ${e}</p>`);
            }
        };
        $.ajax(requestConfig).then(function(res){
            if (res.message === "success" ){
                //USER COULD BE CHANGED ONLY
                $("#infoChange :input").val("");
                console.log("successful");
                window.location.href = '/profile';
            }
        });
        //if successful, return the user back to the main page, and show a box that says successful
        //if unsuccessful, keep the user on the change password page and report back on errors
    });


})(window.jQuery);