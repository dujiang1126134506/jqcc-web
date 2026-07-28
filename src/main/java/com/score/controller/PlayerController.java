package com.score.controller;

import com.score.common.Result;
import com.score.entity.Player;
import com.score.repository.PlayerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 选手管理接口
 */
@Tag(name = "选手管理", description = "选手的增删改查")
@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerRepository playerRepository;

    @Operation(summary = "查询所有选手")
    @GetMapping
    public Result<List<Player>> list() {
        return Result.ok(playerRepository.findAll());
    }

    @Operation(summary = "按战队查询选手")
    @GetMapping("/by-team/{teamId}")
    public Result<List<Player>> listByTeam(@PathVariable Long teamId) {
        return Result.ok(playerRepository.findByTeamId(teamId));
    }

    @Operation(summary = "根据ID查询选手")
    @GetMapping("/{id}")
    public Result<Player> getById(@PathVariable Long id) {
        return Result.ok(playerRepository.findById(id).orElse(null));
    }

    @Operation(summary = "新增选手")
    @PostMapping
    public Result<Player> create(@RequestBody Player player) {
        player.setId(null);
        return Result.ok(playerRepository.save(player));
    }

    @Operation(summary = "修改选手")
    @PutMapping("/{id}")
    public Result<Player> update(@PathVariable Long id, @RequestBody Player player) {
        player.setId(id);
        return Result.ok(playerRepository.save(player));
    }

    @Operation(summary = "删除选手")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        playerRepository.deleteById(id);
        return Result.ok();
    }
}
