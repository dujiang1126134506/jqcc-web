package com.score.repository;

import com.score.entity.Player;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerRepository extends JpaRepository<Player, Long> {

    Optional<Player> findByNameAndTeamId(String name, Long teamId);

    List<Player> findByTeamId(Long teamId, Sort sort);

    List<Player> findByNameContaining(String keyword, Sort sort);

    List<Player> findByTeamIdAndNameContaining(Long teamId, String keyword, Sort sort);

    Page<Player> findByTeamId(Long teamId, Pageable pageable);

    Page<Player> findByNameContaining(String keyword, Pageable pageable);

    Page<Player> findByTeamIdAndNameContaining(Long teamId, String keyword, Pageable pageable);
}
