package com.plugin.mermaidchart.servlet;

import java.io.IOException;
import javax.servlet.*;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MermaidChartOps extends HttpServlet {

  private static final Logger log = LoggerFactory.getLogger(
    MermaidChartOps.class
  );

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException {
    // TODO: Replace with rendering of page and better styling
    resp.setContentType("text/html");
    resp
      .getWriter()
      .write(
        "<html><body>" +
        "<form method='post'>" +
        "Base URL: <input type='text' name='baseUrl'><br>" +
        "Token: <input type='text' name='token'><br>" +
        "<input type='submit' value='Submit'>" +
        "</form>" +
        "</body></html>"
      );
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException {
    String baseUrl = req.getParameter("baseUrl");
    String token = req.getParameter("token");
    // Store these values somewhere, like in a database
    // ...
  }
}
