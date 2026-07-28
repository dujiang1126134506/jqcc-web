package com.score.dto;

import com.score.common.StageEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 选手得分记录 - 新增/编辑 DTO
 */
@Data
@Schema(description = "选手得分记录请求体")
public class PlayerScoreDTO {

    @Schema(description = "赛季ID", example = "1")
    @NotNull(message = "赛季ID不能为空")
    private Long seasonId;

    @Schema(description = "战队ID", example = "1")
    @NotNull(message = "战队ID不能为空")
    private Long teamId;

    @Schema(description = "选手ID", example = "1")
    @NotNull(message = "选手ID不能为空")
    private Long playerId;

    @Schema(description = "赛程阶段：REGULAR/REVIVAL/PLAYOFF/FINAL", example = "REGULAR")
    @NotNull(message = "赛程阶段不能为空")
    private StageEnum stage;

    @Schema(description = "场次（第几轮）", example = "1")
    @NotNull(message = "场次不能为空")
    private Integer roundNumber;

    @Schema(description = "比赛日期", example = "2024-03-15")
    @NotNull(message = "比赛日期不能为空")
    private LocalDate matchDate;

    @Schema(description = "身份", example = "队长")
    private String identity;

    @Schema(description = "版型", example = "标准版")
    private String version;

    @Schema(description = "胜负分", example = "3")
    private BigDecimal winLoseScore = BigDecimal.ZERO;

    @Schema(description = "投票分", example = "5")
    private BigDecimal voteScore = BigDecimal.ZERO;

    @Schema(description = "技能分", example = "2")
    private BigDecimal skillScore = BigDecimal.ZERO;

    @Schema(description = "违规分（扣分项，负数）", example = "-1")
    private BigDecimal penaltyScore = BigDecimal.ZERO;

    @Schema(description = "额外分", example = "0")
    private BigDecimal extraScore = BigDecimal.ZERO;

    @Schema(description = "是否MVP")
    private Boolean mvp = false;

    @Schema(description = "是否SVP")
    private Boolean svp = false;

    @Schema(description = "是否背锅")
    private Boolean scapegoat = false;
}
