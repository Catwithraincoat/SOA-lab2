package com.example.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
public class Person {
    @NotNull(message = "Name cannot be null")
    @NotEmpty(message = "Name cannot be empty")
    private String name;
    
    @Positive(message = "Height must be greater than 0")
    private double height;
    
    @NotNull(message = "Weight cannot be null")
    @Positive(message = "Weight must be greater than 0")
    private Double weight;
    
    @Size(min = 5, max = 45, message = "PassportID length must be between 5 and 45 characters")
    @NotEmpty(message = "PassportID cannot be empty")
    private String passportID;
    
    private Location location;
} 