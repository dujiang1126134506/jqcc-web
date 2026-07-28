package com.score.controller;

import com.score.common.Result;
import com.score.dto.RankingVO;
import com.score.service.RankingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 小程序端接口 - 排行榜与赛程
 */
@Tag(name = "小程序-数据查询", description = "小程序端首页数据、排行榜、赛程查询")
@RestController
@RequestMapping("/api/app")
@RequiredArgsConstructor
public class AppController {

    private final RankingService rankingService;

    @Operation(summary = "获取赛季列表")
    @GetMapping("/seasons")
    public Result<List<RankingVO.SeasonInfo>> getSeasons() {
        return Result.ok(rankingService.getSeasonList());
    }

    @Operation(summary = "获取当前赛季ID")
    @GetMapping("/current-season")
    public Result<Long> getCurrentSeasonId() {
        return Result.ok(rankingService.getCurrentSeasonId());
    }

    @Operation(summary = "战队总分排行榜")
    @GetMapping("/ranking/team-total")
    public Result<List<RankingVO.TeamRanking>> getTeamTotalRanking(
            @Parameter(description = "赛季ID，不传则用当前赛季")
            @RequestParam(required = false) Long seasonId) {
        Long sid = resolveSeasonId(seasonId);
        return Result.ok(rankingService.getTeamTotalRanking(sid));
    }

    @Operation(summary = "战队均分排行榜")
    @GetMapping("/ranking/team-average")
    public Result<List<RankingVO.TeamRanking>> getTeamAverageRanking(
            @Parameter(description = "赛季ID，不传则用当前赛季")
            @RequestParam(required = false) Long seasonId) {
        Long sid = resolveSeasonId(seasonId);
        return Result.ok(rankingService.getTeamAverageRanking(sid));
    }

    @Operation(summary = "选手总分排行榜")
    @GetMapping("/ranking/player-total")
    public Result<List<RankingVO.PlayerRanking>> getPlayerTotalRanking(
            @Parameter(description = "赛季ID，不传则用当前赛季")
            @RequestParam(required = false) Long seasonId) {
        Long sid = resolveSeasonId(seasonId);
        return Result.ok(rankingService.getPlayerTotalRanking(sid));
    }

    @Operation(summary = "获取赛季赛程")
    @GetMapping("/schedule")
    public Result<List<RankingVO.ScheduleItem>> getSchedule(
            @Parameter(description = "赛季ID，不传则用当前赛季")
            @RequestParam(required = false) Long seasonId) {
        Long sid = resolveSeasonId(seasonId);
        return Result.ok(rankingService.getSchedule(sid));
    }

    private Long resolveSeasonId(Long seasonId) {
        if (seasonId != null) return seasonId;
        Long current = rankingService.getCurrentSeasonId();
        if (current == null) {
            throw new RuntimeException("未配置当前赛季");
        }
        return current;
    }
}
