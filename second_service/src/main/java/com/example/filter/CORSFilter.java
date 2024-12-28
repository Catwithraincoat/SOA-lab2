package com.example.filter;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.container.PreMatching;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;

@Provider
@PreMatching
public class CORSFilter implements ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
        // Для preflight запросов
        if (requestContext.getMethod().equalsIgnoreCase("OPTIONS")) {
            responseContext.setStatus(Response.Status.OK.getStatusCode());
            responseContext.getHeaders().add("Access-Control-Allow-Origin", "*");
            responseContext.getHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH");
            responseContext.getHeaders().add("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With");
            responseContext.getHeaders().add("Access-Control-Max-Age", "1209600");
            return;
        }

        // Для обычных запросов
        responseContext.getHeaders().add("Access-Control-Allow-Origin", "*");
        responseContext.getHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH");
        responseContext.getHeaders().add("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With");
        responseContext.getHeaders().add("Access-Control-Expose-Headers", "Content-Type, Authorization, X-Requested-With");
    }
} 