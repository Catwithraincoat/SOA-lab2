package com.example.resource;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Path("{path:.*}")
public class CatchAllResource {
    
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response catchAll() {
        return Response.status(Response.Status.NOT_FOUND)
            .entity(Map.of("message", List.of(
                Map.of("inner_message", "Запрашиваемый ресурс не найден")
            )))
            .build();
    }
} 