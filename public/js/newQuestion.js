(function($) {
	// get the form element
	var newQuestionForm = $('#new-question-form');

	// add an event listener for submit
	newQuestionForm.submit(function (event) {
		event.preventDefault();

        var questionTitle = $('#question-title').val().trim();
        console.log(questionTitle)
        console.log(typeof questionTitle)
        var questionBody = $('#question-body').val().trim();
        var questionTags = $('#question-tags').val().trim();

        var requestConfig = {
            method: 'POST',
            url: '/questions-forum/post',
            contentType: 'application/json',
            data: JSON.stringify({
                questionTitle,
                questionBody,
                questionTags
            }),
            error: function(e) {
                console.log(e);
            },
        };
        $.ajax(requestConfig).then(function (res) {
            // if message = 'success', redirect to home
            if (res.message==='success') {
                // redirect to home
                location.href = '/';
            }
        });
	})
	
})(window.jQuery);