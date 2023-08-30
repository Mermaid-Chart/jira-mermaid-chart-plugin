package com.plugin.mermaidchart.servlet;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.*;
import javax.inject.Inject;
import javax.servlet.annotation.WebServlet;
import org.springframework.beans.factory.annotation.Autowired;

import com.plugin.mermaidchart.services.RestResources;

@Scanned
@WebServlet("/diagrampreview")
public class DiagramPreview extends HttpServlet{

  private static final String PLUGIN_STORAGE_KEY = "com.plugin.mermaidchart.models.UserConfigurations";

  @Autowired
  private RestResources restResources;

  @ComponentImport
  private final TemplateRenderer templateRenderer;

  @ComponentImport
  private final PluginSettingsFactory pluginSettingsFactory;

  @Inject
  public DiagramPreview(TemplateRenderer templateRenderer, PluginSettingsFactory pluginSettingsFactory) {
    this.templateRenderer = templateRenderer;
    this.pluginSettingsFactory = pluginSettingsFactory;
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    Map<String, Object> context = new HashMap<String, Object>();
    PluginSettings pluginSettingsAdmin = pluginSettingsFactory.createGlobalSettings();
    context.put("baseURL", pluginSettingsAdmin.get(PLUGIN_STORAGE_KEY + ".baseURL"));
    context.put("documentID", request.getParameter("docId"));
    context.put("title", request.getParameter("title"));
    context.put("projectID", request.getParameter("proId"));
    context.put("code", request.getParameter("code"));
    context.put("userkey", request.getParameter("userkey"));
    context.put("rest", restResources);
    context.put("imgURL", "https://www.mermaidchart.com/raw/"+request.getParameter("docId")+"?version=v0.1&theme=light&format=png");

    response.setContentType("text/html;charset=utf-8");
    templateRenderer.render("/templates/diagramPreview.vm", context, response.getWriter());
  }
    
}
