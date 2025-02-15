package com.example.exception;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Provider
public class ValidationExceptionMapper implements ExceptionMapper<ConstraintViolationException> {
    
    @Override
    public Response toResponse(ConstraintViolationException exception) {
        List<Map<String, String>> errors = new ArrayList<>();
        
        for (ConstraintViolation<?> violation : exception.getConstraintViolations()) {
            Map<String, String> error = new HashMap<>();
            String field = violation.getPropertyPath().toString();
            // Убираем префикс метода из пути
            field = field.substring(field.lastIndexOf('.') + 1);
            error.put("field", field);
            error.put("inner_message", violation.getMessage());
            errors.add(error);
        }
        
        Map<String, List<Map<String, String>>> response = new HashMap<>();
        response.put("message", errors);
        
        return Response.status(422)
                      .entity(response)
                      .build();
    }
} 