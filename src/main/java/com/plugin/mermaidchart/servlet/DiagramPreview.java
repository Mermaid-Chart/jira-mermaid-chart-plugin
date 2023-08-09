package com.plugin.mermaidchart.servlet;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.*;

import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import javax.inject.Inject;
import javax.servlet.annotation.WebServlet;
import org.springframework.beans.factory.annotation.Autowired;

import com.plugin.mermaidchart.services.RestResources;

@Scanned
@WebServlet("/diagrampreview")
public class DiagramPreview extends HttpServlet{

    @ComponentImport
  private final TemplateRenderer templateRenderer;

  @Inject
  public DiagramPreview(TemplateRenderer templateRenderer) {
      this.templateRenderer = templateRenderer;
  }

  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
        Map<String, Object> context = new HashMap<String, Object>();
        context.put("documentID", request.getParameter("docId"));
        context.put("title", request.getParameter("title"));
        context.put("projectID", request.getParameter("proId"));
        context.put("imgURL", "https://www.mermaidchart.com/raw/" + request.getParameter("docId") + "?version=v0.1&theme=light&format=png");

    response.setContentType("text/html;charset=utf-8");
    templateRenderer.render("/templates/diagramPreview.vm", context, response.getWriter());
  }
    
}
