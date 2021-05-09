(function($) {
	// get the form element
	var newQuestionForm = $('#edit-question-form');

	// add an event listener for submit
	newQuestionForm.submit(function (event) {
		event.preventDefault();

        var errors = $('#edit-question-errors-list');
        var questionTitle = $('#update-title').val().trim();
        var questionBody = $('#update-body').val().trim();
        var questionTags = $('#update-tags').val().trim();
        var errorList = [];

        errors.empty();
        errors.hide();


        try {
            if(questionTitle) {
                if(questionTitle.trim().length === 0) throw 'Question title must be non all empty space string';
                if(typeof questionTitle !== 'string') throw 'Question title must be a string.';
                if(questionTitle.length > 100) throw 'Question title may not contain more than 100 characters.';
            }
        } catch (e) {
			errorList.push(e);
		}

        try {
            if(questionBody) {
            if(questionTitle.trim().length === 0) throw 'Question body must be non all empty space string';
            if(typeof questionBody !== 'string') throw 'Question body must be a string.';
            }
        } catch (e) {
			errorList.push(e);
		}

        try {
            if(questionTags) {
                if(questionTags.trim().length === 0) throw 'Question tag must be non all empty space string';
                if(typeof questionTags !== 'string') throw 'Question tags must be a string.';
                questionTagsArr = questionTags.split(',');
                for(let i = 0; i < questionTagsArr.length; i++) {
                    questionTagsArr[i] = questionTagsArr[i].trim();
                    if(questionTagsArr[i] === undefined || typeof questionTagsArr[i] !== 'string' || questionTagsArr[i].trim().length === 0) {
                        throw 'Each question tags must be a string and must be non all empty space string. Please do not have any extra/trailing commas.';
                    }
                }
                if(questionTagsArr.length > 3) throw "Please limit the number of tags to three."
            }
        } catch (e) {
			errorList.push(e);
		}

        if (errorList.length > 0) {
			errorList.forEach((errorStr) => {
				var errorLi = $('<li>');
				errorLi.text(errorStr);
				errorLi.appendTo(errors);
			});
			errors.show();
        } else {
            var requestConfig = {
                method: 'PATCH',
                url: window.location.pathname,
                contentType: 'application/json',
                data: JSON.stringify({
                    questionTitle,
                    questionBody,
                    questionTags
                }),
                error: function(e) {
                    console.log(e);
                    errors.show();
                }
            };
            $.ajax(requestConfig).then(function (res) {
                if (res.message==='success') {
                    // TODO: Redirect to single question page
                    location.href = '/';
                }
            });
        }
	})
	
})(window.jQuery);