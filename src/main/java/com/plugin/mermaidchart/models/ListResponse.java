package com.plugin.mermaidchart.models;

import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlElement;
import java.util.*;
import com.plugin.mermaidchart.models.Diagram;

@XmlRootElement
public class ListResponse {

    
    private List<Diagram> list;

    @XmlElement
    public List<Diagram> getList() {
        return list;
    }

    public void setList(List<Diagram> list) {
        this.list = list;
    }

}
