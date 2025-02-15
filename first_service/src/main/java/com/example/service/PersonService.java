package com.example.service;

import com.example.model.Person;
import com.example.model.Location;
import javax.enterprise.context.ApplicationScoped;
import javax.annotation.PostConstruct;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class PersonService {
    private static final Map<String, Person> directors = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        Person balabanov = new Person();
        balabanov.setName("Sergei Balabanov");
        balabanov.setHeight(180.0);
        balabanov.setWeight(100.0);
        balabanov.setPassportID("2024 123456");
        Location itmo = new Location();
        itmo.setX(100.1f);
        itmo.setY(100.1f);
        itmo.setName("ITMO University");
        balabanov.setLocation(itmo);
        directors.put(balabanov.getName(), balabanov);

        Person nolan = new Person();
        nolan.setName("Christopher Nolan");
        nolan.setHeight(181.5);
        nolan.setWeight(82.3);
        nolan.setPassportID("UK 789012");
        Location warner = new Location();
        warner.setX(34.1f);
        warner.setY(-118.3f);
        warner.setName("Warner Bros. Studios");
        nolan.setLocation(warner);
        directors.put(nolan.getName(), nolan);

        Person tarantino = new Person();
        tarantino.setName("Quentin Tarantino");
        tarantino.setHeight(188.0);
        tarantino.setWeight(95.2);
        tarantino.setPassportID("US 345678");
        Location hollywood = new Location();
        hollywood.setX(34.0f);
        hollywood.setY(-118.5f);
        hollywood.setName("Hollywood Hills");
        tarantino.setLocation(hollywood);
        directors.put(tarantino.getName(), tarantino);
    }

    public Person getDirector(String name) {
        return directors.get(name);
    }
} 