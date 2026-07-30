package com.score.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 选手数据批量导入 - 结果
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "选手数据批量导入结果")
public class PlayerImportResultVO {

    @Schema(description = "成功导入条数")
    private int count;
}
