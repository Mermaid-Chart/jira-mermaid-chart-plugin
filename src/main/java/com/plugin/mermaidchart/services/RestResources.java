package com.plugin.mermaidchart.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import com.plugin.mermaidchart.models.Project;
import com.plugin.mermaidchart.models.Diagram;
import com.plugin.mermaidchart.repositories.RestClient;

import javax.ws.rs.Consumes;
import javax.ws.rs.Produces;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;

import com.google.gson.Gson; 
import com.google.gson.GsonBuilder; 
import org.apache.http.util.EntityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import org.springframework.stereotype.Service;
import java.util.*;
import com.google.gson.reflect.TypeToken;  


@Service
@Path("/")
public class RestResources {

    @Autowired
    private RestClient restClient;
  
    @ComponentImport
    private final PluginSettingsFactory pluginSettingsFactory;

    private static Logger logger = LoggerFactory.getLogger(RestResources.class);
    private static final String PLUGIN_STORAGE_KEY = "com.plugin.mermaidchart.models.UserConfigurations";
    private static Object baseURL;
    private static Object securityToken;

    @Inject
    public RestResources(PluginSettingsFactory pluginSettingsFactory) {
      this.pluginSettingsFactory = pluginSettingsFactory;
    }

    @Path("/resources/projects")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<Project> getProjects() throws ClientProtocolException, IOException {
        logger.info("getProjects Called....");
        if(securityToken.equals("")){
            return new ArrayList<Project>();
        }
        String URL = "https://" + baseURL + "/rest-api/projects";
        HttpResponse response = restClient.getData(URL, securityToken);
        Gson gson = new Gson();
        String json = EntityUtils.toString(response.getEntity());
        ArrayList<Project> projectsList = gson.fromJson(json,new TypeToken<List<Project>>() {}.getType());
        return projectsList;
    }

    @Path("/resources/diagrams")
    @GET
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public String getDiagrams(@Context final HttpServletRequest req) throws ClientProtocolException, IOException{
        logger.info("getDiagrams Called....");
        String projectID = req.getParameter("projectId");
        String URL = "https://" + baseURL + "/rest-api/projects/" + projectID + "/documents";
        HttpResponse response = restClient.getData(URL, securityToken);
        String json = EntityUtils.toString(response.getEntity());
        return json;
    }

    // @Path("/resources/image")
    // @GET
    // @Consumes(MediaType.APPLICATION_JSON)
    // @Produces(MediaType.APPLICATION_JSON)
    // public String getImage(@Context final HttpServletRequest req) throws ClientProtocolException, IOException{
    //     String documentID = req.getParameter("documentID");
    //     String projectID = req.getParameter("projectID");
    //     String URL = "https://" + baseURL + "/rest-api/projects/" + projectID + "/documents/" + documentID;
    //     HttpResponse response = restClient.getData(URL, securityToken);
    //     String json = EntityUtils.toString(response.getEntity());
    //     return json;
    // }


    public void setParams(){
        baseURL = pluginSettingsFactory.createGlobalSettings().get(PLUGIN_STORAGE_KEY + ".baseURL");
        securityToken = pluginSettingsFactory.createSettingsForKey("MermaidChart").get(PLUGIN_STORAGE_KEY + ".securityToken");
    }


} 

