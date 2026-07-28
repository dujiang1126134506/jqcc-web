package com.score.controller;

import com.score.common.Result;
import com.score.dto.PageResult;
import com.score.dto.PlayerScoreDTO;
import com.score.dto.PlayerScoreQuery;
import com.score.dto.PlayerScoreVO;
import com.score.service.PlayerScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 选手得分记录 - REST 接口
 */
@Tag(name = "选手得分管理", description = "选手得分记录的增删改查接口")
@RestController
@RequestMapping("/api/player-scores")
@RequiredArgsConstructor
public class PlayerScoreController {

    private final PlayerScoreService playerScoreService;

    @Operation(summary = "新增选手得分记录")
    @PostMapping
    public Result<Long> create(@Valid @RequestBody PlayerScoreDTO dto) {
        Long id = playerScoreService.create(dto);
        return Result.ok(id);
    }

    @Operation(summary = "修改选手得分记录")
    @PutMapping("/{id}")
    public Result<Void> update(
            @Parameter(description = "记录ID") @PathVariable Long id,
            @Valid @RequestBody PlayerScoreDTO dto) {
        playerScoreService.update(id, dto);
        return Result.ok();
    }

    @Operation(summary = "删除选手得分记录")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@Parameter(description = "记录ID") @PathVariable Long id) {
        playerScoreService.delete(id);
        return Result.ok();
    }

    @Operation(summary = "批量删除选手得分记录")
    @DeleteMapping("/batch")
    public Result<Void> deleteBatch(@RequestBody List<Long> ids) {
        playerScoreService.deleteBatch(ids);
        return Result.ok();
    }

    @Operation(summary = "根据ID查询选手得分详情")
    @GetMapping("/{id}")
    public Result<PlayerScoreVO> getById(@Parameter(description = "记录ID") @PathVariable Long id) {
        PlayerScoreVO vo = playerScoreService.getById(id);
        return Result.ok(vo);
    }

    @Operation(summary = "分页查询选手得分记录")
    @GetMapping("/page")
    public Result<PageResult<PlayerScoreVO>> page(PlayerScoreQuery query) {
        PageResult<PlayerScoreVO> page = playerScoreService.page(query);
        return Result.ok(page);
    }
}
