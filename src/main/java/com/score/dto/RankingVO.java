package com.score.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 排行榜 VO
 */
public class RankingVO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "战队排行项")
    public static class TeamRanking {
        @Schema(description = "排名")
        private int rank;
        @Schema(description = "战队ID")
        private Long teamId;
        @Schema(description = "战队名称")
        private String teamName;
        @Schema(description = "战队Logo")
        private String teamLogo;
        @Schema(description = "分数（总分/均分）")
        private BigDecimal score;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "选手排行项")
    public static class PlayerRanking {
        @Schema(description = "排名")
        private int rank;
        @Schema(description = "选手ID")
        private Long playerId;
        @Schema(description = "选手名称")
        private String playerName;
        @Schema(description = "选手头像")
        private String playerAvatar;
        @Schema(description = "所属战队ID")
        private Long teamId;
        @Schema(description = "所属战队名称")
        private String teamName;
        @Schema(description = "总分")
        private BigDecimal score;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "赛季信息")
    public static class SeasonInfo {
        @Schema(description = "赛季ID")
        private Long id;
        @Schema(description = "赛季名称")
        private String name;
        @Schema(description = "赛季描述")
        private String description;
        @Schema(description = "是否当前赛季")
        private Boolean currentSeason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "赛程项")
    public static class ScheduleItem {
        @Schema(description = "赛程阶段")
        private String stage;
        @Schema(description = "赛程阶段描述")
        private String stageLabel;
        @Schema(description = "场次")
        private Integer roundNumber;
        @Schema(description = "比赛日期")
        private String matchDate;
        @Schema(description = "本场次参赛战队（仅名称列表）")
        private List<String> teams;
    }
}
