package com.example.resource;

import com.example.model.MpaaRating;
import com.example.model.MovieGenre;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import java.util.Arrays;
import java.util.List;

@Path("/")
@Produces(MediaType.APPLICATION_JSON)
public class EnumResource {

    @GET
    @Path("/mpaaRatings")
    public List<MpaaRating> getMpaaRatings() {
        return Arrays.asList(MpaaRating.values());
    }

    @GET
    @Path("/movieGenres")
    public List<MovieGenre> getMovieGenres() {
        return Arrays.asList(MovieGenre.values());
    }
} 