package com.score.controller;

import com.score.common.Result;
import com.score.entity.Season;
import com.score.repository.SeasonRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 赛季管理接口
 */
@Tag(name = "赛季管理", description = "赛季的增删改查")
@RestController
@RequestMapping("/api/seasons")
@RequiredArgsConstructor
public class SeasonController {

    private final SeasonRepository seasonRepository;

    @Operation(summary = "查询所有赛季")
    @GetMapping
    public Result<List<Season>> list() {
        return Result.ok(seasonRepository.findAll());
    }

    @Operation(summary = "获取默认/当前赛季")
    @GetMapping("/default")
    public Result<Season> getDefault() {
        return Result.ok(seasonRepository.findByCurrentSeasonTrue().orElse(null));
    }

    @Operation(summary = "设为默认/当前赛季")
    @PostMapping("/{id}/set-default")
    public Result<Season> setDefault(@PathVariable Long id) {
        // 先把所有赛季的 currentSeason 设为 false
        List<Season> all = seasonRepository.findAll();
        for (Season s : all) {
            if (Boolean.TRUE.equals(s.getCurrentSeason())) {
                s.setCurrentSeason(false);
            }
        }
        seasonRepository.saveAll(all);
        // 再设当前
        Season season = seasonRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("赛季不存在"));
        season.setCurrentSeason(true);
        return Result.ok(seasonRepository.save(season));
    }

    @Operation(summary = "根据ID查询赛季")
    @GetMapping("/{id}")
    public Result<Season> getById(@PathVariable Long id) {
        return Result.ok(seasonRepository.findById(id).orElse(null));
    }

    @Operation(summary = "新增赛季")
    @PostMapping
    public Result<Season> create(@RequestBody Season season) {
        season.setId(null);
        return Result.ok(seasonRepository.save(season));
    }

    @Operation(summary = "修改赛季")
    @PutMapping("/{id}")
    public Result<Season> update(@PathVariable Long id, @RequestBody Season season) {
        season.setId(id);
        return Result.ok(seasonRepository.save(season));
    }

    @Operation(summary = "删除赛季")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        seasonRepository.deleteById(id);
        return Result.ok();
    }
}
