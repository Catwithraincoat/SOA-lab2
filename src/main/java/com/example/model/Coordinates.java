package com.example.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Max;
import javax.validation.constraints.DecimalMin;

@Getter
@Setter
@NoArgsConstructor
public class Coordinates {
    @Max(value = 775, message = "X must be less than or equal to 775")
    private int x;
    
    @NotNull(message = "Y cannot be null")
    @DecimalMin(value = "-531", message = "Y must be greater than -531")
    private Float y;
} 