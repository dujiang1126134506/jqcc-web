package com.score.dto;

import com.score.common.StageEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 选手得分记录 - 响应 VO
 */
@Data
@Schema(description = "选手得分记录详情")
public class PlayerScoreVO {

    @Schema(description = "记录ID")
    private Long id;

    @Schema(description = "赛季ID")
    private Long seasonId;

    @Schema(description = "战队ID")
    private Long teamId;

    @Schema(description = "战队名称")
    private String teamName;

    @Schema(description = "战队logo")
    private String teamLogo;

    @Schema(description = "选手ID")
    private Long playerId;

    @Schema(description = "选手名称")
    private String playerName;

    @Schema(description = "选手头像")
    private String playerAvatar;

    @Schema(description = "赛程阶段")
    private StageEnum stage;

    @Schema(description = "赛程阶段描述")
    private String stageLabel;

    @Schema(description = "场次")
    private Integer roundNumber;

    @Schema(description = "比赛日期")
    private LocalDate matchDate;

    @Schema(description = "身份")
    private String identity;

    @Schema(description = "版型")
    private String version;

    @Schema(description = "胜负分")
    private BigDecimal winLoseScore;

    @Schema(description = "投票分")
    private BigDecimal voteScore;

    @Schema(description = "技能分")
    private BigDecimal skillScore;

    @Schema(description = "违规分")
    private BigDecimal penaltyScore;

    @Schema(description = "额外分")
    private BigDecimal extraScore;

    @Schema(description = "总得分")
    private BigDecimal totalScore;

    @Schema(description = "是否MVP")
    private Boolean mvp;

    @Schema(description = "是否SVP")
    private Boolean svp;

    @Schema(description = "是否背锅")
    private Boolean scapegoat;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Schema(description = "更新时间")
    private LocalDateTime updateTime;
}
