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
        let questionTag = tr[i].cells[2].innerHTML;
        questionTag = questionTag.toString().toLowerCase();
        if(questionTag.includes(input) === true) {
            tr[i].style.display = ""
        } else {
            tr[i].style.display = "none";
        }
    }
}

function answeredFilter() {
    let selection = document.getElementById('answered-selection').value;
    let table = document.getElementById("question-list-table");
    let tr = table.getElementsByClassName("table-question-row");

    for(let i = 0; i < tr.length; i++) {
        let questionAnswered = tr[i].cells[4].innerHTML;
        if(selection === "both") {
            tr[i].style.display = "";
        }
        if(selection === "answered") {
            if(questionAnswered === "Yes") {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
        if(selection === "unanswered") {
            if(questionAnswered === "No") {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
