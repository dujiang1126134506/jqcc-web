package com.score.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 文件上传配置
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app.upload")
public class UploadProperties {

    /** 文件存储根目录 */
    private String path = "D:/jqcc-uploads";

    /** 访问URL前缀 */
    private String urlPrefix = "/uploads";
}