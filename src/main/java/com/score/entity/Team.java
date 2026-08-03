package com.score.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 战队表
 */
@Data
@Entity
@Table(name = "t_team")
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 所属赛季ID */
    @Column(name = "season_id", nullable = false)
    private Long seasonId;

    /** 战队名称 */
    @Column(nullable = false, length = 64)
    private String name;

    /** 战队 logo 地址 */
    @Column(length = 512)
    private String logo;

    /** 战队简介 */
    @Column(length = 512)
    private String description;

    @CreationTimestamp
    @Column(updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    @UpdateTimestamp
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}
