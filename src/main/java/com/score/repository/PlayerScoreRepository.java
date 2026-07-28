package com.score.repository;

import com.score.common.StageEnum;
import com.score.entity.PlayerScore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PlayerScoreRepository extends JpaRepository<PlayerScore, Long>,
        JpaSpecificationExecutor<PlayerScore> {

    // ====== 选手总分排行 ======
    @Query("SELECT ps.playerId, SUM(ps.totalScore) FROM PlayerScore ps " +
            "WHERE ps.seasonId = :seasonId " +
            "GROUP BY ps.playerId ORDER BY SUM(ps.totalScore) DESC")
    List<Object[]> findPlayerTotalScoreRanking(@Param("seasonId") Long seasonId);

    // ====== 战队总分排行 ======
    @Query("SELECT ps.teamId, SUM(ps.totalScore) FROM PlayerScore ps " +
            "WHERE ps.seasonId = :seasonId " +
            "GROUP BY ps.teamId ORDER BY SUM(ps.totalScore) DESC")
    List<Object[]> findTeamTotalScoreRanking(@Param("seasonId") Long seasonId);

    // ====== 战队均分排行 ======
    @Query("SELECT ps.teamId, AVG(ps.totalScore) FROM PlayerScore ps " +
            "WHERE ps.seasonId = :seasonId " +
            "GROUP BY ps.teamId ORDER BY AVG(ps.totalScore) DESC")
    List<Object[]> findTeamAverageScoreRanking(@Param("seasonId") Long seasonId);

    // ====== 赛季赛程（去重比赛） ======
    @Query("SELECT DISTINCT ps.stage, ps.roundNumber, ps.matchDate FROM PlayerScore ps " +
            "WHERE ps.seasonId = :seasonId " +
            "ORDER BY ps.matchDate ASC, ps.stage ASC, ps.roundNumber ASC")
    List<Object[]> findScheduleBySeasonId(@Param("seasonId") Long seasonId);

    // ====== 某场比赛的所有选手记录 ======
    List<PlayerScore> findBySeasonIdAndStageAndRoundNumberAndMatchDate(
            Long seasonId, StageEnum stage, Integer roundNumber, LocalDate matchDate);

    // ====== 分页查询 ======
    Page<PlayerScore> findBySeasonId(Long seasonId, Pageable pageable);

    Page<PlayerScore> findByPlayerId(Long playerId, Pageable pageable);

    Page<PlayerScore> findByTeamId(Long teamId, Pageable pageable);

    // ====== 检查重复（赛季+阶段+轮次+日期+选手） ======
    boolean existsBySeasonIdAndStageAndRoundNumberAndMatchDateAndPlayerId(
            Long seasonId, StageEnum stage, Integer roundNumber, LocalDate matchDate, Long playerId);
}
