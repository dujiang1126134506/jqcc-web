package com.score.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 选手数据记录 - 新增/编辑请求体（小程序端"赛事积分管理"页面使用的扁平结构）
 * 战队/赛季/选手均通过名称传入，后端自动查找或创建对应基础数据
 */
@Data
@Schema(description = "选手数据记录请求体（扁平结构）")
public class PlayerRecordDTO {

    @Schema(description = "选手名", example = "选手A")
    @NotBlank(message = "选手名不能为空")
    private String playerName;

    @Schema(description = "选手头像")
    private String playerAvatar;

    @Schema(description = "战队名", example = "战队1")
    @NotBlank(message = "战队名不能为空")
    private String teamName;

    @Schema(description = "战队logo")
    private String teamLogo;

    @Schema(description = "赛季名称", example = "S1赛季")
    @NotBlank(message = "赛季不能为空")
    private String season;

    @Schema(description = "赛程阶段：常规赛/复活赛/季后赛/总决赛", example = "常规赛")
    @NotBlank(message = "赛程阶段不能为空")
    private String stage;

    @Schema(description = "场次（第几轮）", example = "1")
    private Integer round = 1;

    @Schema(description = "比赛日期", example = "2024-01-01")
    @NotNull(message = "日期不能为空")
    private LocalDate date;

    @Schema(description = "身份", example = "队长")
    private String identity;

    @Schema(description = "版型")
    private String role;

    @Schema(description = "投票分", example = "5")
    private BigDecimal voteScore = BigDecimal.ZERO;

    @Schema(description = "胜负分", example = "3")
    private BigDecimal winScore = BigDecimal.ZERO;

    @Schema(description = "技能分", example = "2")
    private BigDecimal skillScore = BigDecimal.ZERO;

    @Schema(description = "违规分（扣分项，负数）", example = "0")
    private BigDecimal penaltyScore = BigDecimal.ZERO;

    @Schema(description = "额外分", example = "0")
    private BigDecimal extraScore = BigDecimal.ZERO;

    @Schema(description = "是否MVP")
    private Boolean isMvp = false;

    @Schema(description = "是否SVP")
    private Boolean isSvp = false;

    @Schema(description = "是否背锅")
    private Boolean isBlame = false;
}
