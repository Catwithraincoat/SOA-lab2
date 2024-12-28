package com.example.config;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;
import java.util.HashSet;
import java.util.Set;

import com.example.resource.MovieResource;
import com.example.resource.EnumResource;
import com.example.exception.ValidationExceptionMapper;
import com.example.exception.JsonbExceptionMapper;

@ApplicationPath("/api")
public class JaxRsApplication extends Application {
    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> classes = new HashSet<>();
        classes.add(MovieResource.class);
        classes.add(EnumResource.class);
        classes.add(ValidationExceptionMapper.class);
        classes.add(JsonbExceptionMapper.class);
        return classes;
    }
} 