package com.example.exception;

import javax.json.bind.JsonbException;
import javax.ws.rs.ProcessingException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Provider
public class JsonbExceptionMapper implements ExceptionMapper<ProcessingException> {
    
    @Override
    public Response toResponse(ProcessingException exception) {
        List<Map<String, String>> errors = new ArrayList<>();
        Map<String, String> error = new HashMap<>();
        
        Throwable cause = exception.getCause();
        if (cause instanceof JsonbException) {
            String message = cause.getCause().getMessage();
            if (message.contains("MpaaRating")) {
                error.put("field", "mpaaRating");
                error.put("inner_message", "Must be one of: PG_13, R, NC_17");
            } else if (message.contains("MovieGenre")) {
                error.put("field", "genre");
                error.put("inner_message", "Must be one of: ACTION, ADVENTURE, SCIENCE_FICTION");
            } else {
                error.put("field", "unknown");
                error.put("inner_message", "Invalid enum value");
            }
        } else {
            error.put("field", "unknown");
            error.put("inner_message", "Invalid request format");
        }
        
        errors.add(error);
        Map<String, List<Map<String, String>>> response = new HashMap<>();
        response.put("message", errors);
        
        return Response.status(422)
                      .entity(response)
                      .build();
    }
} 