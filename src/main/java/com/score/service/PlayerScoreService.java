package com.score.service;

import com.score.dto.PageResult;
import com.score.dto.PlayerScoreDTO;
import com.score.dto.PlayerScoreQuery;
import com.score.dto.PlayerScoreVO;

import java.util.List;

/**
 * 选手得分记录 - 服务接口
 */
public interface PlayerScoreService {

    /**
     * 新增选手得分记录
     */
    Long create(PlayerScoreDTO dto);

    /**
     * 修改选手得分记录
     */
    void update(Long id, PlayerScoreDTO dto);

    /**
     * 删除选手得分记录
     */
    void delete(Long id);

    /**
     * 批量删除
     */
    void deleteBatch(List<Long> ids);

    /**
     * 根据ID查询详情
     */
    PlayerScoreVO getById(Long id);

    /**
     * 分页查询
     */
    PageResult<PlayerScoreVO> page(PlayerScoreQuery query);

    /**
     * 批量新增（用于导入）
     *
     * @return 成功条数
     */
    int batchCreate(List<PlayerScoreDTO> list, boolean skipDuplicate);
}
