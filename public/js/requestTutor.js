(function ($) {

	// get tutor request form
	var tutorReqForm = $('#tutor-request');

	// set up submit handler
	tutorReqForm.submit(function (event) {
		// prevent default behavior
		event.preventDefault();

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
					// hide the loading message
					loadingMsg.hide();
					var errorMsg = $('<p class="error">');
					errorMsg.text(e.responseJSON.error);
					tutorReqForm.after(errorMsg);
				}
			};
			$.ajax(requestConfig).then(function (res) {
				// hide the loading message
				loadingMsg.hide()
					// if message = 'success', display a success message and the tutor's email
				if (res.message==='success' && res.tutorEmail) {
					var successMsg = $('#success-msg');
					successMsg.text(`Your request has been accepted! You can contact your tutor at ${res.tutorEmail}.`);
					successMsg.show();
				} else {
					var errorMsg = $('<p class="error">');
					errorMsg.text('Sorry, something went wrong. Please try again later.');
					tutorReqForm.after(errorMsg);
				}
			})
		}
	});

})(window.jQuery);