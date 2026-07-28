package com.score.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 选手表
 */
@Data
@Entity
@Table(name = "t_player")
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 选手姓名 / 昵称 */
    @Column(nullable = false, length = 64)
    private String name;

    /** 选手头像 */
    @Column(length = 512)
    private String avatar;

    /** 所属战队ID */
    @Column(nullable = false)
    private Long teamId;

    /** 选手位置 / 身份 */
    @Column(length = 32)
    private String position;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createTime;

    @UpdateTimestamp
    private LocalDateTime updateTime;
}
