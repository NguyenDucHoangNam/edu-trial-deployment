package com.fpt.edu_trial.controller;

import com.fpt.edu_trial.dto.request.ConsultationRequestCreateRequest;
import com.fpt.edu_trial.dto.response.ApiResponse;
import com.fpt.edu_trial.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultation Management", description = "APIs for student consultation requests")
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping("/request")
    @Operation(summary = "Submit a new consultation request (Public)",
            description = "Allows any user (guest or logged-in) to submit a consultation request form.")
    public ResponseEntity<ApiResponse> createConsultationRequest(
            @Valid @RequestBody ConsultationRequestCreateRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {

        consultationService.createConsultationRequest(request, currentUser);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Yêu cầu tư vấn của bạn đã được gửi thành công! Trường đại học sẽ sớm liên hệ với bạn.")
                .build());
    }
}
