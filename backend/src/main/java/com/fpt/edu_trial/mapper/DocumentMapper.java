package com.fpt.edu_trial.mapper;

import com.fpt.edu_trial.dto.response.DocumentResponse;
import com.fpt.edu_trial.entity.NationalExamDocument;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DocumentMapper {

    private final ModelMapper modelMapper;

    public DocumentResponse toDocumentResponse(NationalExamDocument document) {
        return modelMapper.map(document, DocumentResponse.class);
    }
}
