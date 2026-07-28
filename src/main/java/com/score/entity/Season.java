package com.score.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 赛季表
 */
@Data
@Entity
@Table(name = "t_season")
public class Season {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 赛季名称，如 2024春季赛 */
    @Column(nullable = false, unique = true, length = 64)
    private String name;

    /** 赛季描述 */
    @Column(length = 255)
    private String description;

    /** 开始日期 */
    private java.time.LocalDate startDate;

    /** 结束日期 */
    private java.time.LocalDate endDate;

    /** 是否当前赛季 */
    @Column(nullable = false)
    private Boolean currentSeason = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    private LocalDateTime updateTime;
}
