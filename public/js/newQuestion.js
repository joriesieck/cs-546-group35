(function($) {
	// get the form element
	var newQuestionForm = $('#new-question-form');

	// add an event listener for submit
	newQuestionForm.submit(function (event) {
		event.preventDefault();

        var errors = $('#new-question-errors-list');
        var questionTitle = $('#question-title').val().trim();
        var questionBody = $('#question-body').val().trim();
        var questionTags = $('#question-tags').val().trim();
        var errorList = [];

        errors.empty();
        errors.hide();


        try {
            if(questionTitle===undefined || questionTitle.trim().length === 0) throw 'Question title is required and must be non all empty space string';
            if(typeof questionTitle !== 'string') throw 'Question title must be a string.';
            if(questionTitle.length > 100) throw 'Question title may not contain more than 100 characters.';
        } catch (e) {
			errorList.push(e);
		}

        try {
            if(questionBody===undefined || questionTitle.trim().length === 0) throw 'Question body is required and must be non all empty space string';
            if(typeof questionBody !== 'string') throw 'Question body must be a string.';
        } catch (e) {
			errorList.push(e);
		}

        try {
            if(questionTags===undefined || questionTags.trim().length === 0) throw 'At least one question tag is required and must be non all empty space string';
            if(typeof questionTags !== 'string') throw 'Question tags must be a string.';
            questionTagsArr = questionTags.split(',');
            for(let i = 0; i < questionTagsArr.length; i++) {
                questionTagsArr[i] = questionTagsArr[i].trim();
                if(questionTagsArr[i] === undefined || typeof questionTagsArr[i] !== 'string' || questionTagsArr[i].trim().length === 0) {
                    throw 'Each question tags must be a string and must be non all empty space string. Please do not have any extra/trailing commas.';
                }
            }
            if(questionTagsArr.length > 3) throw "Please limit the number of tags to three."
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
                method: 'POST',
                url: '/questions-forum/post-question',
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
                    location.href = `/questions-forum/${res.questionId}`;
                }
            });
        }
	})
	
})(window.jQuery);