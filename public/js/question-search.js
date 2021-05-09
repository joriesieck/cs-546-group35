function searchFilter() {
    let input = document.getElementById("search-bar-input");
    let table = document.getElementById("question-list-table");
    let tr = table.getElementsByClassName("table-question-row");
    
    input = input.value.toLowerCase();

    for(let i = 0; i < tr.length; i++) {
        let questionTitle = tr[i].cells[1].innerHTML;
        questionTitle = questionTitle.toString().toLowerCase();
        if(questionTitle.includes(input) === true) {
            tr[i].style.display = ""
        } else {
            tr[i].style.display = "none";
        }
    }
}

function tagFilter() {
    let input = document.getElementById("search-tag-filter");
    let table = document.getElementById("question-list-table");
    let tr = table.getElementsByClassName("table-question-row");
    
    input = input.value.toLowerCase();

    for(let i = 0; i < tr.length; i++) {
        let questionTitle = tr[i].cells[2].innerHTML;
        questionTitle = questionTitle.toString().toLowerCase();
        if(questionTitle.includes(input) === true) {
            tr[i].style.display = ""
        } else {
            tr[i].style.display = "none";
        }
    }
}