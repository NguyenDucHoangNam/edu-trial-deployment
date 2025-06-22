package com.fpt.edu_trial.service;


import com.fpt.edu_trial.dto.request.ChapterCreateRequest;
import com.fpt.edu_trial.dto.request.ChapterUpdateRequest;
import com.fpt.edu_trial.dto.response.ChapterResponse;
import com.fpt.edu_trial.entity.Chapter;
import com.fpt.edu_trial.entity.TrialProgram;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.mapper.ChapterMapper;
import com.fpt.edu_trial.repository.ChapterRepository;
import com.fpt.edu_trial.repository.TrialProgramRepository;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class ChapterService {

    private final ChapterRepository chapterRepository;
    private final TrialProgramRepository trialProgramRepository;
    private final UniversityRepository universityRepository;
    private final UserRepository userRepository;
    private final ChapterMapper chapterMapper;
    private final ModelMapper modelMapper;

    private University getUniversityFromCurrentUser(UserDetails currentUserDetails) {
        User user = userRepository.findByEmail(currentUserDetails.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        return universityRepository.findByUserId(user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIVERSITY_NOT_FOUND, "Tài khoản của bạn chưa được liên kết với trường đại học nào."));
    }

    @Transactional
    public ChapterResponse createChapter(Long trialProgramId, ChapterCreateRequest request, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        TrialProgram trialProgram = trialProgramRepository.findByIdAndUniversityId(trialProgramId, university.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Chương trình học thử ID: " + trialProgramId + " hoặc bạn không có quyền."));

        Chapter chapter = modelMapper.map(request, Chapter.class);
        chapter.setTrialProgram(trialProgram);

        Chapter savedChapter = chapterRepository.save(chapter);
        log.info("Đã tạo chương mới '{}' cho chương trình '{}'", savedChapter.getName(), trialProgram.getName());
        return chapterMapper.toChapterResponse(savedChapter);
    }

    @Transactional
    public ChapterResponse updateChapter(Long chapterId, ChapterUpdateRequest request, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        Chapter chapterToUpdate = chapterRepository.findByIdAndTrialProgram_University_Id(chapterId, university.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Chương ID: " + chapterId + " hoặc bạn không có quyền."));

        modelMapper.map(request, chapterToUpdate);
        Chapter updatedChapter = chapterRepository.save(chapterToUpdate);
        return chapterMapper.toChapterResponse(updatedChapter);
    }

    @Transactional
    public void deleteChapter(Long chapterId, UserDetails currentUser) {
        University university = getUniversityFromCurrentUser(currentUser);
        Chapter chapterToDelete = chapterRepository.findByIdAndTrialProgram_University_Id(chapterId, university.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Chương ID: " + chapterId + " hoặc bạn không có quyền."));

        chapterRepository.delete(chapterToDelete);
        log.info("Đã xóa chương ID: {}", chapterId);
    }

    @Transactional(readOnly = true)
    public Page<ChapterResponse> getChaptersByProgram(Long trialProgramId, Pageable pageable) {
        if (!trialProgramRepository.existsById(trialProgramId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Chương trình học thử ID: " + trialProgramId);
        }
        return chapterRepository.findByTrialProgramId(trialProgramId, pageable)
                .map(chapterMapper::toChapterResponse);
    }

    @Transactional(readOnly = true)
    public ChapterResponse getChapterById(Long chapterId) {
        Chapter chapter = chapterRepository.findById(chapterId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy Chương ID: " + chapterId));
        return chapterMapper.toChapterResponse(chapter);
    }
}
