(function($) {
	// get the form element
	var newUserForm = $('#new-user-form');

	// add an event listener for submit
	newUserForm.submit(function (event) {
		// stop page refresh
		event.preventDefault();

		// get the error list element
		var errors = $('#new-user-input-errors');
		// remove any old errors
		errors.empty();

		// get each input in the form
		var firstName = $('#first-name').val();
		var lastName = $('#last-name').val();
		var email = $('#email').val().toLowerCase();
		var username = $('#username').val().toLowerCase();
		var password = $('#password').val();
		var confirmPassword = $('#confirm-password').val();
		var year = parseInt($('#grad-year').val());
		var subjects = $('#subjects').val();
		// 1 = false, 2 = true
		var isTutor = parseInt($('#is-tutor').val());

		// store all the error strings in an array
		var errorList = [];

		// check isTutor - must exist and must be 1 or 2
		try {
			if (isTutor===undefined || isTutor===null) throw 'Missing';
			if (typeof isTutor !== 'number' || isNaN(isTutor)) throw 'Invalid type for';
			if (isTutor!==1 && isTutor!==2) throw 'Invalid value for';
		} catch (e) {
			errorList.push(`${e} isTutor.`);
		}

		// check first and last name
		try {
			// must exist
			if (firstName===undefined || firstName==='') throw 'First Name is required.';
			// must be a string
			if (typeof firstName !== 'string') throw 'First Name must be a string.';
			// must not be only spaces
			firstName = firstName.trim();
			if (firstName==='') throw 'First Name must contain at least one non-whitespace character.';
			// must be <= 254 characters
			if (firstName.length > 254) throw 'First Name may not contain more than 254 characters.';
			// must be alphabet characters, ', -, or space
			const nameRE = /^([a-zA-Z'\- ]+)$/;
			if (!nameRE.test(firstName)) throw 'First Name may only contain alphabet characters, \' , -, or space.';
		} catch (e) {
			errorList.push(e);
		}
		try {
			// must exist
			if (lastName===undefined || lastName==='') throw 'Last Name is required.';
			// must be a string
			if (typeof lastName !== 'string') throw 'Last Name must be a string.';
			// must not be only spaces
			lastName = lastName.trim();
			if (lastName==='') throw 'Last Name must contain at least one non-whitespace character.';
			// must be <= 254 characters
			if (lastName.length > 254) throw 'Last Name may not contain more than 254 characters.';
			// must be alphabet characters, ', -, or space
			const nameRE = /^([a-zA-Z'\- ]+)$/;
			if (!nameRE.test(lastName)) throw 'Last Name may only contain alphabet characters, \' , -, or space.';
		} catch (e) {
			errorList.push(e);
		}

		// check email
		try {
			// must exist
			if (email===undefined || email==='') throw 'Email is required.';
			// must be a string
			if (typeof email !== 'string') throw 'Email must be a string.';
			// must not be only spaces
			email = email.trim();
			if (email==='') throw 'Email must contain at least one non-whitespace character.';
			// must be <= 254 characters
			if (email.length > 254) throw 'Email may not contain more than 254 characters.';
			// must be in correct email format
			// regex source: https://www.geeksforgeeks.org/write-regular-expressions/
			const emailRE = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
			if (!emailRE.test(email)) throw 'Email must be of the format example@domain.suffix.';
		} catch (e) {
			errorList.push(e);
		}

		// check username
		try {
			// must exist
			if (username===undefined || username==='') throw 'Username is required.';
			// must be a string
			if (typeof username !== 'string') throw 'Username must be a string.';
			// must not be only spaces
			username = username.trim()
			if (username==='') throw 'Username must contain at least one non-whitespace character.';
			// must be <= 254 characters
			if (username.length > 254) throw 'Username may not contain more than 254 characters.';
			// can only contain alphabet characters, numbers, -, _, and .
			const usernameRE = /^([a-zA-Z0-9\-\_\.]+)$/;
			console.log(username);
			if (!usernameRE.test(username)) throw 'Username may only contain alphanumeric characters, ., _, or -.';
		} catch (e) {
			errorList.push(e);
		}

		// check password/confirm password
		try {
			// must exist
			if (password===undefined || password==='') throw 'Password is required.';
			// must be a string
			if (typeof password !== 'string') throw 'Password must be a string.';
			// must be at least 8 characters
			if (password.length < 8) throw 'Password must contain at least 8 characters';
			// must be less than or equal to 254 characters
			if (password.length > 254) throw 'Password may not contain more than 254 characters.';
			// must contain at least one letter and one number
			const passwordNumRE = /[0-9]+/;
			const passwordAlphRE = /[a-zA-Z]+/;
			if (!passwordNumRE.test(password) || !passwordAlphRE.test(password)) throw 'Password must contain at least one letter and one number.';
		} catch (e) {
			errorList.push(e);
		}
		try {
			// must exist
			if (confirmPassword===undefined || confirmPassword==='') throw 'Confirm Password is required.';
			// must be a string
			if (typeof confirmPassword !== 'string') throw 'Confirm Password must be a string.';
			// must be at least 8 characters
			if (confirmPassword.length < 8) throw 'Confirm Password must contain at least 8 characters';
			// must be less than or equal to 254 characters
			if (confirmPassword.length > 254) throw 'Confirm Password may not contain more than 254 characters.';
			// must contain at least one letter and one number
			const passwordNumRE = /[0-9]+/;
			const passwordAlphRE = /[a-zA-Z]+/;
			if (!passwordNumRE.test(confirmPassword) || !passwordAlphRE.test(confirmPassword)) throw 'Confirm Password must contain at least one letter and one number.';
		} catch (e) {
			errorList.push(e);
		}

		// check that password and confirm password match
		try {
			if (password!==confirmPassword) throw 'Passwords must match.';
		} catch (e) {
			errorList.push(e);
		}

		// check graduation year
		try {
			// must exist
			if (year===undefined || year==='') throw 'Graduation Year is required.';
			// must be a number
			if (isNaN(year)) throw 'Graduation Year must be a number.';
			// must be >= 0
			if (year < 0) throw 'Graduation Year must be greater than or equal to 0.';
			// must be of the form YYYY
			const yearRE = /^\d\d\d\d$/;
			if (!yearRE.test(year)) throw 'Graduation Year must be of the form YYYY.';
			//can't be an unreasonable year (<1900 or 2100< I guess?)
			if (year < 1900 || year > 2100) throw 'Graduation Year needs to make sense :)';
		} catch (e) {
			errorList.push(e);
		}

		// check subjects
		if (isTutor===2) {
			// required field
			try {
				// must exist
				if (subjects===undefined || subjects==='') throw 'Subjects is required.';
				// convert subjects to an array delimited by ','
				subjects = subjects.split(',');
				// must contain at least one element
				if (subjects.length<=0) throw 'Subjects must contain at least one subject.';
				// must contain only strings
				if (!subjects.every((subj) => typeof subj === 'string')) throw 'Subjects may only contain strings.';
				// must contain only non-whitespace strings
				subjects = subjects.map((subj) => subj.trim());	// trim strings
				if (!subjects.every((subj) => subj!=='')) throw 'Each subject must contain at least one non-whitespace character.';
			} catch (e) {
				errorList.push(e);
			}
		} else if (subjects!==undefined && subjects!=='') {
			// not required field, but exists, so must contain valid input
			try {
				// convert subjects to an array delimited by ','
				subjects = subjects.split(',');
				// must contain only strings
				if (!subjects.every((subj) => typeof subj === 'string')) throw 'Subjects may only contain strings.';
				// must contain only non-whitespace strings
				subjects = subjects.map((subj) => subj.trim());	// trim strings
				if (!subjects.every((subj) => subj!=='')) throw 'Each subject must contain at least one non-whitespace character.';
			} catch (e) {
				errorList.push(e);
			}
		}

		// if there were errors, don't submit and instead print each error as an li
		if (errorList.length>0) {
			// add each error as an li to errors
			errorList.forEach((errorStr) => {
				// create an li element
				var errorEl = $('<li>');
				// add the text
				errorEl.text(errorStr);
				// append the child to errors
				errorEl.appendTo(errors);
			});
			errors.show();
		} else {
			// render a paragraph to let the user know that their account is being created
			var loadingMsg = $('<p>');
			loadingMsg.text('Please wait, your account is being created...');
			newUserForm.after(loadingMsg);
			// no errors, so submit ajax request to POST /new-user
			var requestConfig = {
				method: 'POST',
				url: '/new-user',
				contentType: 'application/json',
				data: JSON.stringify({
					firstName,
					lastName,
					email,
					username,
					password,
					year,
					subjects,
					isTutor
				}),
				error: function(e) {
					// hide the loading message
					loadingMsg.hide()
					var errorMsg = $('<p>');
					errorMsg.text(e.responseJSON.error);
					errorMsg.appendTo(errors);
					errors.show();
				}
			};
			$.ajax(requestConfig).then(function (res) {
				// hide the loading message
				loadingMsg.hide()
				// if message = 'success', redirect to home
				if (res.message==='success') {
					// redirect to home
					location.href = '/';
				}
			});
		}
	})
	
})(window.jQuery);