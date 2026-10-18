package com.sfl.incidentservice.repository;

import com.sfl.incidentservice.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    Optional<Incident> findByClientIncidentId(String clientIncidentId);

}