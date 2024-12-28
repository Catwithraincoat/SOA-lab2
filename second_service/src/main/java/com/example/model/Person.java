package com.example.model;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class Person {
    private String name;
    private Double height;
    private Double weight;
    private String passportID;
    private Location location;
} 