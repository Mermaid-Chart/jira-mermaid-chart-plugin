
function towardsListing(){
    window.location.href = "/jira/plugins/servlet/resourceslisting"
}



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
     "&proId=" + diagramData.projectID + "&title=" + diagramData.title + "&code=" + encodeURIComponent(diagramData.code);
  }

function saveKeys(projkey, isskey){
    localStorage.setItem("projectkey", projkey);
    localStorage.setItem("issuekey", isskey);
}

var diagramsToFilter = {};
var diagramsListed = {};

function diagramResource(projectId = "", projectTitle="", showDiagrams = false){
    let e = document.getElementById("resourcesSelect");
    let check;
    !projectId ? (projectId = e.options[e.selectedIndex].value, check = true) : check = false
    !projectTitle ? projectTitle = e.options[e.selectedIndex].innerText : ""
    let uri = AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/diagrams";
    AJS.$.ajax({
        url: uri,
        method: "GET",
        data: {projectId: projectId},
        dataType: "json",
        success: function(diagramsArray){
            let allDiagrams = AJS.$(diagramsArray);
            diagramsToFilter[projectTitle] = [];
            diagramsToFilter[projectTitle] = allDiagrams.map((i, diagram) => { console.log(diagram); return ({projectID, title, documentID, code} = diagram )});  
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
        diagramsListed[docId] = {projectID: diagram.projectID, title: diagram.title||"Untitled Diagram", documentID: diagram.documentID, code: diagram.code};
    });
}

function filterDiagrams(){
    let word = document.getElementById("filterText").value;
    let d = JSON.stringify(diagramsToFilter);
    let result = [];
    for(key of Object.keys(diagramsToFilter)){
        diagramsToFilter[key].filter(diagram => {
            diagram.title = diagram.title||"Untitled Diagram";
            (diagram.title).indexOf(word) != -1 ? result.push({pTitle: key + " : "+ diagram.title, title: diagram.title, documentID: diagram.documentID, projectID: diagram.projectID}) : ""
        });
    }   
    word === "" ? (
        result = [],
         document.getElementById("pButton").style.display = "block", 
         document.getElementById("arrow2").innerHTML = "&#9658;"
         ) : document.getElementById("pButton").style.display = "none"
    addListitems(result);
}

function editImage(projectID, documentID){
    url = "https://www.mermaidchart.com/app/projects/" + projectID + "/diagrams/" + documentID + "/version/v0.1/edit"
    window.open(url, '_blank').focus();
}

function syncImage(event, docId, diagramTitle){
    let uri = AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/diagramInfo";
    AJS.$.ajax({
        url: uri,
        method: "GET",
        data: {docId: docId},
        dataType: "json",
        success: function(diagramData){
            let diagram = AJS.$(diagramData);
            console.log(diagram);
            console.log(diagram[0].code);
            window.location.href = "/jira/plugins/servlet/diagrampreview?docId=" + diagram[0].documentID +
     "&proId=" + diagram[0].projectID + "&title=" + (diagram[0].title||"Untitled Diagram") + "&code=" + encodeURIComponent(diagram[0].code); 
        }
    });
}

function test(filename){
const svgElement = document.querySelector('[id^="mermaid-"]');
const canvas = document.querySelector('canvas');
const img = document.querySelector('img');



const svgXml = new XMLSerializer().serializeToString(svgElement);
 console.log('data:image/svg+xml;base64,' + btoa(svgXml));
 img.src = 'data:image/svg+xml;base64,' + btoa(svgXml);
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
            let uri = AJS.contextPath() + "/rest/api/2/issue/" + issuekey;
            let payload = {fields: 
                {
                    description:  "!" + filename + ".png|thumbnail!"
                }
            };
            AJS.$.ajax({
                url: uri,
                type: "PUT",
                data: JSON.stringify(payload),
                headers: {
                    "Authorization": "Basic " + btoa("test:test"),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                dataType: "json",
                success: function(){
                    console.log("/jira/projects/" + projectkey + "/issues/" + issuekey);
                window.location.href = "/jira/projects/" + projectkey + "/issues/" + issuekey;
                }
            });
        });
}
}





function toObjectUrl(url) {
    return fetch(url)
        .then((response)=> {
          return response.blob();
        })
        .then(blob=> {
          return URL.createObjectURL(blob);
        });
  }







//return a promise that resolves with a File instance
function urltoFile(url, filename, mimeType){
    mimeType = mimeType || (url.match(/^data:([^;]+);/)||'')[1];
    return (fetch(url)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], filename, {type:mimeType});})
    );
}

//Usage example:


function DataURIToBlob(dataURI) {
    console.log(dataURI);
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

    var ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++)
       ia[i] = byteString.charCodeAt(i)
    console.log(mimeString);
    return new Blob([ia], {
       type: mimeString
    })
 }

