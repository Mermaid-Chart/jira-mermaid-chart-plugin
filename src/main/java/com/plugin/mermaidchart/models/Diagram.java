package com.plugin.mermaidchart.models;

import com.google.gson.annotations.SerializedName;
import com.google.gson.annotations.Expose;
import java.util.ArrayList;

public class Diagram {

    @Expose
    @SerializedName("id")
    private String id;
    @SerializedName("documentType")
    private String documentType;
    @SerializedName("projectID")
    private String projectID;
    @Expose
    @SerializedName("title")
    private String title;
    @SerializedName("externalID")
    private String externalID;
    @SerializedName("isPublic")
    private boolean isPublic;
    @SerializedName("metaData")
    private MetaData metaData;
    @SerializedName("createdAt")
    private String createdAt;
    @SerializedName("updatedAt")
    private String updatedAt;
    @SerializedName("major")
    private int major;
    @SerializedName("minor")
    private int minor;
    @SerializedName("updatedBy")
    private String updatedBy;
    @SerializedName("summary")
    private String summary;
    @SerializedName("code")
    private String code;
    @SerializedName("yDoc")
    private String yDoc;
    @SerializedName("svgCode")
    private String svgCode;
    @SerializedName("svgCodeDark")
    private String svgCodeDark;
    @SerializedName("workflowStateID")
    private String workflowStateID;
    @SerializedName("documentID")
    private String documentID;


    public Diagram(){
    }

    public void setId(String id){
        this.id = id;
    }

    public void setDocumentType(String documentType){
        this.documentType = documentType;
    }

    public void setProjectID(String projectID){
        this.projectID = projectID;
    }

    public void setTitle(String title){
        this.title = title;
    }

    public void setExternalID(String externalID){
        this.externalID = externalID;
    }

    public void setIsPublic(boolean isPublic){
        this.isPublic = isPublic;
    }

    public void setMetaData(MetaData metaData){
        this.metaData = metaData;
    }

    public void setCreatedAt(String createdAt){
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(String updatedAt){
        this.updatedAt = updatedAt;
    }

    public void setMajor(int major){
        this.major = major;
    }

    public void setMinor(int minor){
        this.minor = minor;
    }

    public void setUpdatedBy(String updatedBy){
        this.updatedBy = updatedBy;
    }

    public void setSummary(String summary){
        this.summary = summary;
    }

    public void setCode(String code){
        this.code = code;
    }

    public void setYDoc(String yDoc){
        this.yDoc = yDoc;
    }

    public void setSvgCode(String svgCode){
        this.svgCode = svgCode;
    }

    public void setSvgCodeDark(String svgCodeDark){
        this.svgCodeDark = svgCodeDark;
    }

    public void setWorkflowStateID(String workflowStateID){
        this.workflowStateID = workflowStateID;
    }

    public void setDocumentID(String documentID){
        this.documentID = documentID;
    }


    public String getId(){
        return this.id;
    }

    public String getDocumentType(){
        return this.documentType;
    }

    public String getProjectID(){
        return this.projectID;
    }

    public String getTitle(){
        return this.title;
    }

    public String getExternalID(){
        return this.externalID;
    }

    public boolean getIsPublic(){
        return this.isPublic;
    }

    public MetaData getMetaData(){
        return this.metaData;
    }

    public String getCreatedAt(){
        return this.createdAt;
    }

    public String getUpdatedAt(){
        return this.updatedAt;
    }

    public int getMajor(){
        return this.major;
    }

    public int getMinor(){
        return this.minor;
    }

    public String getUpdatedBy(){
        return this.updatedBy;
    }

    public String getSummary(){
        return this.summary;
    }

    public String getCode(){
        return this.code;
    }

    public String getYDoc(){
        return this.yDoc;
    }

    public String getSvgCode(){
        return this.svgCode;
    }

    public String getSvgCodeDark(){
        return this.svgCodeDark;
    }

    public String getWorkflowStateID(){
        return this.workflowStateID;
    }

    public String getDocumentID(){
        return this.documentID;
    }

    public String toString(){
        System.out.println("Diagram title : " + title);
        return title;
    }
    
}

class MetaData {

    public MetaData(){}
    public String toString(){
        System.out.println("MetaData toString() called...");
        return "";
    }
}