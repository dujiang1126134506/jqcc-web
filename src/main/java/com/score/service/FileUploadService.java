package com.score.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * 文件上传服务
 */
public interface FileUploadService {

    /**
     * 上传图片
     *
     * @param file 图片文件
     * @return 可访问的图片URL
     */
    String uploadImage(MultipartFile file);
}