package com.plugin.mermaidchart.servlet;

import java.util.HashMap;
import java.util.Map;
import java.net.URI;

import java.io.IOException;
import javax.servlet.*;
import javax.servlet.http.HttpServlet;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import javax.inject.Inject;
import org.springframework.beans.factory.annotation.Autowired;

import com.plugin.mermaidchart.services.RestResources;

import com.atlassian.sal.api.auth.LoginUriProvider;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;

@Scanned
@WebServlet("/mermaidchartops")
public class MermaidChartOps extends HttpServlet {

  private static final String PLUGIN_STORAGE_KEY = "com.plugin.mermaidchart.models.UserConfigurations";
  private static String userkey;

  @Autowired
  private RestResources restResources;

  @ComponentImport
  private final UserManager userManager;
  
  @ComponentImport
  private final LoginUriProvider loginUriProvider;
  
  @ComponentImport
  private final TemplateRenderer templateRenderer;
  
  @ComponentImport
  private final PluginSettingsFactory pluginSettingsFactory;

  @Inject
  public MermaidChartOps(UserManager userManager, LoginUriProvider loginUriProvider, TemplateRenderer templateRenderer, PluginSettingsFactory pluginSettingsFactory) {
    this.userManager = userManager;
    this.loginUriProvider = loginUriProvider;
    this.templateRenderer = templateRenderer;
    this.pluginSettingsFactory = pluginSettingsFactory;
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    String username = userManager.getRemoteUsername(request);
    if(username == null){
      redirectToLogin(request, response);
      return;
    }
    String viewToRender, projectkey = request.getParameter("projectkey"), issuekey = request.getParameter("issuekey"), saved = request.getParameter("saved");
    userkey = request.getParameter("userkey");
    Map<String, Object> context;

    if (!userManager.isSystemAdmin(username)) {
      context = userConfigurations();
      viewToRender = "/templates/user.vm";
    } else {
      context = adminConfigurations();
      viewToRender = "/templates/admin.vm";
    }
    
    setDefaultValuesInPS(context);
    context.put("projectkey", projectkey);
    context.put("issuekey", issuekey);
    context.put("rest", restResources);
    if(saved != null && !saved.trim().isEmpty())
      context.put("saved", saved);
    response.setContentType("text/html;charset=utf-8");
    templateRenderer.render(viewToRender, context, response.getWriter());
  }

  public Map<String, Object> adminConfigurations() {
    Map<String, Object> context = new HashMap<String, Object>();
    PluginSettings pluginSettings = pluginSettingsFactory.createGlobalSettings();
    context.put("baseURL", pluginSettings.get(PLUGIN_STORAGE_KEY + ".baseURL"));
    PluginSettings pluginSettingsUser = pluginSettingsFactory.createSettingsForKey(userkey);
    context.put("securityToken", pluginSettingsUser.get(PLUGIN_STORAGE_KEY + ".securityToken"));
    return context;
  }

  public Map<String, Object> userConfigurations() {
    Map<String, Object> context = new HashMap<String, Object>();
    PluginSettings pluginSettings = pluginSettingsFactory.createSettingsForKey(userkey);
    context.put("securityToken", pluginSettings.get(PLUGIN_STORAGE_KEY + ".securityToken"));
    return context;
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    String username = userManager.getRemoteUsername(req);
    if (username == null || !userManager.isSystemAdmin(username)) {
      PluginSettings pluginSettings = pluginSettingsFactory.createSettingsForKey(userkey);
      pluginSettings.put(PLUGIN_STORAGE_KEY + ".securityToken", req.getParameter("securityToken"));
    } else {
      PluginSettings pluginSettings = pluginSettingsFactory.createGlobalSettings();
      pluginSettings.put(PLUGIN_STORAGE_KEY + ".baseURL", req.getParameter("baseURL"));
      PluginSettings pluginSettingsUser = pluginSettingsFactory.createSettingsForKey(userkey);
      pluginSettingsUser.put(PLUGIN_STORAGE_KEY + ".securityToken", req.getParameter("securityToken"));
    }
    String message = "success";
    resp.sendRedirect("mermaidchartops?userkey=" + userkey + "&saved=" + message);
  }

  private void setDefaultValuesInPS(Map<String, Object> context){
    PluginSettings pluginSettings = pluginSettingsFactory.createGlobalSettings();
    if(pluginSettings.get(PLUGIN_STORAGE_KEY + ".baseURL") == null) {
      String URL = "www.mermaidchart.com";
      pluginSettings.put(PLUGIN_STORAGE_KEY + ".baseURL", URL);
      context.put("baseURL", pluginSettings.get(PLUGIN_STORAGE_KEY + ".baseURL"));
    }

    PluginSettings pluginSettingsUser = pluginSettingsFactory.createSettingsForKey(userkey);
    if(pluginSettingsUser.get(PLUGIN_STORAGE_KEY + ".securityToken") == null) {
      String token = "";
      pluginSettingsUser.put(PLUGIN_STORAGE_KEY + ".securityToken", token);
      context.put("securityToken", pluginSettingsUser.get(PLUGIN_STORAGE_KEY + ".securityToken"));
    }
  }

  private void redirectToLogin(HttpServletRequest request, HttpServletResponse response) throws IOException{
    response.sendRedirect(loginUriProvider.getLoginUri(getUri(request)).toASCIIString());
  }

  private URI getUri(HttpServletRequest request){
    StringBuffer builder = request.getRequestURL();
    if (request.getQueryString() != null) {
      builder.append("?");
      builder.append(request.getQueryString());
    }
    return URI.create(builder.toString());
  }
}