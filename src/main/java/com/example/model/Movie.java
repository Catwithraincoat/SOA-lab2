package com.example.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.NotEmpty;
import javax.validation.Valid;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
public class Movie {
    private long id;
    
    @NotNull(message = "Name cannot be null")
    @NotEmpty(message = "Name cannot be empty")
    private String name;
    
    @NotNull(message = "Coordinates cannot be null")
    @Valid
    private Coordinates coordinates;
    
    private Date creationDate;
    
    @Positive(message = "Oscar count must be greater than 0")
    private Long oscarsCount;
    
    private MovieGenre genre;
    private MpaaRating mpaaRating;
    
    @NotNull(message = "Director name cannot be null")
    @NotEmpty(message = "Director name cannot be empty")
    private String directorName;
    
    private Person director;
} 