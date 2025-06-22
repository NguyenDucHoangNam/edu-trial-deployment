package com.fpt.edu_trial.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class LessonUpdateRequest {
    @Size(max = 255)
    private String title;

    private String content;

    @Size(max = 500)
    private String videoUrl;

    private Integer orderIndex;

    // BỔ SUNG: Thêm trường để nhận file video tải lên
    @JsonIgnore
    private MultipartFile videoFile;

    // BỔ SUNG: Thêm tùy chọn để xóa video hiện tại
    private Boolean removeCurrentVideo = false;
}

