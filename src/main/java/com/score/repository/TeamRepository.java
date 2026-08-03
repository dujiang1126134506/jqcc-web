package com.score.repository;

import com.score.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    /** 按赛季查询所有战队 */
    List<Team> findBySeasonId(Long seasonId);

    /** 按赛季+名称查找（同一赛季战队名唯一） */
    Optional<Team> findBySeasonIdAndName(Long seasonId, String name);

    /** 按名称查找（兼容旧逻辑，取第一条） */
    Optional<Team> findByName(String name);

    /** 按赛季和名称模糊搜索 */
    List<Team> findBySeasonIdAndNameContaining(Long seasonId, String keyword);
}
