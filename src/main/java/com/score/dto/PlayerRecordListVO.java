package com.score.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 选手数据记录 - 列表响应
 */
@Data
@Schema(description = "选手数据记录列表")
public class PlayerRecordListVO {

    @Schema(description = "数据列表")
    private List<PlayerRecordVO> list;

    @Schema(description = "总条数")
    private long total;

    public PlayerRecordListVO(List<PlayerRecordVO> list, long total) {
        this.list = list;
        this.total = total;
    }
}
