(function ($) {
	// get login form
	var loginForm = $('#login');

	// set up submit handler
	loginForm.submit(function (event) {
		// prevent default behavior
		event.preventDefault();

		// get username and password
		var username = $('#username').val();
		var password = $('#password').val();
		// 1 = false, 2 = true
		var isTutor = parseInt($('#is-tutor').val());

		var errorList = [];

		// check isTutor - must exist and must be 1 or 2
		try {
			if (isTutor===undefined || isTutor===null) throw 'Missing';
			if (typeof isTutor !== 'number' || isNaN(isTutor)) throw 'Invalid type for';
			if (isTutor!==1 && isTutor!==2) throw 'Invalid value for';
		} catch (e) {
			errorList.push(`${e} isTutor.`);
		}

		// make sure both username and password exist
		if (username===undefined || username===null) errorList.push('Please enter your username.');
		if (password===undefined || password===null) errorList.push('Please enter your password.');

		// make sure both username and password are strings
		if (typeof username !== 'string') errorList.push('Username must be a string.');
		if (typeof password !== 'string') errorList.push('Password must be a string.');

		// trim and check for all whitespace
		username = username.trim();
		if (username==='') errorList.push('Username must contain at least one nonwhitespace character.');
		password = password.trim();
		if (password==='') errorList.push('Password must contain at least one nonwhitespace character.');

		// make sure username does not contain any whitespace
		const usernameRE = /[ 	]/;
		if (usernameRE.test(username)) errorList.push('Username must not contain any whitespace characters.');

		// if there were any errors, render them to the page and don't continue
		if (errorList.length>0) {
			// create the unordered list to hold the errors
			var errors = $('<ul class="error">');
			// add each error as a list element to errors
			errorList.forEach((error) => {
				var errorEl = $('<li>');
				errorEl.text(error);
				errorEl.appendTo(errors);
			});
			// append the errors element to main after the form
			loginForm.after(errors);
		} else {
			// render a paragraph to let the user know that they are being logged in
			var loadingMsg = $('<p>');
			loadingMsg.text('Please wait, we are logging you in...');
			loginForm.after(loadingMsg);
			// no errors, so submit ajax request to POST /login
			var requestConfig = {
				method: 'POST',
				url: '/login',
				contentType: 'application/json',
				data: JSON.stringify({
					username,
					password,
					isTutor
				}),
				error: function (e) {
					// hide the loading message
					loadingMsg.hide();
					var errorMsg = $('#login-error');
					errorMsg.text(e.responseJSON.error);
					errorMsg.show();
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
			})
		}

	})
})(window.jQuery);