package com.example.resource;

import com.example.model.*;
import com.example.service.PersonService;
import com.example.filter.FilterCriteria;
import com.example.filter.FilterOperator;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Date;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Path("/")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MovieResource {
    private static final Map<Long, Movie> movies = new ConcurrentHashMap<>();
    private static long currentId = 1;

    @Inject
    private PersonService personService;

    @POST
    @Path("/movie")
    public Response createMovie(@NotNull @Valid Movie movie) {
        Person director = personService.getDirector(movie.getDirectorName());
        if (director == null) {
            return Response.status(422)
                    .entity(Map.of("message", List.of(
                            Map.of("field", "directorName",
                                  "inner_message", "Director not found"))))
                    .build();
        }
        
        movie.setDirector(director);
        movie.setId(currentId++);
        movie.setCreationDate(new Date());
        movies.put(movie.getId(), movie);
        return Response.status(Response.Status.NO_CONTENT).build();
    }

    @GET
    @Path("/movies/{id}")
    public Response getMovie(@PathParam("id") Long id) {
        Movie movie = movies.get(id);
        if (movie == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(movie).build();
    }

    @DELETE
    @Path("/movies/{id}")
    public Response deleteMovie(@PathParam("id") Long id) {
        if (!movies.containsKey(id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        movies.remove(id);
        return Response.status(Response.Status.NO_CONTENT).build();
    }

    @PATCH
    @Path("/movies/{id}")
    public Response updateMovie(@PathParam("id") Long id, @NotNull @Valid Movie movie) {
        if (!movies.containsKey(id)) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Person director = personService.getDirector(movie.getDirectorName());
        if (director == null) {
            return Response.status(422)
                    .entity(Map.of("message", List.of(
                            Map.of("field", "directorName",
                                  "inner_message", "Director not found"))))
                    .build();
        }
        
        movie.setDirector(director);
        movie.setId(id);
        movie.setCreationDate(movies.get(id).getCreationDate());
        movies.put(id, movie);
        return Response.status(Response.Status.NO_CONTENT).build();
    }

    @GET
    @Path("/movies")
    public Response getMovies(
            @QueryParam("sort") List<String> sort,
            @QueryParam("filter") List<String> filter,
            @QueryParam("page") @DefaultValue("1") int page,
            @QueryParam("pageSize") @DefaultValue("10") int pageSize) {
        
        List<Movie> movieList = new ArrayList<>(movies.values());

        // Проверяем валидность параметров пагинации
        if (page < 1 || pageSize < 1) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("message", List.of(
                            Map.of("field", "pagination",
                                  "inner_message", "Page and pageSize must be greater than 0"))))
                    .build();
        }

        // Применяем фильтрацию
        if (filter != null && !filter.isEmpty()) {
            List<FilterCriteria> filterCriteria = parseFilterCriteria(filter);
            movieList = movieList.stream()
                    .filter(movie -> matchesAllCriteria(movie, filterCriteria))
                    .collect(Collectors.toList());
        }

        // Применяем сортировку
        if (sort != null && !sort.isEmpty()) {
            // Проверяем на дублирование полей сортировки
            Set<String> normalizedFields = new HashSet<>();
            for (String field : sort) {
                String normalizedField = field.startsWith("-") ? field.substring(1) : field;
                if (!normalizedFields.add(normalizedField)) {
                    return Response.status(400)
                            .entity(Map.of("message", List.of(
                                    Map.of("field", "sort",
                                          "inner_message", "Duplicate sort field: " + normalizedField))))
                            .build();
                }
            }

            // Создаем компаратор для сортировки
            Comparator<Movie> comparator = null;
            for (String sortField : sort) {
                boolean ascending = !sortField.startsWith("-");
                String field = ascending ? sortField : sortField.substring(1);
                
                Comparator<Movie> fieldComparator = getComparator(field);
                if (!ascending) {
                    fieldComparator = fieldComparator.reversed();
                }
                
                comparator = comparator == null ? fieldComparator : comparator.thenComparing(fieldComparator);
            }
            
            if (comparator != null) {
                movieList.sort(comparator);
            }
        }

        // Применяем пагинацию
        int fromIndex = (page - 1) * pageSize;
        if (fromIndex >= movieList.size()) {
            return Response.ok(Collections.emptyList()).build();
        }
        
        int toIndex = Math.min(fromIndex + pageSize, movieList.size());
        return Response.ok(movieList.subList(fromIndex, toIndex)).build();
    }

    private Comparator<Movie> getComparator(String field) {
        switch (field) {
            case "id":
                return Comparator.comparingLong(Movie::getId);
            case "name":
                return Comparator.comparing(Movie::getName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "creationDate":
                return Comparator.comparing(Movie::getCreationDate, Comparator.nullsLast(Comparator.naturalOrder()));
            case "coordinates.x":
                return Comparator.comparingInt(m -> m.getCoordinates().getX());
            case "coordinates.y":
                return Comparator.comparing(m -> m.getCoordinates().getY(), Comparator.nullsLast(Comparator.naturalOrder()));
            case "oscarsCount":
                return Comparator.comparing(Movie::getOscarsCount, Comparator.nullsLast(Comparator.naturalOrder()));
            case "genre":
                return Comparator.comparing(m -> m.getGenre() != null ? m.getGenre().name() : "", 
                                         Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "mpaaRating":
                return Comparator.comparing(m -> m.getMpaaRating() != null ? m.getMpaaRating().name() : "", 
                                         Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "director.name":
                return Comparator.comparing(m -> m.getDirector().getName(), 
                                         Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "director.weight":
                return Comparator.comparing(m -> m.getDirector().getWeight(), 
                                         Comparator.nullsLast(Comparator.naturalOrder()));
            case "director.passportID":
                return Comparator.comparing(m -> m.getDirector().getPassportID(), 
                                         Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "director.height":
                return Comparator.comparing(m -> m.getDirector().getHeight(), 
                                         Comparator.nullsLast(Comparator.naturalOrder()));
            case "director.location.name":
                return Comparator.comparing(m -> m.getDirector().getLocation().getName(), 
                                         Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
            case "director.location.x":
                return Comparator.comparing(m -> m.getDirector().getLocation().getX(), 
                                         Comparator.nullsLast(Comparator.naturalOrder()));
            case "director.location.y":
                return Comparator.comparing(m -> m.getDirector().getLocation().getY(), 
                                         Comparator.nullsLast(Comparator.naturalOrder()));
            default:
                return (m1, m2) -> 0;
        }
    }

    @GET
    @Path("/movies/count")
    public Response getMoviesCount(@QueryParam("mpaaRating") MpaaRating mpaaRating) {
        long count = movies.values().stream()
                .filter(m -> m.getMpaaRating() != null && m.getMpaaRating().compareTo(mpaaRating) < 0)
                .count();
        return Response.ok(Map.of("count", count)).build();
    }

    private List<FilterCriteria> parseFilterCriteria(List<String> filters) {
        List<FilterCriteria> criteria = new ArrayList<>();
        
        for (String filter : filters) {
            // Ищем индексы специальных символов
            int bracketStart = filter.indexOf('[');
            int bracketEnd = filter.indexOf(']');
            int equalSign = filter.indexOf('=', bracketEnd);
            
            if (bracketStart > 0 && bracketEnd > bracketStart && equalSign > bracketEnd) {
                String field = filter.substring(0, bracketStart);
                String operator = filter.substring(bracketStart + 1, bracketEnd);
                String value = filter.substring(equalSign + 1);
                
                try {
                    FilterOperator filterOperator = FilterOperator.valueOf(operator.toUpperCase());
                    criteria.add(new FilterCriteria(field, filterOperator, value));
                } catch (IllegalArgumentException e) {
                    // Игнорируем неправильные операторы
                }
            }
        }
        
        return criteria;
    }

    private boolean matchesAllCriteria(Movie movie, List<FilterCriteria> criteria) {
        return criteria.stream().allMatch(c -> matchesCriterion(movie, c));
    }

    private boolean matchesCriterion(Movie movie, FilterCriteria criteria) {
        Comparable value = getFieldValue(movie, criteria.getField());
        String criteriaValue = criteria.getValue();
        
        // Специальная обработка для null значений
        if ("null".equalsIgnoreCase(criteriaValue)) {
            switch (criteria.getOperator()) {
                case EQ:
                    return value == null;
                case NE:
                    return value != null;
                default:
                    return false;
            }
        }
        
        // Если значение null, а критерий не null, то сравнение невозможно
        if (value == null) {
            return false;
        }

        // Преобразуем значение критерия в соответствующий тип
        Comparable parsedValue = parseValue(criteriaValue, value.getClass());
        if (parsedValue == null) {
            return false;
        }

        switch (criteria.getOperator()) {
            case EQ:
                return value.compareTo(parsedValue) == 0;
            case NE:
                return value.compareTo(parsedValue) != 0;
            case GT:
                return value.compareTo(parsedValue) > 0;
            case LT:
                return value.compareTo(parsedValue) < 0;
            case LTE:
                return value.compareTo(parsedValue) <= 0;
            case GTE:
                return value.compareTo(parsedValue) >= 0;
            default:
                return false;
        }
    }

    @SuppressWarnings("unchecked")
    private Comparable getFieldValue(Movie movie, String field) {
        switch (field) {
            case "id":
                return movie.getId();
            case "name":
                return movie.getName();
            case "creationDate":
                return movie.getCreationDate();
            case "coordinates.x":
                return movie.getCoordinates().getX();
            case "coordinates.y":
                return movie.getCoordinates().getY();
            case "oscarsCount":
                return movie.getOscarsCount();
            case "genre":
                return movie.getGenre() != null ? movie.getGenre().name() : null;
            case "mpaaRating":
                return movie.getMpaaRating() != null ? movie.getMpaaRating().name() : null;
            case "director.name":
                return movie.getDirector().getName();
            case "director.weight":
                return movie.getDirector().getWeight();
            case "director.passportID":
                return movie.getDirector().getPassportID();
            case "director.height":
                return movie.getDirector().getHeight();
            case "director.location.name":
                return movie.getDirector().getLocation().getName();
            case "director.location.x":
                return movie.getDirector().getLocation().getX();
            case "director.location.y":
                return movie.getDirector().getLocation().getY();
            default:
                return null;
        }
    }

    private Comparable parseValue(String value, Class<?> targetType) {
        try {
            if (targetType == Long.class) {
                return Long.parseLong(value);
            } else if (targetType == Integer.class) {
                return Integer.parseInt(value);
            } else if (targetType == Float.class) {
                return Float.parseFloat(value);
            } else if (targetType == Double.class) {
                return Double.parseDouble(value);
            } else if (targetType == Date.class) {
                return new Date(Long.parseLong(value));
            } else if (targetType.isEnum()) {
                return value;
            }
            return value;
        } catch (Exception e) {
            return null;
        }
    }
} 