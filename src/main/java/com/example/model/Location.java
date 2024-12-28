package com.example.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
public class Location {
    private float x;
    
    @NotNull(message = "Y cannot be null")
    private Float y;
    
    private String name;
} 