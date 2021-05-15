function searchBySubject(){
    let input = document.getElementById("search-bar-input");
    let shownTutors = document.getElementsByClassName("displayedTutor");
    input = input.value.toLowerCase();
    for (i = 0; i < shownTutors.length; i++){
        let found = false;
        let subjects = shownTutors[i].getElementsByClassName('subject');
        for (j = 0; j < subjects.length; j++){
            if(subjects[j] !== null && subjects[j].innerHTML.toLowerCase().includes(input) === true){
                found = true;
            }
        }
        if (found === false){
            shownTutors[i].style.display = 'none';
        } else {
            shownTutors[i].style.display = '';
        }
    }
}