package com.score.service;

import com.score.dto.RankingVO;

import java.util.List;

/**
 * 排行榜服务（小程序端用）
 */
public interface RankingService {

    /**
     * 战队总分排行榜
     */
    List<RankingVO.TeamRanking> getTeamTotalRanking(Long seasonId);

    /**
     * 战队均分排行榜
     */
    List<RankingVO.TeamRanking> getTeamAverageRanking(Long seasonId);

    /**
     * 选手总分排行榜
     */
    List<RankingVO.PlayerRanking> getPlayerTotalRanking(Long seasonId);

    /**
     * 获取赛季列表
     */
    List<RankingVO.SeasonInfo> getSeasonList();

    /**
     * 获取赛季赛程
     */
    List<RankingVO.ScheduleItem> getSchedule(Long seasonId);

    /**
     * 获取当前赛季ID
     */
    Long getCurrentSeasonId();
}
