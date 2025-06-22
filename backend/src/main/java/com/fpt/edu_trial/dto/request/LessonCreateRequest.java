package com.fpt.edu_trial.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class LessonCreateRequest {
    @NotBlank(message = "Tiêu đề bài học không được để trống")
    @Size(max = 255)
    private String title;

    private String content; // Nội dung bài học (dạng text/markdown)

    @Size(max = 500)
    private String videoUrl; // Link video (tùy chọn)

    @NotNull(message = "Thứ tự bài học là bắt buộc")
    private Integer orderIndex;

    @JsonIgnore // Bỏ qua trường này khi chuyển đổi từ JSON
    private MultipartFile videoFile;
}