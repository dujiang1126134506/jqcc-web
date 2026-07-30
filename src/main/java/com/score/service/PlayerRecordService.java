package com.score.service;

import com.score.dto.PlayerRecordDTO;
import com.score.dto.PlayerRecordListVO;
import com.score.dto.PlayerRecordVO;

import java.util.List;

/**
 * 选手数据记录服务（扁平结构，供小程序端"赛事积分管理"页面使用）
 * 内部按 赛季/战队/选手/得分记录 分表存储，接口层以扁平结构收发
 */
public interface PlayerRecordService {

    /**
     * 查询选手数据列表
     */
    PlayerRecordListVO findAll(String season, String stage, String keyword);

    /**
     * 根据ID查询选手数据
     */
    PlayerRecordVO findOne(Long id);

    /**
     * 新增选手数据
     */
    PlayerRecordVO create(PlayerRecordDTO dto);

    /**
     * 修改选手数据，记录不存在时返回 null
     */
    PlayerRecordVO update(Long id, PlayerRecordDTO dto);

    /**
     * 删除选手数据，记录不存在时返回 false
     */
    boolean remove(Long id);

    /**
     * 批量导入
     *
     * @return 成功导入条数
     */
    int importBatch(List<PlayerRecordDTO> list);
}
