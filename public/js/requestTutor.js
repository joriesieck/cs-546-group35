(function ($) {

	// get tutor request form
	var tutorReqForm = $('#tutor-request');

	var errorMsg = $('#tutor-req-error');
	var successMsg = $('#success-msg');

	// set up submit handler
	tutorReqForm.submit(function (event) {
		// prevent default behavior
		event.preventDefault();

		errorMsg.hide();

		// get requested tutor
		var requestedTutor = $("input[name='requestedTutor']:checked").val();
		
		// if no requested tutor was provided, alert the user
		if (!requestedTutor) {
			alert('Please select a tutor.');
		} else {
			// otherwise, send an ajax request with the tutor's username to POST /request-tutor
			// render a paragraph to let the user know that their request is being processed
			var loadingMsg = $('<p>');
			loadingMsg.text('Please wait, we are processing your request...');
			tutorReqForm.after(loadingMsg);
			var requestConfig = {
				method: 'POST',
				url: '/request-tutor',
				contentType: 'application/json',
				data: JSON.stringify({requestedTutor}),
				error: function (e) {
					// hide the loading message and success message
					loadingMsg.hide();
					successMsg.hide();
					errorMsg.text(e.responseJSON.error);
					errorMsg.show();
				}
			};
			$.ajax(requestConfig).then(function (res) {
				// hide the loading message and error message
				loadingMsg.hide();
				errorMsg.hide();
					// if message = 'success', display a success message and the tutor's email
				if (res.message==='success' && res.tutorEmail) {
					successMsg.text(`Your request has been accepted! You can contact your tutor at ${res.tutorEmail}. If you would like to request another tutor, simply make a new selection.`);
					successMsg.show();
				} else {
					errorMsg.text('Sorry, something went wrong. Please try again later.');
					errorMsg.show();
				}
			})
		}
	});

})(window.jQuery);