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
		// 0 = false, 1 = true
		var isTutor = parseInt($('#is-tutor').val());

		// store all the error strings in an array
		var errorList = [];

		// check first and last name - must exist, must be strings, must not be only spaces
		try {
			if (firstName===undefined || firstName==='') throw 'First Name is required.';
			if (typeof firstName !== 'string') throw 'First Name must be a string.';
			firstName = firstName.trim();
			if (firstName==='') throw 'First Name must contain at least one non-whitespace character.';
		} catch (e) {
			errorList.push(e);
		}
		try {
			if (lastName===undefined || lastName==='') throw 'Last Name is required.';
			if (typeof lastName !== 'string') throw 'Last Name must be a string.';
			lastName = lastName.trim();
			if (lastName==='') throw 'Last Name must contain at least one non-whitespace character.';
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
			// must be in correct email format
			// regex source: https://www.geeksforgeeks.org/write-regular-expressions/
			const emailRE = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
			if (!emailRE.test(email)) throw 'Email must be of the format example@domain.suffix';
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
			// must not contain whitespace characters
			const usernameRE = /[ 	]/;
			if (usernameRE.test(username)) throw 'Username must not contain any whitespace characters.';
		} catch (e) {
			errorList.push(e);
		}

		// check password/confirm password - must exist, must be strings
		try {
			if (password===undefined || password==='') throw 'Password is required.';
			if (typeof password !== 'string') throw 'Password must be a string.';
		} catch (e) {
			errorList.push(e);
		}
		try {
			if (confirmPassword===undefined || confirmPassword==='') throw 'Confirm Password is required.';
			if (typeof confirmPassword !== 'string') throw 'Confirm Password must be a string.';
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
			if (year < 0) throw 'Graduation Year must be greater than 0.';
			// must be of the form YYYY
			const yearRE = /^\d\d\d\d$/;
			if (!yearRE.test(year)) throw 'Graduation Year must be of the form YYYY.';
		} catch (e) {
			errorList.push(e);
		}

		// check subjects
		if (isTutor) {
			// required field
			try {
				// must exist
				if (subjects===undefined || subjects==='') throw 'Subjects is required.';
				// convert subjects to an array delimited by ','
				subjects = subjects.split(',');
				// must contain at least one element
				if (subjects.length<=0) throw 'Subjects must contain at least one subject.';
				// must contain only strings
				if (!subjects.every((subj) => typeof subj === 'string')) throw 'Subjects can only contain strings.';
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
				if (!subjects.every((subj) => typeof subj === 'string')) throw 'Subjects can only contain strings.';
				// must contain only non-whitespace strings
				subjects = subjects.map((subj) => subj.trim());	// trim strings
				if (!subjects.every((subj) => subj!=='')) throw 'Each subject must contain at least one non-whitespace character.';
			} catch (e) {
				errorList.push(e);
			}
		}

		// if there were errors, don't submit and instead print each error as an li
		if (errorList.length>0) {
			console.log(errorList);
			// add each error as an li to errors
			errorList.forEach((errorStr) => {
				console.log(errorStr);
				// create an li element
				var errorEl = $('<li>');
				// add the text
				errorEl.text(errorStr);
				// append the child to errors
				errorEl.appendTo(errors);
			});
		} else {
			// no errors, so submit ajax request to POST /new-user/create
			var requestConfig = {
				method: 'POST',
				url: '/new-user/create',
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
					console.log(e);
					// TODO
				}
			};
			$.ajax(requestConfig).then(function (res) {
				// if message = 'success', hide the form and display the success message
				if (res.message==='success' && res.username) {
					newUserForm.hide();
					var successMsg = $('<p>');
					successMsg.text(`User ${res.username} created successfully! You are now logged in.`);
					newUserForm.before(successMsg);
				}
			});
		}
	})
	
})(window.jQuery);