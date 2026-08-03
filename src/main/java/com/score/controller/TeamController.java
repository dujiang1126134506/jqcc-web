package com.score.controller;

import com.score.common.Result;
import com.score.entity.Team;
import com.score.repository.TeamRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 战队管理接口
 */
@Tag(name = "战队管理", description = "战队的增删改查，按赛季区分")
@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamRepository teamRepository;

    @Operation(summary = "查询所有战队")
    @GetMapping
    public Result<List<Team>> list() {
        return Result.ok(teamRepository.findAll());
    }

    @Operation(summary = "按赛季查询战队")
    @GetMapping("/season/{seasonId}")
    public Result<List<Team>> listBySeason(@PathVariable Long seasonId) {
        return Result.ok(teamRepository.findBySeasonId(seasonId));
    }

    @Operation(summary = "根据ID查询战队")
    @GetMapping("/{id}")
    public Result<Team> getById(@PathVariable Long id) {
        return Result.ok(teamRepository.findById(id).orElse(null));
    }

    @Operation(summary = "新增战队")
    @PostMapping
    public Result<Team> create(@RequestBody Team team) {
        if (team.getSeasonId() == null) {
            return Result.error("赛季ID不能为空");
        }
        team.setId(null);
        // 同一赛季下战队名不能重复
        if (teamRepository.findBySeasonIdAndName(team.getSeasonId(), team.getName()).isPresent()) {
            return Result.error("该赛季下已存在同名战队");
        }
        return Result.ok(teamRepository.save(team));
    }

    @Operation(summary = "修改战队")
    @PutMapping("/{id}")
    public Result<Team> update(@PathVariable Long id, @RequestBody Team team) {
        team.setId(id);
        return Result.ok(teamRepository.save(team));
    }

    @Operation(summary = "删除战队")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        teamRepository.deleteById(id);
        return Result.ok();
    }
}
