package com.score.service;

import com.score.dto.ImportResultVO;
import org.springframework.web.multipart.MultipartFile;

/**
 * 数据导入服务
 */
public interface ImportService {

    /**
     * 导入 Excel 文件
     *
     * @param file          上传的文件
     * @param seasonId      赛季ID
     * @param skipDuplicate 是否跳过重复数据
     * @return 导入结果
     */
    ImportResultVO importExcel(MultipartFile file, Long seasonId, boolean skipDuplicate);

    /**
     * 导入 CSV 文件
     */
    ImportResultVO importCsv(MultipartFile file, Long seasonId, boolean skipDuplicate);
}
