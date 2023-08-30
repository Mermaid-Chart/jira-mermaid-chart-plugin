package com.plugin.mermaidchart.repositories;

import java.io.IOException;
import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.springframework.stereotype.Repository;

@Repository
public class RestClient {
    public HttpResponse getData(String URL, Object headerData) throws ClientProtocolException, IOException{
        HttpClient client = new DefaultHttpClient();
        HttpGet request = new HttpGet(URL);
        request.addHeader("Authorization", "Bearer " + headerData);
        HttpResponse response = client.execute(request);
        return response;
    }
}
