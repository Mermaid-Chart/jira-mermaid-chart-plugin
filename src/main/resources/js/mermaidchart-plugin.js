
function towardsListing(){
    window.location.href = "/jira/plugins/servlet/resourceslisting"
}


// const handleClick = () => {
//     const dropdownContent = document.getElementById("dropdown-content");
//     const listArrow = document.getElementById("arrow");
//     if (dropdownContent.style.display === "block") {
//         dropdownContent.style.display = "none";
//         listArrow.innerHTML = "&#9658;";
//     } else {
//         dropdownContent.style.display = "block";
//         listArrow.innerHTML = "&#9660;";
//     }
// };


const clickList = (projectId, projectTitle) => {
    const listContent = document.getElementById("list-content");
    const listArrow = document.getElementById("arrow2");

    if (listContent.style.display === "block") {
        listContent.style.display = "none";
        listArrow.innerHTML = "&#9658;";
    } else {
        listContent.style.display = "block";
        listArrow.innerHTML = "&#9660;";
        diagramResource(projectId, projectTitle);
    }   
}



AJS.$(document).on('click', '.dropdown-content > li', function (event) {
    event.preventDefault();
    if (AJS.$('.dropdown-content > li').hasClass('selected')) {
            AJS.$('.dropdown-content > li').removeClass('selected');
            AJS.$(this).addClass("selected");
        } else {
            AJS.$(this).addClass("selected");
        }
  })


  function showDiagram(){
    let docId = AJS.$(".dropdown-content > li.selected").attr("id");
    let diagramData = diagramsListed[docId];
    window.location.href = "/jira/plugins/servlet/diagrampreview?docId=" + diagramData.documentID +
     "&proId=" + diagramData.projectID + "&title=" + diagramData.title;
  }



var diagramsToFilter = {};
var diagramsListed = {};

function diagramResource(projectId = "", projectTitle="", showDiagrams = false){
    let e = document.getElementById("resourcesSelect");
    let check;
    !projectId ? (projectId = e.options[e.selectedIndex].value, check = true) : check = false
    !projectTitle ? projectTitle = e.options[e.selectedIndex].innerText : ""
    AJS.$.ajax({
        url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/diagrams",
        data: {projectId: projectId },
        dataType: "json",
        success: function(diagramsArray){
            let allDiagrams = AJS.$(diagramsArray);
            diagramsToFilter[projectTitle] = [];
            diagramsToFilter[projectTitle] = allDiagrams.map((i, diagram) => diagram = {projectID: diagram.projectID, title: diagram.title, documentID: diagram.documentID}).toArray();  
            !showDiagrams ?
            (check ? (document.getElementById("pButton").style.display = "none", addListitems(allDiagrams)) : addListitems(allDiagrams))
            : ""
        }
    });
}

// Place diagrams in the list 
function addListitems(diagrams){
    let ul = document.getElementById("list-content");
    ul.innerHTML = "";
    AJS.$.each(diagrams, function(index, diagram) {
        console.log(diagram.title);
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(diagram?.pTitle||diagram?.title||"Untitled Diagram"));
        li.setAttribute("id", diagram.documentID);
        ul.appendChild(li);
        let docId = diagram.documentID;
        diagramsListed[docId] = {projectID: diagram.projectID, title: diagram.title||"Untitled Diagram", documentID: diagram.documentID};
        console.log(diagramsListed[docId]);
    });
}

function filterDiagrams(){
    let word = document.getElementById("filterText").value;
    let d = JSON.stringify(diagramsToFilter);
    let result = [];
    console.log("Diagram filteration started.... List of diagrams at this time is "+ d);
    for(key of Object.keys(diagramsToFilter)){
        diagramsToFilter[key].filter(diagram => {
            diagram.title = diagram.title||"Untitled Diagram";
            (diagram.title).indexOf(word) != -1 ? result.push({pTitle: key + " : "+ diagram.title, title: diagram.title, documentID: diagram.documentID, projectID: diagram.projectID}) : ""
        });
    }   
    console.log("Result is " + JSON.stringify(result));
    word === "" ? (
        result = [],
         document.getElementById("pButton").style.display = "block", 
         document.getElementById("arrow2").innerHTML = "&#9658;"
         ) : document.getElementById("pButton").style.display = "none"
    addListitems(result);
}

function editImage(projectID, documentID){
    window.location.href="https://www.mermaidchart.com/app/projects/" + projectID + "/diagrams/" + documentID + "/version/v0.1/edit"
}

function syncImage(event, docId, diagramTitle){
    event.preventDefault();    
    document.getElementById("diagramImage").src = "";
    document.getElementById("diagramImage").src = "https://www.mermaidchart.com/raw/" + docId + "?version=v0.1&theme=light&format=png&"  + new Date().getTime();;

}

