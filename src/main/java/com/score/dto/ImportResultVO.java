package com.score.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 导入结果 VO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "数据导入结果")
public class ImportResultVO {

    @Schema(description = "总条数")
    private int total;

    @Schema(description = "成功条数")
    private int successCount;

    @Schema(description = "失败条数")
    private int failCount;

    @Schema(description = "跳过的重复条数")
    private int skipCount;

    @Schema(description = "失败行详情")
    private List<ImportFailRow> failRows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "导入失败行")
    public static class ImportFailRow {
        @Schema(description = "行号")
        private int rowNum;
        @Schema(description = "失败原因")
        private String reason;
        @Schema(description = "原始数据（前几列）")
        private String rowData;
    }
}
