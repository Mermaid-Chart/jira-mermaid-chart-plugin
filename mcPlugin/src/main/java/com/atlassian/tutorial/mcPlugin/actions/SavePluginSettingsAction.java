package com.atlassian.tutorial.mcPlugin.actions;
import com.atlassian.jira.web.action.JiraWebActionSupport;
import com.atlassian.tutorial.mcPlugin.settings.PluginSettingsService;

public class SavePluginSettingsAction extends JiraWebActionSupport {
    private final PluginSettingsService pluginSettingsService;

    private String baseURL;
    private String token;

    public SavePluginSettingsAction(PluginSettingsService pluginSettingsService) {
        this.pluginSettingsService = pluginSettingsService;
    }

    @Override
    protected String doExecute() throws Exception {
        pluginSettingsService.setBaseURL(baseURL);
        pluginSettingsService.setToken(token);

        return SUCCESS;
    }

    public String getBaseUrl() {
        return pluginSettingsService.getBaseURL();
    }

    public void setBaseUrl(String baseURL) {
        this.baseURL = baseURL;
    }

    public String getToken() {
        return pluginSettingsService.getToken();
    }

    public void setToken(String token) {
        this.token = token;
    }
}
