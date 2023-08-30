
// function towardsListing(){
//     window.location.href = "/jira/plugins/servlet/resourceslisting"
// }

// function to save projectkey and issue key in local storage
// both of the keys are used to hold the reference used for redirection
function saveKeys(projkey, isskey){
    localStorage.setItem("projectkey", projkey);
    localStorage.setItem("issuekey", isskey);
}

// function to redirect to issue page after successful saving of security token or baseURL.
async function successfullySavingAction(){
    let projectkey = localStorage.getItem("projectkey");
    let issuekey = localStorage.getItem("issuekey");
    document.getElementById("redirectionMessage").innerText = "Redirecting back to issue "+ issuekey + "...";
    await new Promise(resolved => setTimeout(resolved, 3000));
    window.location.href = "/jira/projects/" + projectkey + "/issues/" + issuekey;
}

// function called when click on list item on diagrams listing screen
const listItemClickedAction = (projectId, projectTitle) => {
    getDiagrams(projectId, projectTitle);       
}

// Click event listener on tree view list item's
AJS.$(document).on('click', '.project-list-item', function (event) {
    event.preventDefault();
    this.parentElement.querySelector(".unordered-list-item").classList.toggle("activate");
    this.classList.toggle("project-list-item-down");
});

// Click event listener to handle styling of tree view list item's
AJS.$(document).on('click', '.tree-leaf-item > li', function (event) {
    event.preventDefault();
    if (AJS.$('.tree-leaf-item > li').hasClass('selected')) {
        AJS.$('.tree-leaf-item > li').removeClass('selected');
        AJS.$(this).addClass("selected");
    } else {
        AJS.$(this).addClass("selected");
    }
});

// function to redirect towards diagrams preview screen
function insertDiagramAction(userkey){
    let docId = AJS.$(".tree-leaf-item > li.selected").attr("id");
    let diagramData = diagramsListed[docId];
    window.location.href = "/jira/plugins/servlet/diagrampreview?docId=" + diagramData.documentID +
        "&proId=" + diagramData.projectID + "&title=" + diagramData.title + "&code=" + encodeURIComponent(diagramData.code) + "&userkey=" + userkey;
}

var diagramsToFilter = {};
var diagramsListed = {};

// function to get diagrams from mermaid chart
function getDiagrams(projectId = "", projectTitle="", showDiagrams = false){
    let element = document.getElementById("diagramSelect");
    let check;
    !projectId ? (projectId = element.options[element.selectedIndex].value, check = true) : check = false
    !projectTitle ? projectTitle = element.options[element.selectedIndex].innerText : ""
    AJS.$.ajax({
        url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/diagrams",
        method: "GET",
        data: { 
            projectId: projectId
        },
        dataType: "json",
        success: function(diagramsArray){
            let allDiagrams = AJS.$(diagramsArray);
            diagramsToFilter[projectTitle] = [];
            diagramsToFilter[projectTitle] = allDiagrams.map((i, diagram) => { 
                return ({projectID, title, documentID, code} = diagram )
            });  
            !showDiagrams 
            ? (check 
                ? (document.getElementById("tree-view").style.display = "none", 
                    document.getElementById("list-content").style.display = "block", 
                    addListitems(allDiagrams, true)) 
                : addListitems(allDiagrams, false))
            : ""
        }
    });
}

// function to add diagrams list items on diagrams listing screen
function addListitems(diagrams, isOptionSelected){
    let ul = isOptionSelected ? document.getElementById("list-content") : document.getElementById(diagrams[0].projectID)
    ul ? ul.innerHTML = "" : ""
    AJS.$.each(diagrams, function(index, diagram) {
        console.log(diagram.title);
        let li = document.createElement("li");
        li.appendChild(document.createTextNode(diagram?.filteredTitle||diagram?.title||"Untitled Diagram"));
        li.setAttribute("id", diagram.documentID);
        ul.appendChild(li);
        let docId = diagram.documentID;
        diagramsListed[docId] = {projectID: diagram.projectID, title: diagram.title||"Untitled Diagram", documentID: diagram.documentID, code: diagram.code};
    });
}

// function to perform filtering on diagrams
function filterDiagrams(){
    let filterInput = document.getElementById("filterText").value;
    let result = [];
    for(key of Object.keys(diagramsToFilter)){
        diagramsToFilter[key].filter((index, diagram) => {
            diagram.title = diagram.title||"Untitled Diagram";
            console.log(diagram);
            (diagram.title).indexOf(filterInput) != -1 
                ? result.push({filteredTitle: key + " : "+ diagram.title, title: diagram.title, documentID: diagram.documentID, projectID: diagram.projectID, code: diagram.code}) 
                : ""
        });
    }   
    filterInput === "" 
        ? ( result = [],
            document.getElementById("tree-view").style.display = "block", 
            document.getElementById("list-content").style.display = "none"
            ) 
        : document.getElementById("tree-view").style.display = "none",
             document.getElementById("list-content").style.display = "block"
    addListitems(result, true);
}

// function to redirect to mermaid chart edit image screen
function editImage(domainName, projectID, documentID){
    url = "https://" + domainName + "/app/projects/" + projectID + "/diagrams/" + documentID + "/version/v0.1/edit"
    window.open(url, '_blank').focus();
}

// function to sync image on diagram preview screen
function syncImage(event, docId, diagramTitle, userkey){
    AJS.$.ajax({
        url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/diagramInfo",
        method: "GET",
        data: {
            docId: docId
        },
        dataType: "json",
        success: function(diagramData){
            let diagram = AJS.$(diagramData);
            console.log(diagram);
            window.location.href = "/jira/plugins/servlet/diagrampreview?docId=" + diagram[0].documentID +
                "&proId=" + diagram[0].projectID + "&title=" + (diagram[0].title||"Untitled Diagram") + "&code=" 
                + encodeURIComponent(diagram[0].code) + "&userkey=" + userkey; 
        }
    });
}

// function to insert image as an attachment in jira issue screen and also redirect back towards issue screen
function insertImageToJiraAction(filename){
    const svgElement = document.querySelector('[id^="mermaid-"]');
    const canvas = document.querySelector('canvas');
    const img = document.getElementById('prerenderImage');
    const svgXml = new XMLSerializer().serializeToString(svgElement);
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgXml)));
    img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);   
        const pngDataURL = canvas.toDataURL('image/png');
        let file = DataURIToBlob(pngDataURL);
        file = new File([file], filename+'.png');
        const formData = new FormData();
        formData.append('file', file);
        document.getElementById("images").setAttribute("hidden", true);

        let projectkey = localStorage.getItem("projectkey");
        let issuekey = localStorage.getItem("issuekey");

        AJS.$.ajax({
            type: "POST",
            url: AJS.contextPath() + "/rest/api/2/issue/" + issuekey + "/attachments",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            headers: {
                "X-Atlassian-Token": "nocheck"
            }
        }).done(function() { 
                window.location.href = "/jira/projects/" + projectkey + "/issues/" + issuekey;
        });
    }
}

// function to convert dataURI to Blob Object
function DataURIToBlob(dataURI) {
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

    var ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++)
       ia[i] = byteString.charCodeAt(i)
    return new Blob([ia], {
       type: mimeString
    })
 }