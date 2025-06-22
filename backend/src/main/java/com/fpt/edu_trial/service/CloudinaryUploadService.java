package com.fpt.edu_trial.service;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryUploadService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, String folderName) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String fileNameWithoutExtension = originalFilename.contains(".") ? originalFilename.substring(0, originalFilename.lastIndexOf(".")) : originalFilename;
            String publicId = folderName + "/" + fileNameWithoutExtension + "_" + UUID.randomUUID();


            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "folder", folderName,
                    "resource_type", "auto"
            ));
            String fileUrl = (String) uploadResult.get("secure_url");
            if (fileUrl == null) {
                fileUrl = (String) uploadResult.get("url");
            }
            log.info("File uploaded successfully to Cloudinary. URL: {}, Public ID: {}", fileUrl, publicId);
            return fileUrl;
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.CLOUDINARY_UPLOAD_FAILED, "Lỗi khi tải file lên Cloudinary: " + e.getMessage());
        } catch (Exception e) {
            log.error("An unexpected error occurred during Cloudinary upload: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.CLOUDINARY_UPLOAD_FAILED, "Lỗi không mong muốn khi tải file lên Cloudinary: " + e.getMessage());
        }
    }
    public boolean deleteFileByPublicId(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            log.warn("Public ID is null or empty, cannot delete file from Cloudinary.");
            return false;
        }
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Cloudinary delete result for public_id '{}': {}", publicId, result.get("result"));
            return "ok".equals(result.get("result")) || "not found".equals(result.get("result"));
        } catch (IOException e) {
            log.error("Failed to delete file from Cloudinary with public_id '{}': {}", publicId, e.getMessage(), e);
            return false;
        } catch (Exception e) {
            log.error("An unexpected error occurred during Cloudinary delete for public_id '{}': {}", publicId, e.getMessage(), e);
            return false;
        }
    }

    public void deleteFileByPublicId(String publicId, String resourceType) {
        if (publicId == null || publicId.trim().isEmpty()) {
            log.warn("Public ID is null or empty, cannot delete resource type '{}' from Cloudinary.", resourceType);
            return;
        }
        try {
            // Thêm tùy chọn resource_type vào khi xóa
            Map<?, ?> result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
            if ("ok".equals(result.get("result"))) {
                log.info("Successfully sent delete request for resource '{}' with public_id '{}' to Cloudinary.", resourceType, publicId);
            } else {
                log.warn("Could not delete resource from Cloudinary. Public ID: {}, Result: {}", publicId, result.get("result"));
            }
        } catch (IOException e) {
            log.error("Failed to delete resource from Cloudinary with public_id '{}' and resource_type '{}': {}", publicId, resourceType, e.getMessage(), e);
        }
    }

    public String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return null;
        }
        // Ví dụ: https://res.cloudinary.com/your_cloud_name/image/upload/v1600000000/folder1/folder2/image_name.jpg
        // Chúng ta muốn lấy: folder1/folder2/image_name
        // Pattern này tìm phần sau "upload/", bỏ qua version (vXXXXXXXXXX/), và lấy đến trước dấu chấm cuối cùng (format)
        Pattern pattern = Pattern.compile("/upload/(?:v\\d+/)?([^\\.]+)\\.?");
        Matcher matcher = pattern.matcher(imageUrl);
        if (matcher.find()) {
            // Group 1 sẽ là public_id bao gồm cả thư mục
            return matcher.group(1);
        }
        log.warn("Could not extract public_id from Cloudinary URL: {}", imageUrl);
        return null;
    }

}
