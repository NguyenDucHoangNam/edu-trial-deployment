package com.fpt.edu_trial.mapper;

import com.fpt.edu_trial.dto.response.LessonResponse;
import com.fpt.edu_trial.entity.Lesson;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LessonMapper {

    private final ModelMapper modelMapper;

    public LessonResponse toLessonResponse(Lesson lesson) {
        LessonResponse response = modelMapper.map(lesson, LessonResponse.class);
        if (lesson.getChapter() != null) {
            response.setChapterId(lesson.getChapter().getId());
        }
        return response;
    }
}