package com.example.exception;

import javax.ws.rs.NotFoundException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import java.util.HashMap;
import java.util.Map;

@Provider
public class NotFoundExceptionMapper implements ExceptionMapper<NotFoundException> {
    
    @Context
    private UriInfo uriInfo;
    
    @Override
    public Response toResponse(NotFoundException exception) {
        Map<String, String> errorBody = new HashMap<>();
        errorBody.put("error", "Resource not found");
        errorBody.put("path", uriInfo.getPath());
        
        return Response.status(Response.Status.NOT_FOUND)
                      .entity(errorBody)
                      .build();
    }
} 