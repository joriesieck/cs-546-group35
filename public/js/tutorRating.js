(function($){
    var ratingForm = $('#ratingForm');

    ratingForm.submit((event) => {
        event.preventDefault();
        var rating = $('#rating').val();
        var ratingErrors = [];
        try{
            if (!rating || rating === undefined || rating === null || rating.trim() === ''){
                throw "Rating isn't present";
            }
            rating = parseInt(rating);
            if (isNaN(rating)) throw "Rating isn't a number";
            if (rating < 1 || rating > 10) throw "Rating is out of bounds";
            var username = $('#givenUsername').html().toString();
            console.log(username);
            var requestConfig = {
                method: 'POST',
                url: '/profile/addRating',
                contentType: 'application/json',
                data: JSON.stringify({
                    ratedUsername: username,
                    rating: rating
                })
            };
            $.ajax(requestConfig).then(function (res){
                if (res.message === 'success'){
                    alert("Rating submitted successfully!");
                    window.location.href = '/profile/'+username;
                    //the user was able to submit the rating successfully, reload and see if the button goes away
                } else {
                    //in all other cases, rating wasn't successful, so log error to see what's up
                    alert(res.error);
                }
            });
        } catch(e){
            var error = $('<p>');
            error.text(e);
            error.appendTo($('#ratingErrors'));
        }
        
    });
})(window.jQuery);