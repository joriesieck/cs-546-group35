(function($){
    //get buttons
    var infoButton = $('#userInfoChange');
    var passwordButton = $('#passwordChange');

    //when the user wants to change their password
    passwordButton.click((event) => {
        //hide the shown information
        //show the password form
    });

    infoButton.click((event) =>{
        //hide shown information
        //show the password change details
    });

    //getting forms
    var passwordChangeForm = $('#passChange');
    var infoChangeForm = $('#infoChange');

    //on submit of password change form
    passwordChangeForm.submit((event)=>{
        event.preventDefault();
    });

    //on change of user information
    infoChangeForm.submit((event)=>{
        event.preventDefault();
    });

})(window.jQuery);