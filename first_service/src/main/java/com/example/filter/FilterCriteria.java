package com.example.filter;

import lombok.Getter;
import lombok.AllArgsConstructor;

@Getter
@AllArgsConstructor
public class FilterCriteria {
    private String field;
    private FilterOperator operator;
    private String value;
} 