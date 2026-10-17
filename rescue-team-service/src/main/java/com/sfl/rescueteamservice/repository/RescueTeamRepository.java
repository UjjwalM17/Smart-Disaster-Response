package com.sfl.rescueteamservice.repository;

import com.sfl.rescueteamservice.entity.RescueTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RescueTeamRepository extends JpaRepository<RescueTeam, Long> {

}