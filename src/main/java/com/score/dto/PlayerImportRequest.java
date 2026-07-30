package com.score.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

/**
 * 选手数据批量导入 - 请求体
 */
@Data
@Schema(description = "选手数据批量导入请求体")
public class PlayerImportRequest {

    @Schema(description = "待导入的选手数据列表")
    @NotEmpty(message = "导入数据不能为空")
    @Valid
    private List<PlayerRecordDTO> list;
}
