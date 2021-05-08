//on load of this page, get all the user's questions by id
//replace the questions array with the actual question objects so info can be retrieved from handlebars

//also replace the tutor IDs with links to tutor profiles
//get the user by ID and make sure the link shows name

(function($){
    //getting content
    var shownInfo = $('#shownInfo');

    //get buttons
    var infoButton = $('#userInfoChange');
    var passwordButton = $('#passwordChange');

    //getting divs containing forms
    var passwordChange = $('#passwordChangeForm');
    var infoChange = $('#userInfoChangeForm');

    //when the user wants to change their password
    passwordButton.click((event) => {
        //hide the shown information
        shownInfo.toggle();
        //show the password form
        passwordChange.toggle();
    });

    infoButton.click((event) =>{
        //hide shown information
        shownInfo.css("display", "none");
        //show the info change details
        infoChange.css("display", "block");
    });

    var passwordChangeForm = $('#passChange');
    var infoChangeForm = $('#infoChange');

    //on submit of password change form
    passwordChangeForm.submit(function(event){
        event.preventDefault();

        var currentPassword = $('#currentPassword').val();
        var newPassword = $('#newPassword').val();
        var confirmPassword = $('#confirmPassword').val();
        try{
            if (!currentPassword || currentPassword === undefined || currentPassword === null){
                throw "Missing current password";
            }
            if (!newPassword || newPassword === undefined || newPassword === null){
                throw "Missing new password";
            }
            if (!confirmPassword || confirmPassword === undefined || confirmPassword === null){
                throw "Missing confirmation of new password";
            }
            if (typeof currentPassword !== 'string' || currentPassword.trim() === ""){
                throw "Current password is of incorrect type";
            }  
            if (typeof newPassword !== 'string' || newPassword.trim() === ""){
                throw "New password is of incorrect type";
            }
            if (typeof confirmPassword !== 'string' || confirmPassword.trim() === ""){
                throw "Confirm password is of incorrect type";
            }
            if (newPassword.trim() !== confirmPassword.trim()) {
                throw "New passwords do not match";
            }

            //make a request to the server to figure out if the currentPassword matches the db
            //post request to the profiles route
            //if it matches, call updateUser with our user's id and the hashed password
            //if it does not match, clear all the fields, throw an error, and leave up the password update page

        } catch(e){

        }
    });

    $(".return").click((event) => {
        //if the return button is clicked, hide both forms just in case
        passwordChange.toggle();
        //infoChange.css("display", "none");
        //unhide the user's profile/shownInfo
        shownInfo.css("display", "block");
    });


    //on change of user information
    infoChangeForm.submit((event)=>{
        event.preventDefault();
    });

})(window.jQuery);