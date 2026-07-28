package com.score.entity;

import com.score.common.StageEnum;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 选手得分记录表
 * 记录每个选手每个场次的详细得分
 */
@Data
@Entity
@Table(name = "t_player_score", indexes = {
        @Index(name = "idx_season_player", columnList = "seasonId,playerId"),
        @Index(name = "idx_season_team", columnList = "seasonId,teamId"),
        @Index(name = "idx_stage_round", columnList = "seasonId,stage,roundNumber"),
        @Index(name = "idx_match_date", columnList = "matchDate")
})
public class PlayerScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 赛季ID */
    @Column(nullable = false)
    private Long seasonId;

    /** 战队ID */
    @Column(nullable = false)
    private Long teamId;

    /** 选手ID */
    @Column(nullable = false)
    private Long playerId;

    // ====== 基础信息 ======

    /** 赛程阶段：常规赛/复活赛/季后赛/总决赛 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private StageEnum stage;

    /** 场次（第几轮） */
    @Column(nullable = false)
    private Integer roundNumber;

    /** 比赛日期 */
    @Column(nullable = false)
    private LocalDate matchDate;

    /** 身份（如：队长、替补等） */
    @Column(length = 32)
    private String identity;

    /** 版型 / 阵营 */
    @Column(length = 32)
    private String version;

    // ====== 得分字段 ======

    /** 胜负分 */
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal winLoseScore = BigDecimal.ZERO;

    /** 投票分 */
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal voteScore = BigDecimal.ZERO;

    /** 技能分 */
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal skillScore = BigDecimal.ZERO;

    /** 违规分（扣分项，用负数表示） */
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal penaltyScore = BigDecimal.ZERO;

    /** 额外分 */
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal extraScore = BigDecimal.ZERO;

    /**
     * 总得分 = 胜负分 + 投票分 + 技能分 + 违规分 + 额外分
     * 由业务计算并持久化，方便排序查询
     */
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal totalScore = BigDecimal.ZERO;

    // ====== 荣誉标记 ======

    /** 是否 MVP */
    @Column(nullable = false)
    private Boolean mvp = false;

    /** 是否 SVP */
    @Column(nullable = false)
    private Boolean svp = false;

    /** 是否背锅 */
    @Column(nullable = false)
    private Boolean scapegoat = false;

    // ====== 时间戳 ======

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    private LocalDateTime updateTime;

    /**
     * 计算总得分
     * 得分 = 胜负分 + 投票分 + 技能分 + 违规分 + 额外分
     */
    public BigDecimal calculateTotalScore() {
        return nullSafe(winLoseScore)
                .add(nullSafe(voteScore))
                .add(nullSafe(skillScore))
                .add(nullSafe(penaltyScore))
                .add(nullSafe(extraScore));
    }

    private BigDecimal nullSafe(BigDecimal val) {
        return val == null ? BigDecimal.ZERO : val;
    }
}
