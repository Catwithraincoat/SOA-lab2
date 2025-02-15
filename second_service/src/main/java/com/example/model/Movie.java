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
    
    @NotNull(message = "Название не может быть null")
    @NotEmpty(message = "Название не может быть пустым")
    private String name;
    
    @NotNull(message = "Координаты не могут быть null")
    @Valid
    private Coordinates coordinates;
    
    private Date creationDate;
    
    @Positive(message = "Количество Оскаров должно быть больше 0")
    private Long oscarsCount;
    
    private MovieGenre genre;
    private MpaaRating mpaaRating;
    
    @NotNull(message = "Имя режиссера не может быть null")
    @NotEmpty(message = "Имя режиссера не может быть пустым")
    private String directorName;
    
    private Person director;
} 