package com.score.controller;

import com.score.common.Result;
import com.score.dto.UploadResultVO;
import com.score.service.FileUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件上传接口
 */
@Tag(name = "文件上传", description = "图片上传，用于战队/选手头像")
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final FileUploadService fileUploadService;

    @Operation(summary = "上传图片")
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<UploadResultVO> uploadImage(
            @Parameter(description = "图片文件") @RequestPart("file") MultipartFile file) {
        String url = fileUploadService.uploadImage(file);
        return Result.ok(new UploadResultVO(url));
    }
}