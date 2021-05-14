(function($) {
    var newAnswerForm = $('#new-answer-form');

    newAnswerForm.submit(function (event) {
        event.preventDefault();

        var errors = $('#new-answer-errors-list');
        var answerBody = $('#answer-body').val().trim();
        var errorList = [];

        errors.empty();
        errors.hide();

        try {
            if(answerBody===undefined) throw 'Answer body is required and must be non all empty space string';
            if(typeof answerBody !== 'string') throw 'Answer body must be a string.';
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
                url: '/questions-forum/post-answer',
                contentType: 'application/json',
                data: JSON.stringify({
                    answerBody
                }),
                error: function(e) {
                    console.log(e);
                    errors.show();
                }
            };
            $.ajax(requestConfig).then(function (res) {
                if (res.message==='success') {
                    location.href = '/questions-forum/:id';
                }
            });
        }
    });
})(window.jQuery);