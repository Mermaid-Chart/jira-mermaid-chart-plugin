package com.plugin.mermaidchart.models;

import com.google.gson.annotations.SerializedName;

public class Project {
    @SerializedName("id")
    private String id;
    @SerializedName("title")
    private String title;
    @SerializedName("imageUrl")
    private String imageUrl;
    @SerializedName("teamID")
    private String teamID;
    @SerializedName("ownerID")
    private String ownerID;
    @SerializedName("craetedAt")
    private String createdAt;
    @SerializedName("updatedAt")
    private String updatedAt;

    public Project(){}

    public void setId(String id){
        this.id = id;
    }

    public void setTitle(String title){
        this.title = title;
    }

    public void setImageUrl(String imageUrl){
        this.imageUrl = imageUrl;
    }

    public void seTeamID(String teamID){
        this.teamID = teamID;
    }

    public void setOwnerID(String ownerID){
        this.ownerID = ownerID;
    }

    public void setCreatedAt(String createdAt){
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(String updatedAt){
        this.updatedAt = updatedAt;
    }

    public String getId(){
        return this.id;
    }
    
    public String getTitle(){
        return this.title;
    }

    public String getImageUrl(){
        return this.imageUrl;
    }

    public String getTeamID(){
        return this.teamID;
    }

    public String getOwnerID(){
        return this.ownerID;
    }

    public String getCreatedAt(){
        return this.createdAt;
    }

    public String getUpdatedAt(){
        return this.updatedAt;
    }

    public String toString(){
        System.out.println("title :"+title);
        return "id: " + id + " title:" +title;
    }
}
