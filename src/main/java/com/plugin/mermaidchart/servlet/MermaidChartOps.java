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
    resp.setContentType("text/html");
    resp.getWriter().write("<html><body>Hello from MermaidChart</body></html>");
  }
}
