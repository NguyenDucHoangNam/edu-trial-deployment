package com.fpt.edu_trial.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fpt.edu_trial.dto.request.UniversityCreateRequest;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;

@Configuration
public class WebConverterConfig {

    private static final Logger log = LoggerFactory.getLogger(WebConverterConfig.class);

    @Bean
    public Converter<String, UniversityCreateRequest> stringToUniversityCreateRequestConverter(ObjectMapper objectMapper) {
        return new Converter<String, UniversityCreateRequest>() {
            @Override
            public UniversityCreateRequest convert(@NonNull String source) {
                log.debug("Attempting to convert source string to UniversityCreateRequest. Original source (first 100 chars): '{}'",
                        (source.length() > 100 ? source.substring(0, 100) + "..." : source));

                String cleanedSource = source.replace('\u00A0', ' ').trim();


                log.debug("Cleaned source string (first 100 chars): '{}'",
                        (cleanedSource.length() > 100 ? cleanedSource.substring(0, 100) + "..." : cleanedSource));

                if (cleanedSource.isEmpty() || !cleanedSource.startsWith("{") || !cleanedSource.endsWith("}")) {
                    log.warn("Cleaned source string is not a valid JSON structure: '{}'", cleanedSource);
                    throw new AppException(ErrorCode.INVALID_REQUEST_BODY_FORMAT, "Dữ liệu universityData không phải là định dạng JSON hợp lệ sau khi làm sạch.");
                }

                try {
                    return objectMapper.readValue(cleanedSource, UniversityCreateRequest.class);
                } catch (JsonProcessingException e) {
                    log.error("JsonProcessingException while converting string to UniversityCreateRequest: {}", e.getMessage(), e);
                    throw new AppException(ErrorCode.INVALID_REQUEST_BODY_FORMAT, "Lỗi parse JSON cho universityData: " + e.getMessage(), e);
                } catch (AppException e) {
                    throw e;
                } catch (Exception e) {
                    log.error("Unexpected exception while converting string to UniversityCreateRequest: {}", e.getMessage(), e);
                    throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi không mong muốn khi chuyển đổi universityData: " + e.getMessage(), e);
                }
            }
        };
    }
}
