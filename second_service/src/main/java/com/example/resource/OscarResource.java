package com.example.resource;

import com.example.service.FirstServiceClient;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Collections;

@Path("/oscar")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OscarResource {
    
    @Inject
    private FirstServiceClient firstServiceClient;

    @GET
    @Path("/movies/get-loosers")
    public Response getMoviesWithoutOscars() {
        Response response = firstServiceClient.getTarget()
                .path("/movies")
                .queryParam("filter", "oscarsCount[eq]=null")
                .request()
                .get();
        
        // Преобразуем ответ в формат согласно спецификации
        List<?> movies = response.readEntity(List.class);
        return Response.ok(Map.of("items", movies)).build();
    }

    @GET
    @Path("/directors/get-loosers")
    public Response getDirectorsWithoutOscars() {
        Response response = firstServiceClient.getTarget()
                .path("/movies")
                .request()
                .get();
        
        // Получаем все фильмы и фильтруем режиссеров, у которых нет фильмов с оскарами
        List<Map<String, Object>> movies = response.readEntity(List.class);
        
        List<Map<String, String>> directorNames = movies.stream()
                .collect(Collectors.groupingBy(
                        movie -> ((Map<String, Object>)movie.get("director")).get("name").toString(),
                        Collectors.mapping(
                                movie -> movie.get("oscarsCount"),
                                Collectors.maxBy((o1, o2) -> {
                                    if (o1 == null && o2 == null) return 0;
                                    if (o1 == null) return -1;
                                    if (o2 == null) return 1;
                                    return ((Number)o1).intValue() - ((Number)o2).intValue();
                                })
                        )
                ))
                .entrySet()
                .stream()
                .filter(entry -> !entry.getValue().isPresent() || 
                               entry.getValue().get() == null || 
                               ((Number)entry.getValue().get()).intValue() == 0)
                .map(entry -> Collections.singletonMap("directorName", entry.getKey()))
                .collect(Collectors.toList());

        return Response.ok(Map.of("items", directorNames)).build();
    }
} 