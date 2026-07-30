package com.score.controller;

import com.score.common.Result;
import com.score.dto.PlayerImportRequest;
import com.score.dto.PlayerImportResultVO;
import com.score.dto.PlayerRecordDTO;
import com.score.dto.PlayerRecordListVO;
import com.score.dto.PlayerRecordVO;
import com.score.service.PlayerRecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 选手数据接口
 * 供小程序端"赛事积分管理"页面使用，接口以扁平结构收发（战队/赛季/选手均为名称，
 * 一条记录对应一场比赛的得分），底层仍按 赛季/战队/选手/得分记录 分表存储
 */
@Tag(name = "选手管理", description = "选手数据的增删改查与批量导入（扁平结构）")
@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerRecordService playerRecordService;

    @Operation(summary = "查询选手数据列表")
    @GetMapping
    public Result<PlayerRecordListVO> list(
            @Parameter(description = "赛季名称") @RequestParam(required = false) String season,
            @Parameter(description = "赛程阶段") @RequestParam(required = false) String stage,
            @Parameter(description = "关键字（选手名/战队名）") @RequestParam(required = false) String keyword) {
        return Result.ok(playerRecordService.findAll(season, stage, keyword));
    }

    @Operation(summary = "根据ID查询选手数据")
    @GetMapping("/{id}")
    public Result<PlayerRecordVO> getById(@PathVariable Long id) {
        PlayerRecordVO vo = playerRecordService.findOne(id);
        if (vo == null) {
            return Result.fail(404, "选手不存在");
        }
        return Result.ok(vo);
    }

    @Operation(summary = "新增选手数据")
    @PostMapping
    public Result<PlayerRecordVO> create(@Valid @RequestBody PlayerRecordDTO dto) {
        return Result.ok("创建成功", playerRecordService.create(dto));
    }

    @Operation(summary = "修改选手数据")
    @PutMapping("/{id}")
    public Result<PlayerRecordVO> update(@PathVariable Long id, @Valid @RequestBody PlayerRecordDTO dto) {
        PlayerRecordVO vo = playerRecordService.update(id, dto);
        if (vo == null) {
            return Result.fail(404, "选手不存在");
        }
        return Result.ok("更新成功", vo);
    }

    @Operation(summary = "删除选手数据")
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (!playerRecordService.remove(id)) {
            return Result.fail(404, "选手不存在");
        }
        return Result.ok("删除成功", null);
    }

    @Operation(summary = "批量导入选手数据")
    @PostMapping("/import")
    public Result<PlayerImportResultVO> importBatch(@Valid @RequestBody PlayerImportRequest request) {
        int count = playerRecordService.importBatch(request.getList());
        return Result.ok("导入成功", new PlayerImportResultVO(count));
    }
}
