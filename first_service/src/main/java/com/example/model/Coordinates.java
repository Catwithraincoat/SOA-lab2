package com.example.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

@Getter
@Setter
@NoArgsConstructor
public class Coordinates {
    @Max(value = 775, message = "X должно быть меньше или равно 775")
    private int x;
    
    @NotNull(message = "Y не может быть null")
    @Min(value = -531, message = "Y должно быть больше -531")
    private Double y;
} 