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
            //in all other cases, rating is not possible, so do not display
            $('#ratingSection').empty();
            $('#ratingSection').append(res.message);
        }
    })

    $('#tutorList').empty();
    $.ajax({
        method: 'GET',
        dataType: 'json',
        url: `/profile/tutors/${$('#givenUsername').html()}`
    }).then(function(data){ //the new tutor list with info
        if (data.length === 0){
            $('#tutorList').append('<p>No tutors assigned at this time</p>');
        }
        else {
            for (i = 0; i < data.length; i++){
                let username = data[i].username;
                $('#tutorList').append('<li><a href="/profile/'+username+'">'+username+'</a></li>');
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
        infoChange.toggle();
    });

    var passwordChangeForm = $('#passChange');
    var infoChangeForm = $('#infoChange');

    //on submit of password change form
    passwordChangeForm.submit(function(event){
        passwordErrors.empty();
        let errorList = [];
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
            errorList.push(e);
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
            errorList.push(e);
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
            errorList.push(e);
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
            errorList.push(e);
            numErrors++;
        }
        const passwordNumberRE = /[0-9]+/;
		const passwordLetterRE = /[a-zA-Z]+/;
        try{
            if (currentPassword.length > 254) throw 'Current password may contain at maximum 254 characters';
            if (!passwordNumberRE.test(currentPassword) || !passwordLetterRE.test(currentPassword)) throw 'Current password must contain at least one letter and one number.';
        } catch(e){
            errorList.push(e);
            numErrors++;
        }
        try{
            if (newPassword.length > 254 || confirmPassword.length > 254) throw 'New password may contain at maximum 254 characters';
			if (!passwordNumberRE.test(newPassword) || !passwordLetterRE.test(newPassword) || !passwordNumberRE.test(confirmPassword) || !passwordLetterRE.test(confirmPassword)) throw 'New password must contain at least one letter and one number.';
        }catch(e){
            errorList.push(e);
            numErrors++;
        }
        if (errorList.length>0){
            errorList.forEach((error) => {
                var errorEl = $('<p>');
                errorEl.text(error);
                errorEl.appendTo(passwordErrors);
            });
            //passwordErrors.show();
            //show the errors, don't make a request
        } else{
            // render a paragraph to let the user know that their changes are being made
			var loadingMsg = $('<p>');
			loadingMsg.text('Please wait, we are updating your password...');
			passwordChangeForm.after(loadingMsg);
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
                    // hide the loading message
					loadingMsg.hide();
                    alert(`Password could not be changed ${e}`);
                }
            };
            $.ajax(requestConfig).then(function (res) {
                // hide the loading message
                loadingMsg.hide();
                if (res.message === "success" ){
                    //PASSWORD COULD BE CHANGED ONLY
                    $("#passChange :input").val("");
                    passwordChange.css("display","none");
                    shownInfo.css("display", "block");
                    var element = $('<p>');
                    element.text("Password successfully changed");
                    $('#messages').appendTo(element);
                }
            });
        }
    });

    $(".return").click((event) => {
        event.preventDefault();
        $('#messages').empty();
        $("#passChange :input").val("");
        $("#infoChange :input").val("");
        $("#ratingForm :input").val("");
        $('#passwordErrors').empty();
        $('#userInfoErrors').empty();
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
        var relevantSubjects = $('#relevantSubjects').val().toLowerCase();
        var year = $('#year').val();

        let errors = $('#userInfoErrors');
        errors.empty();

        let errorList = [];

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
                numChanged++;
            } catch(e) {
                errorList.push(e);
            }
        }
        
        if (year !== undefined && year !== null && year !== ''){
            //the user would like to change their grad year
            //check input
            try{
                year = parseInt(year);
                if (isNaN(year)) throw 'Grad year must be a number';
                if (year < 1900 || year > 2100) throw 'Grad year must be between 1900 and 2100';
                const yearRE = /^\d\d\d\d$/;
			    if (!yearRE.test(year)) throw 'Graduation Year must be of the form YYYY.';
                fieldsToChange['year'] = year;
                numChanged++;
            } catch (e) {
                errorList.push(e);
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
                numChanged++;
            }catch (e){
                errorList.push(e);
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
                numChanged++;
            } catch (e) {
                errorList.push(e);
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
                numChanged++;
            } catch(e){
                errorList.push(e);
            }
        }

        if (relevantSubjects !== undefined && relevantSubjects !== null && relevantSubjects.trim() !== ''){
            try{
                if (typeof relevantSubjects !== 'string') throw 'Relevant subjects must initially be a string';
                relevantSubjects = relevantSubjects.split(',');
                if (relevantSubjects.length<=0) throw 'Relevant subjects must contain at least one subject.';
                if (!relevantSubjects.every((subj) => typeof subj === 'string')) throw 'Relevant subjects may only contain strings';
                relevantSubjects = relevantSubjects.map((subj) => subj.trim());
                if (!relevantSubjects.every((subj) => subj!=='')) throw 'Each relevant subject must have at least one non whitespace character';
                fieldsToChange['relevantSubjects'] = relevantSubjects;
                console.log(fieldsToChange.relevantSubjects);
                numChanged++;
            } catch(e){
                errorList.push(e);
            }
        }

        if (errorList.length > 0){
            //we have errors, let's show them
            errorList.forEach((error) => {
                // create a p element to contain
                var errorEl = $('<p>');
                errorEl.text(error);
                errorEl.appendTo(userInfoErrors);
            });
        }else{
            //else, set up the request, and send it
            var requestConfig = {
                method: 'POST',
                url: '/profile',
                contentType: 'application/json',
                data: JSON.stringify(fieldsToChange),
                error: function (e){
                    infoChangeForm.before(`<p>User information could not be changed ${JSON.stringify(e)}</p>`);
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
        }
        
    });


})(window.jQuery);