export interface Coordinates {
    x: number;
    y: number;
}

export interface Person {
    name: string;
    weight: number;
    passportID: string;
    height: number;
    location: {
        x: number;
        y: number;
        name: string;
    };
}

export interface Movie {
    id: number;
    name: string;
    coordinates: Coordinates;
    creationDate: string;
    oscarsCount: number | null;
    genre: 'DRAMA' | 'COMEDY' | 'TRAGEDY' | 'HORROR' | null;
    mpaaRating: 'G' | 'PG' | 'PG_13' | 'R' | 'NC_17' | null;
    director: Person;
}

export interface MovieFormData {
    name: string;
    coordinates: Coordinates;
    oscarsCount: number | null;
    genre: string | null;
    mpaaRating: string | null;
    directorName: string;
} 