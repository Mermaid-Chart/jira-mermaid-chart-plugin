package com.plugin.mermaidchart.services;

import java.io.IOException;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;

import javax.inject.Inject;
import com.plugin.mermaidchart.models.Project;
import com.plugin.mermaidchart.repositories.RestClient;

import javax.ws.rs.Consumes;
import javax.ws.rs.Produces;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Context;

import com.google.gson.Gson; 
import org.apache.http.util.EntityUtils;

import org.springframework.beans.factory.annotation.Autowired;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import org.springframework.stereotype.Service;
import java.util.*;
import com.google.gson.reflect.TypeToken;  

@Service
@Path("/")
public class RestResources {

	private static final String PLUGIN_STORAGE_KEY = "com.plugin.mermaidchart.models.UserConfigurations";
  private static Object baseURL;
  private static Object securityToken;

  @Autowired
  private RestClient restClient;

  @ComponentImport
  private final UserManager userManager;
  
  @ComponentImport
  private final PluginSettingsFactory pluginSettingsFactory;

  @Inject
  public RestResources(UserManager userManager, PluginSettingsFactory pluginSettingsFactory) {
    this.userManager = userManager;
    this.pluginSettingsFactory = pluginSettingsFactory;
  }

  @Path("/resources/saveConfigurations")
  @POST
  @Produces(MediaType.APPLICATION_JSON)
  public String saveConigurations(@Context final HttpServletRequest request) throws ClientProtocolException, IOException {
    String securityTkn = request.getParameter("securityToken");
    String userKey = request.getParameter("userKey");  
    System.out.println(securityTkn);
    System.out.println(userKey);
    String username = userManager.getRemoteUsername(request);
    if (userManager.isSystemAdmin(username)) {
      String baseUrl = request.getParameter("baseURL");
      System.out.println(baseUrl);
      pluginSettingsFactory.createGlobalSettings().put(PLUGIN_STORAGE_KEY + ".baseURL", baseUrl);
      baseURL = baseUrl;
    }
    pluginSettingsFactory.createSettingsForKey(userKey).put(PLUGIN_STORAGE_KEY + ".securityToken", securityTkn);
    securityToken = securityTkn;
    return "Settings saved successfully.";
  }
  

  @Path("/resources/saveAttachmentConfigurations")
  @POST
  @Produces(MediaType.APPLICATION_JSON)
  public String saveAttachmentConigurations(@Context final HttpServletRequest request) throws ClientProtocolException, IOException {
    String data = request.getParameter("data");
    String attachmentID = request.getParameter("attachmentID");
    System.out.println(data);
    System.out.println(attachmentID);
    pluginSettingsFactory.createSettingsForKey(attachmentID).put("" + attachmentID, data);
    return "Diagram configuration saved successfully.";
  }


  @Path("/resources/getAttachmentConfigurations")
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response getAttachmentConigurations(@Context final HttpServletRequest request) throws ClientProtocolException, IOException {
    String attachmentID = request.getParameter("attachmentID");
    System.out.println(attachmentID);
    return Response.ok(pluginSettingsFactory.createSettingsForKey(attachmentID).get("" + attachmentID)).build();
  }

  @Path("/resources/getPNG")
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public String getPNG(@Context final HttpServletRequest request) throws ClientProtocolException, IOException {
    String documentId = request.getParameter("documentId");
    System.out.println(documentId);
    String URL = baseURL + "/raw/" + documentId + "?version=v0.1&theme=light&format=png";
    HttpResponse pngResponse = restClient.getData(URL, securityToken);
    String pngString = EntityUtils.toString(pngResponse.getEntity());
    return pngString;
  }


  @Path("/resources/projects")
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public String getProjects(@Context final HttpServletRequest request) throws ClientProtocolException, IOException {
    String userkey = request.getParameter("userkey");
    System.out.println("User key is " + userkey);
    setParams(userkey);
    if(securityToken.equals("")){
      return "Invalid Security token";
    }
    String URL = baseURL + "/rest-api/projects";
    HttpResponse response = restClient.getData(URL, securityToken);
    Gson gson = new Gson();
    String json = EntityUtils.toString(response.getEntity());
    // ArrayList<Project> projectsList = gson.fromJson(json,new TypeToken<List<Project>>() {}.getType());
    return json;
  }

  @Path("/resources/diagrams")
  @GET
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public String getDiagrams(@Context final HttpServletRequest req) throws ClientProtocolException, IOException{
    String projectID = req.getParameter("projectId");
    String URL = baseURL + "/rest-api/projects/" + projectID + "/documents";
    HttpResponse response = restClient.getData(URL, securityToken);
    String json = EntityUtils.toString(response.getEntity());
    return json;
  }

  @Path("/resources/diagramInfo")
  @GET
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public String getDiagramData(@Context final HttpServletRequest req) throws ClientProtocolException, IOException{
    String docId = req.getParameter("docId");
    String URL = baseURL + "/rest-api/documents/" + docId;
    HttpResponse response = restClient.getData(URL, securityToken);
    String json = EntityUtils.toString(response.getEntity());
    return json;
  }

  public void setParams(String userKey){
    baseURL = pluginSettingsFactory.createGlobalSettings().get(PLUGIN_STORAGE_KEY + ".baseURL");
    securityToken = pluginSettingsFactory.createSettingsForKey(userKey).get(PLUGIN_STORAGE_KEY + ".securityToken");
  }
} 