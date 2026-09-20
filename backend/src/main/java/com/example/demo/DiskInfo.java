package com.example.demo;

import jakarta.persistence.Embeddable;

@Embeddable
public class DiskInfo {
    private String mount;
    private Double usedPercent;

    public String getMount() { 
        return mount; 
    }
    
    public void setMount(String mount) { 
        this.mount = mount; 
    }

    public Double getUsedPercent() { 
        return usedPercent; 
    }

    public void setUsedPercent(Double usedPercent) { 
        this.usedPercent = usedPercent; 
    }
}