(function($) {
	// get the answer rating form
	var ratingForm = $('#ratingForm');
	// get the error list
	var errorList = $('ratingErrors');

	// handle submission
	ratingForm.submit(function (event) {
		// prevent default behavior
		event.preventDefault();

		// hide errors
		errorList.hide();

		var rating = $('#rating').val();
		var answerId = $('#answer-id').val();
		var errors = [];
		
		// error checking
		if (!rating || rating === undefined || rating === null || rating.trim() === '') errors.push("Rating isn't present");
		rating = parseInt(rating);
		if (isNaN(rating)) errors.push("Rating isn't a number");
		if (rating < 1 || rating > 10) errors.push("Rating is out of bounds");
		if (!answerId) errors.push('Missing answer ID, please go back to the main question page and try again.');
		
		if (errors.length>0) {
			// add each error as an li to errorList
			error.forEach((errorStr) => {
				// create an li element
				var errorEl = $('<li>');
				// add the text
				errorEl.text(errorStr);
				// append the child to errors
				errorEl.appendTo(errorList);
			});
			errorList.show();
		} else {
			// no errors, so submit ajax request
			var requestConfig = {
					method: 'POST',
					url: `/questions-forum/answer/${answerId}`,
					contentType: 'application/json',
					data: JSON.stringify({
							rating
					}),
					error: function (e) {
						var errorMsg = $('<p class="error">');
						errorMsg.text(e.responseJSON.error);
						ratingForm.after(errorMsg);
						errorMsg.show();
						console.log(e);
					}
			};
			$.ajax(requestConfig).then(function (res){
					if (res.message === 'success'){
						var successMsg = $('<p>');
						successMsg.text("Rating submitted!");
						ratingForm.before(successMsg);
						ratingForm.hide();
					}
			});
		}
	});

})(window.jQuery);