package com.atlassian.tutorial.mcPlugin.settings;

import com.atlassian.sal.api.pluginsettings.*;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import java.io.*;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;

public class MyPluginConfigurationServlet extends HttpServlet {

  private final PluginSettingsFactory pluginSettingsFactory;
  private final VelocityEngine velocityEngine;

  // inject pluginSettingsFactory using constructor injection
  public MyPluginConfigurationServlet(
    PluginSettingsFactory pluginSettingsFactory,
    VelocityEngine velocityEngine
  ) {
    this.pluginSettingsFactory = pluginSettingsFactory;
    this.velocityEngine = velocityEngine;
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
    throws IOException {
    PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
    String baseURL = (String) settings.get("baseURL");
    String token = (String) settings.get("token");

    VelocityContext velocityContext = new VelocityContext();
    velocityContext.put("baseURL", baseURL);
    velocityContext.put("token", token);

    resp.setContentType("text/html");
    try {
      velocityEngine.mergeTemplate(
        "templates/config.vm",
        "UTF-8",
        velocityContext,
        resp.getWriter()
      );
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
    // code to save the settings
  }
}
