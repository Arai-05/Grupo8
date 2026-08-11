package com.sistemaIncidencias.grupo8.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "incidencia")
public class Incidencia {

    @Id
    @Column(name = "idIncidencia")
    private Integer id;

    
}
