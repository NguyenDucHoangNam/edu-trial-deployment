package com.fpt.edu_trial.mapper;

import com.fpt.edu_trial.dto.response.ChapterResponse;
import com.fpt.edu_trial.entity.Chapter;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChapterMapper {

    private final ModelMapper modelMapper;

    public ChapterResponse toChapterResponse(Chapter chapter) {
        ChapterResponse response = modelMapper.map(chapter, ChapterResponse.class);
        if (chapter.getTrialProgram() != null) {
            response.setTrialProgramId(chapter.getTrialProgram().getId());
        }
        return response;
    }
}