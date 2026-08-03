package com.score.service.impl;

import com.score.entity.Player;
import com.score.entity.Season;
import com.score.entity.Team;
import com.score.repository.PlayerRepository;
import com.score.repository.SeasonRepository;
import com.score.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 数据解析辅助服务
 * 导入/新增时通过名称解析赛季/战队/选手ID，找不到则自动创建
 * （用于导入及小程序端扁平结构接口，避免依赖预配置的ID）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DataResolveService {

    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;
    private final SeasonRepository seasonRepository;

    /** 简单缓存：名称 -> ID（导入时减少查询） */
    private final Map<String, Long> teamCache = new ConcurrentHashMap<>();
    private final Map<String, Long> playerCache = new ConcurrentHashMap<>();
    private final Map<String, Long> seasonCache = new ConcurrentHashMap<>();

    /**
     * 解析战队ID（按赛季+名称查找，找不到则创建）
     * @param seasonId 赛季ID
     * @param teamName 战队名称
     */
    @Transactional(rollbackFor = Exception.class)
    public Long resolveTeamId(Long seasonId, String teamName) {
        if (seasonId == null) {
            throw new IllegalArgumentException("赛季ID不能为空");
        }
        if (teamName == null || teamName.trim().isEmpty()) {
            throw new IllegalArgumentException("战队名称不能为空");
        }
        String key = seasonId + ":" + teamName.trim();
        if (teamCache.containsKey(key)) {
            return teamCache.get(key);
        }
        // 从数据库查（按赛季+名称）
        Team team = teamRepository.findBySeasonIdAndName(seasonId, teamName.trim()).orElse(null);

        if (team == null) {
            // 自动创建战队
            team = new Team();
            team.setSeasonId(seasonId);
            team.setName(teamName.trim());
            team = teamRepository.save(team);
            log.info("导入时自动创建战队: {} (赛季ID={})", teamName, seasonId);
        }
        teamCache.put(key, team.getId());
        return team.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public Long resolvePlayerId(String playerName, Long teamId) {
        if (playerName == null || playerName.trim().isEmpty()) {
            throw new IllegalArgumentException("选手名称不能为空");
        }
        String key = teamId + ":" + playerName.trim();
        if (playerCache.containsKey(key)) {
            return playerCache.get(key);
        }
        Player player = playerRepository.findByNameAndTeamId(playerName.trim(), teamId).orElse(null);

        if (player == null) {
            player = new Player();
            player.setName(playerName.trim());
            player.setTeamId(teamId);
            player = playerRepository.save(player);
            log.info("导入时自动创建选手: {} (战队ID={})", playerName, teamId);
        }
        playerCache.put(key, player.getId());
        return player.getId();
    }

    /**
     * 解析战队ID，并在提供 logo 且战队当前无 logo 时补充
     */
    @Transactional(rollbackFor = Exception.class)
    public Long resolveTeamId(Long seasonId, String teamName, String teamLogo) {
        Long teamId = resolveTeamId(seasonId, teamName);
        if (teamLogo != null && !teamLogo.isBlank()) {
            teamRepository.findById(teamId).ifPresent(team -> {
                if (team.getLogo() == null || team.getLogo().isBlank()) {
                    team.setLogo(teamLogo);
                    teamRepository.save(team);
                }
            });
        }
        return teamId;
    }

    /**
     * 解析选手ID，并在提供头像且选手当前无头像时补充
     */
    @Transactional(rollbackFor = Exception.class)
    public Long resolvePlayerId(String playerName, Long teamId, String playerAvatar) {
        Long playerId = resolvePlayerId(playerName, teamId);
        if (playerAvatar != null && !playerAvatar.isBlank()) {
            playerRepository.findById(playerId).ifPresent(player -> {
                if (player.getAvatar() == null || player.getAvatar().isBlank()) {
                    player.setAvatar(playerAvatar);
                    playerRepository.save(player);
                }
            });
        }
        return playerId;
    }

    @Transactional(rollbackFor = Exception.class)
    public Long resolveSeasonId(String seasonName) {
        if (seasonName == null || seasonName.trim().isEmpty()) {
            throw new IllegalArgumentException("赛季名称不能为空");
        }
        String key = seasonName.trim();
        if (seasonCache.containsKey(key)) {
            return seasonCache.get(key);
        }
        Season season = seasonRepository.findByName(key).orElse(null);
        if (season == null) {
            season = new Season();
            season.setName(key);
            season.setCurrentSeason(false);
            season = seasonRepository.save(season);
            log.info("自动创建赛季: {}", key);
        }
        seasonCache.put(key, season.getId());
        return season.getId();
    }

    /**
     * 清空缓存（每次导入后调用）
     */
    public void clearCache() {
        teamCache.clear();
        playerCache.clear();
        seasonCache.clear();
    }
}
