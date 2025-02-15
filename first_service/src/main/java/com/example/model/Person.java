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
    @NotNull(message = "Имя не может быть null")
    @NotEmpty(message = "Имя не может быть пустым")
    private String name;
    
    @Positive(message = "Рост должен быть больше 0")
    private double height;
    
    @NotNull(message = "Вес не может быть null")
    @Positive(message = "Вес должен быть больше 0")
    private Double weight;
    
    @Size(min = 5, max = 45, message = "Длина PassportID должна быть между 5 и 45 символами")
    @NotEmpty(message = "PassportID не может быть пустым")
    private String passportID;
    
    private Location location;
} 