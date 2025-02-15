package com.example.config;

import com.example.resource.OscarResource;
import com.example.resource.CatchAllResource;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;
import java.util.HashSet;
import java.util.Set;

@ApplicationPath("/api")
public class JaxRsApplication extends Application {
    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> classes = new HashSet<>();
        classes.add(OscarResource.class);
        classes.add(CatchAllResource.class);
        return classes;
    }
} 