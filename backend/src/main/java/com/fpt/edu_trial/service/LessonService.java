package com.fpt.edu_trial.service;


import com.fpt.edu_trial.dto.request.LessonCreateRequest;
import com.fpt.edu_trial.dto.request.LessonUpdateRequest;
import com.fpt.edu_trial.dto.response.LessonResponse;
import com.fpt.edu_trial.entity.Chapter;
import com.fpt.edu_trial.entity.Lesson;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.LessonMapper;
import com.fpt.edu_trial.repository.ChapterRepository;
import com.fpt.edu_trial.repository.LessonRepository;
import com.fpt.edu_trial.repository.UniversityRepository;
import com.fpt.edu_trial.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class LessonService {

    private final LessonRepository lessonRepository;
    private final ChapterRepository chapterRepository;
    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final LessonMapper lessonMapper;
    private final ModelMapper modelMapper;
    private final CloudinaryUploadService cloudinaryUploadService;

    private University getUniversityFromCurrentUser(UserDetails currentUserDetails) {
        User user = userRepository.findByEmail(currentUserDetails.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return universityRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Tài khoản của bạn chưa được liên kết với trường đại học nào."));
    }

    @Transactional
    public LessonResponse createLesson(Long chapterId, LessonCreateRequest request, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        Chapter chapter = chapterRepository.findByIdAndTrialProgram_University_Id(chapterId, university.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Chương ID: " + chapterId + " hoặc bạn không có quyền."));

        Lesson lesson = modelMapper.map(request, Lesson.class);
        lesson.setChapter(chapter);

        // SỬA ĐỔI: Ưu tiên xử lý video file nếu có
        MultipartFile videoFile = request.getVideoFile();
        if (videoFile != null && !videoFile.isEmpty()) {
            log.info("Bắt đầu tải video lên cho bài học mới.");
            // Cloudinary sẽ tự nhận diện đây là video với resource_type: "auto"
            String folder = "edu_trial/lessons/videos";
            String uploadedVideoUrl = cloudinaryUploadService.uploadFile(videoFile, folder);
            lesson.setVideoUrl(uploadedVideoUrl);
        }

        Lesson savedLesson = lessonRepository.save(lesson);
        log.info("Đã tạo bài học mới '{}' cho chương '{}'", savedLesson.getTitle(), chapter.getName());
        return lessonMapper.toLessonResponse(savedLesson);
    }

    @Transactional
    public LessonResponse updateLesson(Long lessonId, LessonUpdateRequest request, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        Lesson lessonToUpdate = lessonRepository.findByIdAndChapter_TrialProgram_University_Id(lessonId, university.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Bài học ID: " + lessonId + " hoặc bạn không có quyền."));

        // SỬA ĐỔI: Tách logic cập nhật metadata và video
        // Cập nhật các trường text
        modelMapper.map(request, lessonToUpdate);

        // Xử lý video
        MultipartFile newVideoFile = request.getVideoFile();
        if (newVideoFile != null && !newVideoFile.isEmpty()) {
            // Xóa video cũ trên Cloudinary trước khi tải lên video mới
            deleteVideoFromCloudinary(lessonToUpdate.getVideoUrl());

            log.info("Bắt đầu tải video mới lên cho bài học ID: {}", lessonId);
            String folder = "edu_trial/lessons/videos";
            String newVideoUrl = cloudinaryUploadService.uploadFile(newVideoFile, folder);
            lessonToUpdate.setVideoUrl(newVideoUrl);

        } else if (Boolean.TRUE.equals(request.getRemoveCurrentVideo())) {
            // Nếu người dùng muốn xóa video hiện tại
            deleteVideoFromCloudinary(lessonToUpdate.getVideoUrl());
            lessonToUpdate.setVideoUrl(null); // Set URL trong DB thành null
        }

        Lesson updatedLesson = lessonRepository.save(lessonToUpdate);
        return lessonMapper.toLessonResponse(updatedLesson);
    }

    @Transactional
    public void deleteLesson(Long lessonId, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        Lesson lessonToDelete = lessonRepository.findByIdAndChapter_TrialProgram_University_Id(lessonId, university.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Bài học ID: " + lessonId + " hoặc bạn không có quyền."));

        // SỬA ĐỔI: Xóa video liên quan trên Cloudinary trước khi xóa bài học
        deleteVideoFromCloudinary(lessonToDelete.getVideoUrl());

        lessonRepository.delete(lessonToDelete);
        log.info("Đã xóa bài học ID: {}", lessonId);
    }

    @Transactional(readOnly = true)
    public Page<LessonResponse> getLessonsByChapter(Long chapterId, Pageable pageable) {
        if (!chapterRepository.existsById(chapterId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Chương ID: " + chapterId);
        }
        return lessonRepository.findByChapterId(chapterId, pageable)
                .map(lessonMapper::toLessonResponse);
    }

    @Transactional(readOnly = true)
    public LessonResponse getLessonById(Long lessonId) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Bài học ID: " + lessonId));
        return lessonMapper.toLessonResponse(lesson);
    }

    private void deleteVideoFromCloudinary(String videoUrl) {
        if (StringUtils.hasText(videoUrl) && videoUrl.contains("res.cloudinary.com")) {
            String publicId = cloudinaryUploadService.extractPublicIdFromUrl(videoUrl);
            if(publicId != null) {
                // Thêm tùy chọn resource_type là "video" để Cloudinary xóa đúng file
                cloudinaryUploadService.deleteFileByPublicId(publicId, "video");
            }
        }
    }
}