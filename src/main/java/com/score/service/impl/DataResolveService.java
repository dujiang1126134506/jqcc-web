package com.score.service.impl;

import com.score.entity.Player;
import com.score.entity.Team;
import com.score.repository.PlayerRepository;
import com.score.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 数据解析辅助服务
 * 导入时通过名称解析战队/选手ID，找不到则自动创建
 * （用于导入场景，避免依赖预配置的ID）
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DataResolveService {

    private final TeamRepository teamRepository;
    private final PlayerRepository playerRepository;

    /** 简单缓存：名称 -> ID（导入时减少查询） */
    private final Map<String, Long> teamCache = new ConcurrentHashMap<>();
    private final Map<String, Long> playerCache = new ConcurrentHashMap<>();

    @Transactional(rollbackFor = Exception.class)
    public Long resolveTeamId(String teamName) {
        if (teamName == null || teamName.trim().isEmpty()) {
            throw new IllegalArgumentException("战队名称不能为空");
        }
        String key = teamName.trim();
        if (teamCache.containsKey(key)) {
            return teamCache.get(key);
        }
        // 从数据库查
        Team team = teamRepository.findAll().stream()
                .filter(t -> t.getName().equals(key))
                .findFirst().orElse(null);

        if (team == null) {
            // 自动创建战队
            team = new Team();
            team.setName(key);
            team = teamRepository.save(team);
            log.info("导入时自动创建战队: {}", key);
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
        Player player = playerRepository.findByTeamId(teamId).stream()
                .filter(p -> p.getName().equals(playerName.trim()))
                .findFirst().orElse(null);

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
     * 清空缓存（每次导入后调用）
     */
    public void clearCache() {
        teamCache.clear();
        playerCache.clear();
    }
}
