package com.score.controller;

import com.score.common.Result;
import com.score.dto.ImportResultVO;
import com.score.service.ImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 数据导入接口
 */
@Tag(name = "数据导入", description = "选手得分数据批量导入")
@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    @Operation(summary = "导入 Excel 文件 (.xlsx)")
    @PostMapping(value = "/excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<ImportResultVO> importExcel(
            @Parameter(description = "Excel文件") @RequestPart("file") MultipartFile file,
            @Parameter(description = "赛季ID") @RequestParam Long seasonId,
            @Parameter(description = "是否跳过重复数据，默认true")
            @RequestParam(defaultValue = "true") boolean skipDuplicate) {
        ImportResultVO result = importService.importExcel(file, seasonId, skipDuplicate);
        return Result.ok(result);
    }

    @Operation(summary = "导入 CSV 文件")
    @PostMapping(value = "/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<ImportResultVO> importCsv(
            @Parameter(description = "CSV文件") @RequestPart("file") MultipartFile file,
            @Parameter(description = "赛季ID") @RequestParam Long seasonId,
            @Parameter(description = "是否跳过重复数据，默认true")
            @RequestParam(defaultValue = "true") boolean skipDuplicate) {
        ImportResultVO result = importService.importCsv(file, seasonId, skipDuplicate);
        return Result.ok(result);
    }
}
