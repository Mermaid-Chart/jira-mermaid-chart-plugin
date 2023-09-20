var projectsList = [];
var diagramsList = [];
var projectsFiltered = [];
var previewDiagramDataURL;
var securityTokenValue = null;
var beforeAboutSectionId;
var mermaidAttachments = {};
var diagramToSync;
var issueKeyToSync;


function saveBaseURL(basrUrl){
    localStorage.setItem("BaseURL", basrUrl);
}

function getProjects(){
    projectsList= [];
    AJS.$.ajax({
        url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/projects",
        method: "GET",
        dataType: "json",
        success: function(projectsArray){
            projectsList = projectsArray;
            getAllDiagrams(projectsList);
            populateProjectsInView(projectsList);
            console.log(projectsList);
        }
    });
}

function populateProjectsInView(allProjects){
    console.log(allProjects);
    let projectsSelector = document.getElementById('projects');
    projectsSelector.innerHTML = "";
    allProjects.unshift({title: "Select project", id: '', selected: true, disabled: true});
    allProjects.forEach(project => {
        let option = document.createElement('option');
        option.setAttribute('value', project.id);
        option.innerHTML = project.title;
        option.selected = project.selected;
        option.disabled = project.disabled;
        projectsSelector.appendChild(option);
    });
}

function getAllDiagrams(projects){
    diagramsList= [];
    projects.forEach(project => {
        AJS.$.ajax({
            url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/diagrams",
            method: "GET",
            data: { 
                projectId: project.id
            },
            dataType: "json",
            success: function(diagramArray){
                diagramsList[project.id] = diagramArray;
                console.log(diagramArray);
            }
        })
    });
}

function populateDiagramsInView(){
    let projectsSelector = document.getElementById('projects');
    let projectId = projectsSelector.options[projectsSelector.selectedIndex].value;
    let diagramsOfSelectedProject = diagramsList[projectId];
    let diagramsSection = document.getElementById("diagrams");
    diagramsSection.innerHTML = '';
    diagramsOfSelectedProject.forEach(diagram => {
        let li = document.createElement("li");
        li.setAttribute('class', 'py-2 px-2 hover:bg-gray-200 border border-b-1 border-gray-200');
        li.id = diagram.id;
        li.innerHTML = diagram.title||"Untitled Diagram";
        diagramsSection.appendChild(li);
    });
}

function searchProjects(){
    projectsFiltered = [];
    let textToFilter = document.getElementById('filterText').value; 
    textToFilter 
    ?   (projectsList.forEach(project => {
            (project.title).indexOf(textToFilter) !== -1
            ? projectsFiltered.push(project)
            : ""
        }))
    : projectsFiltered = null;
    projectsFiltered ? populateProjectsInView(projectsFiltered) : (projectsList.shift(), populateProjectsInView(projectsList)); 
}

function refreshDiagrams(){
    let projectsSelector = document.getElementById('projects');
    let projectId = projectsSelector.options[projectsSelector.selectedIndex].value;
    let project = [{id: projectId}];
    getAllDiagrams(project);
}

// Click event listener to handle styling of tree view list item's
AJS.$(document).on('click', '.diagramsClass > li', function (event) {
    event.preventDefault();
    if (AJS.$('.diagramsClass > li').hasClass('selected')) {
        AJS.$('.diagramsClass > li').removeClass('selected');
        AJS.$(this).addClass("selected");
    } else {
        AJS.$(this).addClass("selected");
    }
});

async function insertDiagramToPreviewPanel(baseURL){
    let selectedDiagram = getSelectedDiagram();
    console.log(selectedDiagram);
    document.getElementById("diagramTitle").innerHTML = selectedDiagram.title||"Untitled Diagram";
    setPNG(selectedDiagram);


    // let payload = {pngCode: selectedDiagram.code,
    // theme: "default",
    // darkModeEnabled: false}
    // AJS.$.ajax({
    //     url: baseURL + "/raw/" + selectedDiagram.documentID + "?version=v0.1&theme=light&format=png",
    //     type: "GET",
    //     // data: payload,
    //     dataType: "image/png",
    //     success: function(res){
    //         console.log("Success response is ", res);
    //     },
    //     error: function(res){
    //         console.log("Error response is ", res);
    //     }
    // })

    
    
    // mermaid.initialize({ startOnLoad: true });
    // const { svg } = await mermaid.render('mermaid', selectedDiagram.code);
    // // const img = new Image();
    // let img = document.getElementById('previewImageSvg')
    // img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    // img.onload = function () {
    //     const canvas = document.createElement('canvas');
    //     const context = canvas.getContext('2d');
    //     canvas.width = img.width;
    //     canvas.height = img.height;
    //     context.drawImage(img, 0, 0);
    //     previewDiagramDataURL = canvas.toDataURL('image/png');
        // const imgElement = document.getElementById("previewImage");
        // imgElement.src = previewDiagramDataURL;
    // };
}

function insertToJira(projectkey = "", issuekey = "", redirect = true, diagramToConfigure = null){
    if(!previewDiagramDataURL)
        return;
    let filename = diagramToConfigure?.title||AJS.$(".diagramsClass > li.selected").text();
    console.log(filename); 
    console.log(previewDiagramDataURL);
    let file = DataURIToBlob(previewDiagramDataURL);
    file = new File([file], filename+'.png');
    const formData = new FormData();
    formData.append('file', file);

    issuekey = issuekey||issueKeyToSync;

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
    }).done(function(attachmentresponse) {
        console.log(attachmentresponse); 
        let attachmentId = attachmentresponse[0].id;
        let diagram = diagramToConfigure||getSelectedDiagram(); 
        let payload = {
            data: JSON.stringify({
                documentID: diagram.documentID, 
                projectID: diagram.projectID, 
                title: diagram.title||"Untitled Diagram", 
                code: diagram.code,
                baseURL: localStorage.getItem("BaseURL")
            }), 
            attachmentID: attachmentId
        };
        AJS.$.ajax({
            type: "POST",
            url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/saveAttachmentConfigurations",
            cache: false,
            data: payload,
            dataType: "json",
            headers: { 
                'Accept': 'application/json',
                'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8;" 
            },
            success: function(){},
            error: function(response){
                console.log("res ailed", response);
            }
        });
        redirect ? window.location.href = "/jira/projects/" + projectkey + "/issues/" + issuekey : ""
    });
}

function getSelectedDiagram(){
    let selectedDiagramId = AJS.$(".diagramsClass > li.selected").attr("id"); 
    let projectsSelector = document.getElementById('projects');
    let projectId = projectsSelector.options[projectsSelector.selectedIndex].value;
    let diagramSelected = diagramsList[projectId].filter(diagramsListed => diagramsListed.id === selectedDiagramId);
    return diagramSelected[0];    
}

// function to redirect to mermaid chart edit image screen
function openInMC(domainName){
    let selectedDiagram = getSelectedDiagram();
    url = domainName + "/app/projects/" + selectedDiagram.projectID + "/diagrams/" + selectedDiagram.documentID + "/version/v0.1/edit"
    window.open(url, '_blank').focus();
}

function saveSettings(userkey){
    let baseURL = document.getElementById("baseURL").value||null;
    let securityToken = document.getElementById("securityToken").value;
    securityTokenValue = securityToken;

    console.log(baseURL, userkey , securityToken);
    let payload = {
        // baseURL: baseURL,
        securityToken: securityToken,
        userKey: userkey
    };
    baseURL ? payload.baseURL = baseURL : ""

    AJS.$.ajax({
        type: "POST",
        url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/saveConfigurations",
        cache: false,
        data: payload,
        dataType: "json",
        headers: { 
            'Accept': 'application/json',
            'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8;" 
        },
        success: function(){},
        error: function(response){
            document.getElementById("savedStatus").innerHTML = response.responseText;
            console.log("res ailed", response);
        }
    });
    getProjects();
}


async function getAttachmentConfigurations(attId){
    let diagram;
    await AJS.$.ajax({
        url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/getAttachmentConfigurations",
        method: "GET",
        data: { 
            attachmentID: attId
        },
        dataType: "json",
        success: function(diagramsArray){
            console.log(diagramsArray);
            diagram = diagramsArray
        }
    });
    return diagram;
}

function backToJiraIssue(projectkey, issuekey){
    window.location.href = "/jira/projects/" + projectkey + "/issues/" + issuekey;
}

function closeToast(){
    document.getElementById("toast-warning").style.display = "none";
}

AJS.$(document).on("click", "#modalCloseBtn", function(){
    document.getElementById("aboutSection").style.display = "none";
    document.getElementById(beforeAboutSectionId).click();
});

function setPNG(diagram, showPreview = true){
    AJS.$.ajax({
        url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/getPNG",
        method: "GET",
        data: { 
            documentId: diagram.documentID
        },
        dataType: "json",
        success: function(){},
        error: function(res){
            const base64Image = btoa(res.responseText);
            console.log(base64Image);
            previewDiagramDataURL = "data:image/png;base64," + base64Image;
            showPreview ? document.getElementById("previewImage").src = "data:image/png;base64," + base64Image : insertToJira("", "", false, diagram);
        }
    })
}

function deleteAttachment(attachmentId){
    AJS.$.ajax({
        type: "DELETE",
        url: AJS.contextPath() + "/rest/api/2/attachment/" + attachmentId,
        headers: {
            "X-Atlassian-Token": "nocheck"
        },
        success: function(res){
            console.log(res);
        }
    });
}



AJS.$(window).on("load", function(){

    const btnClick = function () {
        let sectionToHideId = this.parentNode.getElementsByClassName("active")[0].id;
        let sectionToHide = document.getElementById(sectionToHideId + "Section");
        this.id === "about" ? beforeAboutSectionId = sectionToHideId : sectionToHide.style.display = "none";
        this.parentNode.getElementsByClassName("active")[0].classList.remove("active");
        this.classList.add("active");
        let sectionToDisplayId = this.id;
        sectionToDisplayId === "diagram" ? towardsSetting() : ""
        let sectionToDisplay = document.getElementById(sectionToDisplayId + "Section");
        sectionToDisplay.style.display = "block";
    };
    document.querySelectorAll(".btn-group .btn").forEach(btn => btn.addEventListener('click', btnClick));

    async function towardsSetting(){
        securityTokenValue = securityTokenValue||document.getElementById('validateSettings').value;
        securityTokenValue == "$securityToken" ? securityTokenValue = "" : ""
        console.log(securityTokenValue);
        if(!securityTokenValue){
            let toastMsg = document.getElementById('toast-warning');
            toastMsg.style.display="flex";
            await new Promise(r => setTimeout(r, 3000));
            document.getElementById('settings').click();
            toastMsg.style.display = "none";
        }
    }
    document.getElementById('validateSettings') ? towardsSetting() : ''

    AJS.$(document).ready(function(){
        let mcDiv = document.getElementById("com.plugin.mermaidchart.mermaidchart-plugin:mermaidchart-diagrams-link");
        let img;
        mcDiv
        ?   (console.log("In...."),
            mcDiv.parentElement.style.display = "flex",
            mcDiv.firstChild.style.display = "flex",
            img = new Image(),
            img.setAttribute("style", "height: 16px; width: 16px; margin: 2px 5px 2px 0px;"),
            img.src = "/jira/download/resources/com.plugin.mermaidchart.mermaidchart-plugin:mermaidchart-plugin-resources/images/mermaid-icon-16.png",
            mcDiv.firstChild.prepend(img)    )
        : ""
    });

    const attachmentActions = async function(){
        let allAttachments = document.getElementsByClassName("attachment-delete");
        for(attachment of allAttachments) {
            let id = attachment.firstChild.id.split("_")[1];
            console.log(id);
            let attachmentDetails = await getAttachmentConfigurations(id);
            attachmentDetails
            ?   (attachment.style.width = "60px",
                mermaidAttachments[id] = attachmentDetails,
                attachment.appendChild(appendElements("edit", id, 1, attachmentDetails)),
                attachment.appendChild(appendElements("refresh", id, 2.3, attachmentDetails)))
            : ""
        }
    }

    function appendElements(type, id, margin, attachment){
        let anchor = document.createElement('a');
        anchor.title = (type.charAt(0).toUpperCase() + type.slice(1)) + " this attachment in mermaid chart";
        anchor.id = type + "_" + id;
        anchor.style.marginLeft = margin + "rem";
        anchor.style.cursor = "pointer";
        type === "edit" 
        ? (anchor.href = attachment.baseURL + "/app/projects/" + attachment.projectID + "/diagrams/" + attachment.documentID + "/version/v0.1/edit",
            anchor.target = "_blank",
            anchor.rel="noopener noreferrer"
            )
        : ""
        let span =  document.createElement('span');
        span.setAttribute('class', 'icon-default aui-icon aui-icon-small aui-iconfont-' + type);
        anchor.appendChild(span);
        return anchor;

    }

        let attachmentThumbnail = document.getElementById('attachment_thumbnails')
        attachmentThumbnail ? attachmentActions() : ""


});

    AJS.$(document).on('click', '[id^="edit_"]', function(event){
    event.preventDefault();
        if (event.ctrlKey) {
            return;
        }
        const ctrlClickEvent = new MouseEvent('click', {
            bubbles: true,
            ctrlKey: true,
        });

        this.dispatchEvent(ctrlClickEvent);
    });

    
    JIRA.bind(JIRA.Events.ISSUE_REFRESHED, function() {
        issueKeyToSync = AJS.$("#key-val").text();
        console.log("Issue Key: " + issueKeyToSync);
    });


    AJS.$(document).on('click', '[id^="refresh_"]', async function(event){
        event.stopImmediatePropagation();

        console.log(AJS);

        // JIRA.bind(JIRA.Events.ISSUE_REFRESHED, function() {
        //     var key = AJS.$("#key-val").text();
        //     console.log("Issue Key: " + key);
        // });

        let id = this.id.split('_')[1];
        console.log(id);
        diagramToSync = mermaidAttachments[id];
        deleteAttachment(id);
        console.log(diagramToSync);
        // insertToJira({redirect: false, diagramToConfigure: diagramToSync});
        setPNG(diagramToSync, false);
        setTimeout(() => {location.reload()}, 10000);
        
    });



















































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

// var diagramsToFilter = {};
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