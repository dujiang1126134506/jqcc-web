-- =============================================
-- 积分查询系统 - 初始化数据脚本 (H2 / MySQL 兼容)
-- 可作为首次运行的种子数据
-- =============================================

-- 清空旧数据（开发环境）
-- DELETE FROM t_player_score;
-- DELETE FROM t_player;
-- DELETE FROM t_team;
-- DELETE FROM t_season;

-- 插入赛季
INSERT INTO t_season (id, name, description, current_season, start_date, end_date)
VALUES (1, '2024春季赛', '2024年春季赛赛季', TRUE, '2024-03-01', '2024-06-30');

INSERT INTO t_season (id, name, description, current_season, start_date, end_date)
VALUES (2, '2024夏季赛', '2024年夏季赛赛季', FALSE, '2024-07-01', '2024-10-31');

-- 插入战队
INSERT INTO t_team (id, name, logo, description) VALUES (1, '星辰战队', '/team/star.png', '星辰战队简介');
INSERT INTO t_team (id, name, logo, description) VALUES (2, '烈焰战队', '/team/flame.png', '烈焰战队简介');
INSERT INTO t_team (id, name, logo, description) VALUES (3, '寒冰战队', '/team/ice.png', '寒冰战队简介');
INSERT INTO t_team (id, name, logo, description) VALUES (4, '雷霆战队', '/team/thunder.png', '雷霆战队简介');

-- 插入选手
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (1, '凌风', '/player/1.png', 1, '队长');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (2, '星尘', '/player/2.png', 1, '队员');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (3, '破晓', '/player/3.png', 1, '队员');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (4, '烈焰王', '/player/4.png', 2, '队长');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (5, '火焰', '/player/5.png', 2, '队员');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (6, '炎龙', '/player/6.png', 2, '队员');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (7, '冰雪', '/player/7.png', 3, '队长');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (8, '霜冻', '/player/8.png', 3, '队员');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (9, '寒流', '/player/9.png', 3, '队员');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (10, '雷神', '/player/10.png', 4, '队长');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (11, '闪电', '/player/11.png', 4, '队员');
INSERT INTO t_player (id, name, avatar, team_id, position) VALUES (12, '风暴', '/player/12.png', 4, '队员');

-- 插入示例得分数据（常规赛第1轮）
INSERT INTO t_player_score (season_id, team_id, player_id, stage, round_number, match_date, identity, version,
    win_lose_score, vote_score, skill_score, penalty_score, extra_score, total_score, mvp, svp, scapegoat)
VALUES
-- 星辰战队 vs 烈焰战队
(1, 1, 1, 'REGULAR', 1, '2024-03-10', '队长', '标准版', 3, 5, 2, 0, 0, 10, TRUE, FALSE, FALSE),
(1, 1, 2, 'REGULAR', 1, '2024-03-10', '队员', '标准版', 3, 3, 4, -1, 0, 9, FALSE, FALSE, FALSE),
(1, 1, 3, 'REGULAR', 1, '2024-03-10', '队员', '标准版', 3, 2, 1, 0, 0, 6, FALSE, FALSE, FALSE),
(1, 2, 4, 'REGULAR', 1, '2024-03-10', '队长', '标准版', 0, 4, 3, 0, 0, 7, FALSE, TRUE, FALSE),
(1, 2, 5, 'REGULAR', 1, '2024-03-10', '队员', '标准版', 0, 2, 2, -2, 0, 2, FALSE, FALSE, TRUE),
(1, 2, 6, 'REGULAR', 1, '2024-03-10', '队员', '标准版', 0, 1, 3, 0, 0, 4, FALSE, FALSE, FALSE),
-- 寒冰战队 vs 雷霆战队
(1, 3, 7, 'REGULAR', 1, '2024-03-11', '队长', '标准版', 3, 6, 3, 0, 0, 12, TRUE, FALSE, FALSE),
(1, 3, 8, 'REGULAR', 1, '2024-03-11', '队员', '标准版', 3, 2, 2, 0, 0, 7, FALSE, FALSE, FALSE),
(1, 3, 9, 'REGULAR', 1, '2024-03-11', '队员', '标准版', 3, 3, 1, -1, 0, 6, FALSE, FALSE, FALSE),
(1, 4, 10, 'REGULAR', 1, '2024-03-11', '队长', '标准版', 0, 5, 2, 0, 0, 7, FALSE, TRUE, FALSE),
(1, 4, 11, 'REGULAR', 1, '2024-03-11', '队员', '标准版', 0, 2, 3, 0, 0, 5, FALSE, FALSE, FALSE),
(1, 4, 12, 'REGULAR', 1, '2024-03-11', '队员', '标准版', 0, 1, 2, -1, 0, 2, FALSE, FALSE, TRUE);

-- 常规赛第2轮
INSERT INTO t_player_score (season_id, team_id, player_id, stage, round_number, match_date, identity, version,
    win_lose_score, vote_score, skill_score, penalty_score, extra_score, total_score, mvp, svp, scapegoat)
VALUES
(1, 1, 1, 'REGULAR', 2, '2024-03-17', '队长', '标准版', 0, 4, 2, 0, 0, 6, FALSE, FALSE, FALSE),
(1, 1, 2, 'REGULAR', 2, '2024-03-17', '队员', '标准版', 0, 3, 3, -1, 0, 5, FALSE, FALSE, TRUE),
(1, 1, 3, 'REGULAR', 2, '2024-03-17', '队员', '标准版', 0, 2, 2, 0, 0, 4, FALSE, FALSE, FALSE),
(1, 3, 7, 'REGULAR', 2, '2024-03-17', '队长', '标准版', 3, 5, 4, 0, 0, 12, TRUE, FALSE, FALSE),
(1, 3, 8, 'REGULAR', 2, '2024-03-17', '队员', '标准版', 3, 3, 2, 0, 0, 8, FALSE, FALSE, FALSE),
(1, 3, 9, 'REGULAR', 2, '2024-03-17', '队员', '标准版', 3, 2, 3, 0, 0, 8, FALSE, FALSE, FALSE);
