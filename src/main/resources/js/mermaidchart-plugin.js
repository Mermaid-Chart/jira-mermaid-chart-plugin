// global variables
var projectsList = [];
var diagramsList = [];
var projectsFiltered = [];
var previewDiagramDataURL;
var securityTokenValue = null;
var beforeAboutSectionId;
var mermaidAttachments = {};
var diagramToSync;
var issueKeyToSync;
var lastSelectedProject;
var lastSelectedProjectDiagrams;

// when window loaded perform default validations and actions
AJS.$(window).on("load", function(){

    var previewLoader = document.getElementById('previewLoader');

    // function to handle sidebar buttons clicks
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


    // function to call when user did not configure settings 
    async function towardsSetting(){
        securityTokenValue = securityTokenValue||document.getElementById('validateSettings').value;
        securityTokenValue == "$securityToken" ? securityTokenValue = "" : ""
        if(!securityTokenValue){
            let toastMsg = document.getElementById('toast-warning');
            toastMsg.style.display="flex";
            await new Promise(r => setTimeout(r, 3000));
            document.getElementById('settings').click();
            toastMsg.style.display = "none";
        }
    }
    document.getElementById('validateSettings') ? towardsSetting() : ''

    // function to add actions with mermaid attachments
    const attachmentActions = async function(){
        let allAttachments = document.getElementsByClassName("attachment-delete");
        for(attachment of allAttachments) {
            let id = attachment.firstChild.id.split("_")[1];
            let childs = attachment.getElementsByTagName('a');
            if(!(childs.length > 1)){
                let attachmentDetails = await getAttachmentConfigurations(id);
                attachmentDetails
                ?   (attachment.style.width = "65px",
                    mermaidAttachments[id] = attachmentDetails,
                    attachment.appendChild(appendElements("edit", id, 1.5, attachmentDetails)),
                    attachment.appendChild(appendElements("refresh", id, 3, attachmentDetails)))
                : ""
            }
        }

    }

    function appendElements(type, id, margin, attachment){
        let anchor = document.createElement('a');
        anchor.title = (type.charAt(0).toUpperCase() + type.slice(1)) + " this attachment";
        anchor.id = type + "_" + id;
        anchor.style.marginLeft = margin + "rem";
        anchor.style.cursor = "pointer";
        type === "edit" 
        ? (anchor.href = attachment.baseURL + "/app/projects/" + attachment.projectID + "/diagrams/" + attachment.documentID + "/version/v0.1/edit",
            anchor.target = "_blank")
        : ""
        let span =  document.createElement('span');
        span.setAttribute('class', 'icon-default aui-icon aui-icon-small aui-iconfont-' + type);
        anchor.appendChild(span);
        return anchor;
    }

    let attachmentThumbnail = document.getElementById('attachment_thumbnails')
    attachmentThumbnail ? (attachmentActions()) : (console.log("Attachment thumbnails not found"))

    AJS.$(document).on("mouseover", "#attachmentmodule", attachmentActions);
});


// function to get projects and their respective diagrams
function getProjects(userKey){
    projectsList= [];
    AJS.$.ajax({
        url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/projects",
        method: "GET",
        data: { userkey: userKey },
        dataType: "json",
        success: function(projectsArray){
            projectsList = projectsArray;
            getAllDiagrams(projectsList);
            populateProjectsInView(projectsList);
        }
    });
}

// function to populate projects in select options
function populateProjectsInView(allProjects){
    let projectsSelector = document.getElementById('projects');
    projectsSelector.innerHTML = "";
    allProjects.unshift({title: "Projects", id: '', selected: true, disabled: true});
    allProjects.forEach(project => {
        let option = document.createElement('option');
        option.setAttribute('value', project.id);
        option.innerHTML = project.title;
        option.selected = project.selected;
        option.disabled = project.disabled;
        projectsSelector.appendChild(option);
    });
    let lastProject = JSON.parse(localStorage.getItem("last_selected_project"));
    lastProject ? (projectsSelector.value = lastProject[0].id, populateDiagramsInView()) : ""
}

// function to get diagrams against projects list
function getAllDiagrams(projects, willPopulate = false){
    projects.forEach(project => {
        AJS.$.ajax({
            url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/diagrams",
            method: "GET",
            data: {  projectId: project.id },
            dataType: "json",
            success: function(diagramArray){
                diagramsList[project.id] = diagramArray;
                willPopulate ? populateDiagramsInView() : ""
            }
        });
    });
}

// function to populate diagrams in list items
function populateDiagramsInView(){
    let projectsSelector = document.getElementById('projects');
    let projectId = projectsSelector.options[projectsSelector.selectedIndex].value;
    lastSelectedProject = projectsList.filter(project => project.id === projectId);
    localStorage.setItem("last_selected_project", JSON.stringify(lastSelectedProject))
    diagramsList[projectId] = diagramsList[projectId] || JSON.parse(localStorage.getItem("last_selected_project_diagrams"));
    let diagramsOfSelectedProject = lastSelectedProjectDiagrams = diagramsList[projectId];
    localStorage.setItem("last_selected_project_diagrams", JSON.stringify(lastSelectedProjectDiagrams));
    let diagramsSection = document.getElementById("diagrams");
    diagramsSection.innerHTML = '';
    if(!diagramsOfSelectedProject.length){
        noDiagramFound();
        return;
    }
    diagramsOfSelectedProject.forEach(diagram => {
        let li = document.createElement("li");
        li.setAttribute('class', 'py-2 px-2 hover:bg-gray-200 border border-b-1 border-gray-200 cursor-pointer');
        li.id = diagram.id;
        li.innerHTML = diagram.title||"Untitled Diagram";
        diagramsSection.appendChild(li);
    });
}

// function to display message when thhere is no diagram against selected project
function noDiagramFound(){
    let div = document.createElement('div');
    div.setAttribute('class', 'flex justify-center mt-4 opacity-50');
    let p = document.createElement('p');
    p.innerHTML = "No diagram found.";
    div.appendChild(p);
    document.getElementById('diagrams').appendChild(div);
}

// function to provide search project functionality
function searchProjects(){
    projectsFiltered = [];
    let textToFilter = document.getElementById('filterText').value; 
    textToFilter 
    ?   (projectsList.forEach(project => {
            (project.title.toLowerCase()).indexOf(textToFilter.toLowerCase()) !== -1
            ? projectsFiltered.push(project)
            : ""
        }))
    : projectsFiltered = null;
    projectsFiltered ? populateProjectsInView(projectsFiltered) : (projectsList.shift(), populateProjectsInView(projectsList)); 
}

// function to refresh diagrams
function refreshDiagrams(){
    document.getElementById('previewImage').src = "";
    document.getElementById('diagramError').style.display = "none";
    document.getElementById('diagramTitle').value = "";
    document.getElementById('previewBox').classList.remove("border");
    document.getElementById('previewBox').classList.remove("border-gray-300");
    let projectsSelector = document.getElementById('projects');
    let projectId = projectsSelector.options[projectsSelector.selectedIndex].value;
    let project = [{id: projectId}];
    document.getElementById("diagramPlaceholder").style.display = "block";
    let diagramsSection = document.getElementById("diagrams");
    diagramsSection.innerHTML = '';
    getAllDiagrams(project, true);
}

// Click event listener to handle styling of diagrams list items
AJS.$(document).on('click', '.diagramsClass > li', function (event) {
    event.preventDefault();
    if (AJS.$('.diagramsClass > li').hasClass('selected')) {
        AJS.$('.diagramsClass > li').removeClass('selected');
        AJS.$(this).addClass("selected");
    } else {
        AJS.$(this).addClass("selected");
    }
    insertDiagramToPreviewPanel();
});

// function to insert diagram to preview panel when selected
function insertDiagramToPreviewPanel(){
    document.getElementById("previewImage").src = "";
    document.getElementById("diagramError").style.display = "none";
    document.getElementById("diagramPlaceholder").style.display = "none";
    previewLoader.style.display = "block";
    let selectedDiagram = getSelectedDiagram();
    document.getElementById("diagramTitle").value = selectedDiagram.title||"Untitled Diagram";
    document.getElementById('previewBox').classList.add("border");
    document.getElementById('previewBox').classList.add("border-gray-300");
    setPNG(selectedDiagram);
}

// function to insert selected diagram to jira
function insertToJira(projectkey = "", issuekey = "", baseURL = "", redirect = true, diagramToConfigure = null){
    if(!previewDiagramDataURL)
        return;
    let filename = diagramToConfigure?.title||AJS.$(".diagramsClass > li.selected").text();
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
        let attachmentId = attachmentresponse[0].id;
        let diagram = diagramToConfigure||getSelectedDiagram(); 
        let payload = {
            data: JSON.stringify({
                documentID: diagram.documentID, 
                projectID: diagram.projectID, 
                title: diagram.title||"Untitled Diagram", 
                code: diagram.code,
                baseURL: baseURL||diagram.baseURL
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
            error: function(){}
        });
        redirect ? window.location.href = "/jira/projects/" + projectkey + "/issues/" + issuekey : location.reload();
    });
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

// function to get selected diagram
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

// function to save settings either its admin settings or user settings
function saveSettings(userkey){
    let baseURL = document.getElementById("baseURL").value || null;
    let securityToken = document.getElementById("securityToken").value;
    securityTokenValue = securityToken;

    let payload = {
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
            document.getElementById("settingsToDiagrams").innerHTML = "Go to the <button onclick= \"goToDiagrams()\"class=\"text-blue-700 underline\">Diagrams</button> page to see your diagrams.";
            getProjects(userkey);
        }
    });
    
}

// function to get attachment configurations in issue screen
async function getAttachmentConfigurations(attId){
    let diagram;
    await AJS.$.ajax({
        url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/getAttachmentConfigurations",
        method: "GET",
        data: { attachmentID: attId },
        dataType: "json",
        success: function(diagramsArray){
            diagram = diagramsArray
        }
    });
    return diagram;
}

function goToDiagrams(){
    document.getElementById("savedStatus").innerHTML = "";
    document.getElementById("settingsToDiagrams").innerHTML = "";
    document.getElementById('diagram').click();
}

// function to redirect towards jira issue
function backToJiraIssue(projectkey, issuekey){
    window.location.href = "/jira/projects/" + projectkey + "/issues/" + issuekey;
}

// function to close toast warning message to configure settings
function closeToast(){
    document.getElementById("toast-warning").style.display = "none";
}

// function to close about dialog and activate the previously activated tab
AJS.$(document).on("click", "#modalCloseBtn", function(){
    document.getElementById("aboutSection").style.display = "none";
    document.getElementById(beforeAboutSectionId).click();
});

window.onclick = function(event) {
    let modal = document.getElementById("about-modal");
    if (event.target == modal) {
        document.getElementById("aboutSection").style.display = "none";
        document.getElementById(beforeAboutSectionId).click();
    }
}

// function to get the diagram from mermaid chart and configure accordingly.
function setPNG(diagram, showPreview = true){
    AJS.$.ajax({
        url: AJS.contextPath() + "/rest/mermaid-chart/1.0/resources/getPNG",
        method: "GET",
        data: { documentId: diagram.documentID },
        dataType: "json",
        success: function(){},
        error: function(res){
            const base64Image = btoa(res.responseText);
            previewDiagramDataURL = "data:image/png;base64," + base64Image;
            showPreview ? document.getElementById("previewImage").src = "data:image/png;base64," + base64Image : insertToJira("", "", diagram.baseURL, false, diagram);
            res.responseText.startsWith('<!DOCTYPE') ? (document.getElementById("previewImage").src = "", document.getElementById("diagramError").style.display="block") : ""
            previewLoader.style.display = "none";
        }
    })
}

// function to delete attachment
function deleteAttachment(attachmentId){
    AJS.$.ajax({
        type: "DELETE",
        url: AJS.contextPath() + "/rest/api/2/attachment/" + attachmentId,
        headers: { "X-Atlassian-Token": "nocheck" },
        success: function(){}
    });
}

// function to handle click event on edit icon on attachment
AJS.$(document).on('click', '[id^="edit_"]', function(event){
    event.stopImmediatePropagation();
    if (event.ctrlKey) {
        return;
    }
    const ctrlClickEvent = new MouseEvent('click', {
        bubbles: true,
        ctrlKey: true,
    });
    this.dispatchEvent(ctrlClickEvent);
});

// function to handle click event on refresh icon on attachment
AJS.$(document).on('click', '[id^="refresh_"]', async function(event){
    event.stopImmediatePropagation();
    AJS.$("body").append('<div id="overlay" style="background-color: rgba(210, 210, 210, 0.6); z-index: 999; position: absolute; left: 0; top: 0; width: 100%; height: 100%;" class="flex items-center justify-center"> '
     + '<button disabled type="button" class="text-white bg-blue-600 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 inline-flex items-center"'
     + '<svg aria-hidden="true" role="status" class="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">'
     + '<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>'
     + ' <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>'
    + '</svg>'
   + 'Refreshing diagram…'
  + '</button></div>');

    let id = this.id.split('_')[1];
    diagramToSync = mermaidAttachments[id];
    issueKeyToSync = AJS.$("#key-val").text();
    deleteAttachment(id);
    setPNG(diagramToSync, false);
});