package com.score.service.impl;

import com.score.config.UploadProperties;
import com.score.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

/**
 * 文件上传服务实现
 * 图片按 yyyy/MM/dd 分目录存储到本地磁盘
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {

    private final UploadProperties uploadProperties;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final long MAX_SIZE = 5 * 1024 * 1024L;
    private static final DateTimeFormatter DIR_FORMATTER = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    @Override
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("上传文件不能为空");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new RuntimeException("图片大小不能超过5MB");
        }

        String originalName = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String extension = originalName == null ? "" : originalName.toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new RuntimeException("仅支持 " + String.join("/", ALLOWED_EXTENSIONS) + " 格式的图片");
        }

        String dateDir = LocalDate.now().format(DIR_FORMATTER);
        String fileName = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        try {
            Path targetDir = Paths.get(uploadProperties.getPath(), dateDir);
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(fileName);
            file.transferTo(targetFile);
            return uploadProperties.getUrlPrefix() + "/" + dateDir + "/" + fileName;
        } catch (IOException e) {
            log.error("图片上传失败", e);
            throw new RuntimeException("图片上传失败: " + e.getMessage());
        }
    }
}