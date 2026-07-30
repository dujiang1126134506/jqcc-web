package com.score.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 文件上传结果
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadResultVO {

    /** 可访问的图片URL */
    private String url;
}