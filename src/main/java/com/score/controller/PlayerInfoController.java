package com.score.controller;

import com.score.common.Result;
import com.score.entity.Player;
import com.score.repository.PlayerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 选手库管理接口
 * 管理选手基本信息（姓名、头像、所属战队、位置），不涉及具体比赛得分
 */
@Tag(name = "选手库管理", description = "选手基本信息的增删改查")
@RestController
@RequestMapping("/api/player-info")
@RequiredArgsConstructor
public class PlayerInfoController {

    private final PlayerRepository playerRepository;

    @Operation(summary = "查询选手列表（全部）")
    @GetMapping("/list")
    public Result<List<Player>> list(
            @Parameter(description = "战队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "关键字（选手名）") @RequestParam(required = false) String keyword) {
        List<Player> list;
        Sort sort = Sort.by(Sort.Direction.DESC, "id");
        if (teamId != null && keyword != null && !keyword.isBlank()) {
            list = playerRepository.findByTeamIdAndNameContaining(teamId, keyword, sort);
        } else if (teamId != null) {
            list = playerRepository.findByTeamId(teamId, sort);
        } else if (keyword != null && !keyword.isBlank()) {
            list = playerRepository.findByNameContaining(keyword, sort);
        } else {
            list = playerRepository.findAll(sort);
        }
        return Result.ok(list);
    }

    @Operation(summary = "分页查询选手")
    @GetMapping("/page")
    public Result<Page<Player>> page(
            @Parameter(description = "页码，从0开始") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "每页条数") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "战队ID") @RequestParam(required = false) Long teamId,
            @Parameter(description = "关键字（选手名）") @RequestParam(required = false) String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<Player> result;
        if (teamId != null && keyword != null && !keyword.isBlank()) {
            result = playerRepository.findByTeamIdAndNameContaining(teamId, keyword, pageable);
        } else if (teamId != null) {
            result = playerRepository.findByTeamId(teamId, pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            result = playerRepository.findByNameContaining(keyword, pageable);
        } else {
            result = playerRepository.findAll(pageable);
        }
        return Result.ok(result);
    }

    @Operation(summary = "根据ID查询选手")
    @GetMapping("/{id}")
    public Result<Player> getById(@PathVariable Long id) {
        return playerRepository.findById(id)
                .map(Result::ok)
                .orElse(Result.fail(404, "选手不存在"));
    }

    @Operation(summary = "新增选手")
    @PostMapping
    public Result<Player> create(@RequestBody Player player) {
        if (player.getName() == null || player.getName().isBlank()) {
            return Result.fail(400, "选手姓名不能为空");
        }
        if (player.getTeamId() == null) {
            return Result.fail(400, "所属战队不能为空");
        }
        Player saved = playerRepository.save(player);
        return Result.ok("创建成功", saved);
    }

    @Operation(summary = "修改选手")
    @PutMapping("/{id}")
    public Result<Player> update(@PathVariable Long id, @RequestBody Player player) {
        return playerRepository.findById(id)
                .map(existing -> {
                    if (player.getName() != null) {
                        existing.setName(player.getName());
                    }
                    if (player.getAvatar() != null) {
                        existing.setAvatar(player.getAvatar());
                    }
                    if (player.getTeamId() != null) {
                        existing.setTeamId(player.getTeamId());
                    }
                    if (player.getPosition() != null) {
                        existing.setPosition(player.getPosition());
                    }
                    Player saved = playerRepository.save(existing);
                    return Result.ok("更新成功", saved);
                })
                .orElse(Result.fail(404, "选手不存在"));
    }

    @Operation(summary = "删除选手")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!playerRepository.existsById(id)) {
            return Result.fail(404, "选手不存在");
        }
        playerRepository.deleteById(id);
        return Result.ok("删除成功", null);
    }

    @Operation(summary = "批量删除选手")
    @DeleteMapping("/batch")
    public Result<Void> batchDelete(@RequestBody List<Long> ids) {
        playerRepository.deleteAllById(ids);
        return Result.ok("删除成功", null);
    }
}
