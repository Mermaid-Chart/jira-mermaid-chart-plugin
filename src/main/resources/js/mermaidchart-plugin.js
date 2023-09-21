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


    // when document is ready, append icon with mermaid chart in issue screen
    AJS.$(document).ready(function(){
        let mcDiv = document.getElementById("com.plugin.mermaidchart.mermaidchart-plugin:mermaidchart-diagrams-link");
        let img;
        mcDiv
        ?   (mcDiv.parentElement.style.display = "flex",
            mcDiv.firstChild.style.display = "flex",
            img = new Image(),
            img.setAttribute("style", "height: 16px; width: 16px; margin: 2px 5px 2px 0px;"),
            img.src = "/jira/download/resources/com.plugin.mermaidchart.mermaidchart-plugin:mermaidchart-plugin-resources/images/mermaid-icon-16.png",
            mcDiv.firstChild.prepend(img)    )
        : ""
    });


    // function to add actions with mermaid attachments
    const attachmentActions = async function(){
        let allAttachments = document.getElementsByClassName("attachment-delete");
        for(attachment of allAttachments) {
            let id = attachment.firstChild.id.split("_")[1];
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
            anchor.target = "_blank")
        : ""
        let span =  document.createElement('span');
        span.setAttribute('class', 'icon-default aui-icon aui-icon-small aui-iconfont-' + type);
        anchor.appendChild(span);
        return anchor;
    }

        let attachmentThumbnail = document.getElementById('attachment_thumbnails')
        attachmentThumbnail ? attachmentActions() : ""


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
            getAllDiagrams(projectsList, false);
            populateProjectsInView(projectsList);
        }
    });
}

// function to populate projects in select options
function populateProjectsInView(allProjects){
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

// function to get diagrams against projects list
function getAllDiagrams(projects, willPopulate = false){
    diagramsList= [];
    let diagramsSection = document.getElementById("diagrams");
    diagramsSection.innerHTML = '';
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
    let diagramsOfSelectedProject = diagramsList[projectId];
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

// function to display messagge when thhere is no diagram against selected project
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
            (project.title).indexOf(textToFilter) !== -1
            ? projectsFiltered.push(project)
            : ""
        }))
    : projectsFiltered = null;
    projectsFiltered ? populateProjectsInView(projectsFiltered) : (projectsList.shift(), populateProjectsInView(projectsList)); 
}

// function to refresh diagrams
function refreshDiagrams(){
    let projectsSelector = document.getElementById('projects');
    let projectId = projectsSelector.options[projectsSelector.selectedIndex].value;
    let project = [{id: projectId}];
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
    previewLoader.style.display = "block";
    let selectedDiagram = getSelectedDiagram();
    console.log(selectedDiagram);
    document.getElementById("diagramTitle").innerHTML = selectedDiagram.title||"Untitled Diagram";
    setPNG(selectedDiagram);
}

// function to insert selected diaggram to jira
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
        redirect ? window.location.href = "/jira/projects/" + projectkey + "/issues/" + issuekey : ""
    });
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
            console.log(diagramsArray);
            diagram = diagramsArray
        }
    });
    return diagram;
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

// function to get jira issue key on issue screen    
JIRA.bind(JIRA.Events.ISSUE_REFRESHED, function() {
    issueKeyToSync = AJS.$("#key-val").text();
});

// function to hanle click event on refresh icon on attachment
AJS.$(document).on('click', '[id^="refresh_"]', async function(event){
    event.stopImmediatePropagation();
    let id = this.id.split('_')[1];
    diagramToSync = mermaidAttachments[id];
    deleteAttachment(id);
    setPNG(diagramToSync, false);
    setTimeout(() => {location.reload()}, 10000);        
});