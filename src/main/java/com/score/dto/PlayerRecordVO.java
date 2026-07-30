package com.score.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 选手数据记录 - 响应体（扁平结构）
 */
@Data
@Schema(description = "选手数据记录（扁平结构）")
public class PlayerRecordVO {

    @Schema(description = "记录ID")
    private Long id;

    @Schema(description = "选手名")
    private String playerName;

    @Schema(description = "选手头像")
    private String playerAvatar;

    @Schema(description = "战队名")
    private String teamName;

    @Schema(description = "战队logo")
    private String teamLogo;

    @Schema(description = "赛季名称")
    private String season;

    @Schema(description = "赛程阶段")
    private String stage;

    @Schema(description = "场次")
    private Integer round;

    @Schema(description = "比赛日期")
    private LocalDate date;

    @Schema(description = "身份")
    private String identity;

    @Schema(description = "版型")
    private String role;

    @Schema(description = "总得分")
    private BigDecimal score;

    @Schema(description = "投票分")
    private BigDecimal voteScore;

    @Schema(description = "胜负分")
    private BigDecimal winScore;

    @Schema(description = "技能分")
    private BigDecimal skillScore;

    @Schema(description = "违规分")
    private BigDecimal penaltyScore;

    @Schema(description = "额外分")
    private BigDecimal extraScore;

    @Schema(description = "是否MVP")
    private Boolean isMvp;

    @Schema(description = "是否SVP")
    private Boolean isSvp;

    @Schema(description = "是否背锅")
    private Boolean isBlame;

    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
}
