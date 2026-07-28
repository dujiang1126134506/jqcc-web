package com.score.service.impl;

import com.score.common.StageEnum;
import com.score.dto.RankingVO;
import com.score.entity.Player;
import com.score.entity.PlayerScore;
import com.score.entity.Season;
import com.score.entity.Team;
import com.score.repository.PlayerRepository;
import com.score.repository.PlayerScoreRepository;
import com.score.repository.SeasonRepository;
import com.score.repository.TeamRepository;
import com.score.service.RankingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final PlayerScoreRepository playerScoreRepository;
    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final SeasonRepository seasonRepository;

    @Override
    public List<RankingVO.TeamRanking> getTeamTotalRanking(Long seasonId) {
        List<Object[]> raw = playerScoreRepository.findTeamTotalScoreRanking(seasonId);
        return buildTeamRanking(raw, true);
    }

    @Override
    public List<RankingVO.TeamRanking> getTeamAverageRanking(Long seasonId) {
        List<Object[]> raw = playerScoreRepository.findTeamAverageScoreRanking(seasonId);
        return buildTeamRanking(raw, false);
    }

    @Override
    public List<RankingVO.PlayerRanking> getPlayerTotalRanking(Long seasonId) {
        List<Object[]> raw = playerScoreRepository.findPlayerTotalScoreRanking(seasonId);
        if (raw == null || raw.isEmpty()) return Collections.emptyList();

        // 选手信息
        Set<Long> playerIds = raw.stream()
                .map(r -> ((Number) r[0]).longValue())
                .collect(Collectors.toSet());
        Map<Long, Player> playerMap = playerRepository.findAllById(playerIds).stream()
                .collect(Collectors.toMap(Player::getId, p -> p));

        // 战队信息
        Set<Long> teamIds = playerMap.values().stream()
                .map(Player::getTeamId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, Team> teamMap = teamRepository.findAllById(teamIds).stream()
                .collect(Collectors.toMap(Team::getId, t -> t));

        List<RankingVO.PlayerRanking> result = new ArrayList<>();
        int rank = 0;
        for (Object[] row : raw) {
            rank++;
            Long playerId = ((Number) row[0]).longValue();
            BigDecimal score = (BigDecimal) row[1];
            Player player = playerMap.get(playerId);
            Team team = player != null ? teamMap.get(player.getTeamId()) : null;

            result.add(RankingVO.PlayerRanking.builder()
                    .rank(rank)
                    .playerId(playerId)
                    .playerName(player != null ? player.getName() : "未知选手")
                    .playerAvatar(player != null ? player.getAvatar() : null)
                    .teamId(player != null ? player.getTeamId() : null)
                    .teamName(team != null ? team.getName() : null)
                    .score(score)
                    .build());
        }
        return result;
    }

    @Override
    public List<RankingVO.SeasonInfo> getSeasonList() {
        return seasonRepository.findAll().stream()
                .map(s -> RankingVO.SeasonInfo.builder()
                        .id(s.getId())
                        .name(s.getName())
                        .description(s.getDescription())
                        .currentSeason(s.getCurrentSeason())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<RankingVO.ScheduleItem> getSchedule(Long seasonId) {
        List<Object[]> raw = playerScoreRepository.findScheduleBySeasonId(seasonId);
        if (raw == null || raw.isEmpty()) return Collections.emptyList();

        List<RankingVO.ScheduleItem> result = new ArrayList<>();
        for (Object[] row : raw) {
            StageEnum stage = (StageEnum) row[0];
            Integer roundNum = (Integer) row[1];
            LocalDate date = (LocalDate) row[2];

            // 查询这场比赛涉及的战队
            List<PlayerScore> scores = playerScoreRepository
                    .findBySeasonIdAndStageAndRoundNumberAndMatchDate(seasonId, stage, roundNum, date);
            List<String> teams = scores.stream()
                    .map(PlayerScore::getTeamId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .map(tid -> teamRepository.findById(tid).map(Team::getName).orElse("未知战队"))
                    .collect(Collectors.toList());

            result.add(RankingVO.ScheduleItem.builder()
                    .stage(stage.name())
                    .stageLabel(stage.getLabel())
                    .roundNumber(roundNum)
                    .matchDate(date.toString())
                    .teams(teams)
                    .build());
        }
        return result;
    }

    @Override
    public Long getCurrentSeasonId() {
        return seasonRepository.findByCurrentSeasonTrue()
                .map(Season::getId)
                .orElse(null);
    }

    // ============== 私有方法 ==============

    private List<RankingVO.TeamRanking> buildTeamRanking(List<Object[]> raw, boolean isTotal) {
        if (raw == null || raw.isEmpty()) return Collections.emptyList();

        Set<Long> teamIds = raw.stream()
                .map(r -> ((Number) r[0]).longValue())
                .collect(Collectors.toSet());
        Map<Long, Team> teamMap = teamRepository.findAllById(teamIds).stream()
                .collect(Collectors.toMap(Team::getId, t -> t));

        List<RankingVO.TeamRanking> result = new ArrayList<>();
        int rank = 0;
        for (Object[] row : raw) {
            rank++;
            Long teamId = ((Number) row[0]).longValue();
            BigDecimal score;
            if (isTotal) {
                score = (BigDecimal) row[1];
            } else {
                // 平均分可能是 Double
                Object val = row[1];
                if (val instanceof BigDecimal) {
                    score = (BigDecimal) val;
                } else {
                    score = BigDecimal.valueOf(((Number) val).doubleValue());
                }
            }
            Team team = teamMap.get(teamId);
            result.add(RankingVO.TeamRanking.builder()
                    .rank(rank)
                    .teamId(teamId)
                    .teamName(team != null ? team.getName() : "未知战队")
                    .teamLogo(team != null ? team.getLogo() : null)
                    .score(score)
                    .build());
        }
        return result;
    }
}
