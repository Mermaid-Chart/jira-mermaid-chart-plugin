package com.plugin.mermaidchart.servlet;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.sal.api.user.UserManager;
import com.atlassian.sal.api.auth.LoginUriProvider;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.net.URI;
import javax.servlet.*;
import javax.inject.Inject;
import javax.servlet.annotation.WebServlet;
import org.springframework.beans.factory.annotation.Autowired;

import com.plugin.mermaidchart.services.RestResources;

@Scanned
@WebServlet("/resourceslisting")
public class ResourcesListing extends HttpServlet{

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
  public ResourcesListing(UserManager userManager, LoginUriProvider loginUriProvider, TemplateRenderer templateRenderer, PluginSettingsFactory pluginSettingsFactory) {
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
    String viewToRender;
    if (!userManager.isSystemAdmin(username)) {
      viewToRender = "/templates/mermaidChartUser.vm";
    } else {
      viewToRender = "/templates/mermaidChartAdmin.vm";
    }

    String projectkey = request.getParameter("projectkey");
    String issuekey = request.getParameter("issuekey");
    userkey = request.getParameter("userkey");
    Map<String, Object> context = new HashMap<String, Object>();
    PluginSettings pluginSettings = pluginSettingsFactory.createSettingsForKey(userkey);
    PluginSettings pluginSettingsAdmin = pluginSettingsFactory.createGlobalSettings();
    context.put("securityToken", pluginSettings.get(PLUGIN_STORAGE_KEY + ".securityToken"));
    context.put("baseURL", pluginSettingsAdmin.get(PLUGIN_STORAGE_KEY + ".baseURL"));
    context.put("projectkey", projectkey);
    context.put("issuekey", issuekey);
    context.put("userkey", userkey);
    context.put("rest", restResources);

    response.setContentType("text/html;charset=utf-8");
    templateRenderer.render(viewToRender, context, response.getWriter());
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
