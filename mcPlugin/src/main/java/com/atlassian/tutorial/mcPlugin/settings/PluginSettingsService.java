package com.atlassian.tutorial.mcPlugin.settings;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;

public class PluginSettingsService {
    private static final String PLUGIN_STORAGE_KEY = "com.mycompany.myplugin";
    private static final String BASE_URL = PLUGIN_STORAGE_KEY + ".baseURL";
    private static final String TOKEN = PLUGIN_STORAGE_KEY + ".token";

    private final PluginSettingsFactory pluginSettingsFactory;

    public PluginSettingsService(PluginSettingsFactory pluginSettingsFactory) {
        this.pluginSettingsFactory = pluginSettingsFactory;
    }

    public String getBaseURL() {
        return (String) getPluginSettings().get(BASE_URL);
    }

    public void setBaseURL(String baseURL) {
        getPluginSettings().put(BASE_URL, baseURL);
    }

    public String getToken() {
        return (String) getPluginSettings().get(TOKEN);
    }

    public void setToken(String token) {
        getPluginSettings().put(TOKEN, token);
    }

    private PluginSettings getPluginSettings() {
        return pluginSettingsFactory.createSettingsForKey(PLUGIN_STORAGE_KEY);
    }
}
