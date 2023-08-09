package com.plugin.mermaidchart.repositories;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;

import org.springframework.stereotype.Repository;

import java.util.*;
import com.google.gson.reflect.TypeToken; 
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.plugin.mermaidchart.models.Project;

import com.google.gson.Gson; 
import org.apache.http.util.EntityUtils;

@Repository
public class RestClient {

    private static Logger logger = LoggerFactory.getLogger(RestClient.class);

    public HttpResponse getData(String URL, Object headerData) throws ClientProtocolException, IOException{
        HttpClient client = new DefaultHttpClient();
        HttpGet request = new HttpGet(URL);
        request.addHeader("Authorization", "Bearer " + headerData);
        HttpResponse response = client.execute(request);
        return response;
    }
    
}
