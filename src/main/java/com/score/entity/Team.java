package com.score.entity;

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
    private LocalDateTime createTime;

    @UpdateTimestamp
    private LocalDateTime updateTime;
}
