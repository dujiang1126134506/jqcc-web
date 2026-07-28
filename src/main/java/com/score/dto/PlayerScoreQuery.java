package com.score.dto;

import com.score.common.StageEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDate;

/**
 * 选手得分记录 - 查询条件
 */
@Data
@Schema(description = "选手得分查询条件")
public class PlayerScoreQuery {

    @Schema(description = "赛季ID")
    private Long seasonId;

    @Schema(description = "战队ID")
    private Long teamId;

    @Schema(description = "选手ID")
    private Long playerId;

    @Schema(description = "赛程阶段")
    private StageEnum stage;

    @Schema(description = "场次（第几轮）")
    private Integer roundNumber;

    @Schema(description = "比赛起始日期")
    private LocalDate startDate;

    @Schema(description = "比赛结束日期")
    private LocalDate endDate;

    @Schema(description = "分页页码，从1开始", example = "1")
    private Integer pageNum = 1;

    @Schema(description = "每页条数", example = "20")
    private Integer pageSize = 20;
}
