package com.fpt.edu_trial.service;

import com.fpt.edu_trial.dto.request.ConsultationRequestCreateRequest;
import com.fpt.edu_trial.entity.ConsultationRequest;
import com.fpt.edu_trial.entity.TrialProgram;
import com.fpt.edu_trial.entity.University;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.enums.ConsultationStatus;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.repository.ConsultationRequestRepository;
import com.fpt.edu_trial.repository.TrialProgramRepository;
import com.fpt.edu_trial.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConsultationService {

    private final ConsultationRequestRepository consultationRepository;
    private final TrialProgramRepository trialProgramRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public void createConsultationRequest(ConsultationRequestCreateRequest request, UserDetails currentUser) {
        log.info("Nhận được yêu cầu tư vấn mới từ email: {}", request.getEmail());

        // 1. Tìm khóa học thử để xác định trường đại học
        TrialProgram trialProgram = trialProgramRepository.findById(request.getTrialProgramId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy khóa học thử với ID: " + request.getTrialProgramId()));

        University university = trialProgram.getUniversity();
        if (university == null || !StringUtils.hasText(university.getEmail())) {
            log.error("Khóa học thử ID {} không liên kết với trường hoặc trường không có email.", trialProgram.getId());
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể gửi yêu cầu tư vấn tại thời điểm này.");
        }

        // 2. Tạo và lưu đơn đăng ký vào database
        ConsultationRequest consultation = ConsultationRequest.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .aspiration(request.getAspiration())
                .trialProgram(trialProgram)
                .university(university)
                .status(ConsultationStatus.NEW)
                .build();

        // Nếu người dùng đã đăng nhập, liên kết đơn với tài khoản của họ
        if (currentUser != null) {
            userRepository.findByEmail(currentUser.getUsername())
                    .ifPresent(consultation::setUser);
        }

        consultationRepository.save(consultation);
        log.info("Đã lưu đơn đăng ký tư vấn mới với ID: {}", consultation.getId());

        // 3. Gửi email bất đồng bộ đến trường đại học
        String universityEmail = university.getEmail();
        String subject = "[EDU TRIAL] Yêu cầu tư vấn mới từ học sinh " + request.getFullName();
        String emailContent = buildConsultationEmailToUniversity(request, trialProgram, university);

        emailService.sendHtmlEmail(universityEmail, subject, emailContent);
        log.info("Đã gửi email yêu cầu tư vấn đến: {}", universityEmail);
    }

    /**
     * SỬA ĐỔI: Sử dụng mẫu HTML chuyên nghiệp hơn
     */
    private String buildConsultationEmailToUniversity(ConsultationRequestCreateRequest request, TrialProgram program, University university) {
        String aspirationText = StringUtils.hasText(request.getAspiration()) ? request.getAspiration() : "Không có nguyện vọng cụ thể.";

        return "<!DOCTYPE html>"
                + "<html lang=\"vi\">"
                + "<head><meta charset=\"UTF-8\"></head>"
                + "<body style=\"margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6;\">"
                + "    <table align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);\">"
                + "        <tr>"
                + "            <td align=\"center\" style=\"padding: 20px 0; background-color: #4A90E2; color: #ffffff; border-top-left-radius: 8px; border-top-right-radius: 8px;\">"
                + "                <h1 style=\"margin: 0; font-size: 24px;\">EDU TRIAL</h1>"
                + "                <p style=\"margin: 5px 0 0; font-size: 16px;\">Yêu Cầu Tư Vấn Mới</p>"
                + "            </td>"
                + "        </tr>"
                + "        <tr>"
                + "            <td style=\"padding: 30px 40px;\">"
                + "                <h2 style=\"font-size: 20px; color: #333333; margin-top: 0;\">Kính gửi Ban Tuyển sinh " + university.getName() + ",</h2>"
                + "                <p style=\"font-size: 16px; color: #555555; line-height: 1.6;\">"
                + "                    Bạn vừa nhận được một yêu cầu tư vấn tuyển sinh mới từ nền tảng EduTrial. Dưới đây là thông tin chi tiết của học sinh:"
                + "                </p>"
                + "                <table width=\"100%\" border=\"0\" cellspacing=\"0\" cellpadding=\"0\" style=\"margin-top: 20px; border-collapse: collapse;\">"
                + "                    <tr style=\"border-bottom: 1px solid #eeeeee;\">"
                + "                        <td style=\"padding: 12px 0; font-size: 16px; color: #333333; font-weight: bold; width: 160px;\">Họ và tên:</td>"
                + "                        <td style=\"padding: 12px 0; font-size: 16px; color: #555555;\">" + request.getFullName() + "</td>"
                + "                    </tr>"
                + "                    <tr style=\"border-bottom: 1px solid #eeeeee;\">"
                + "                        <td style=\"padding: 12px 0; font-size: 16px; color: #333333; font-weight: bold;\">Email:</td>"
                + "                        <td style=\"padding: 12px 0; font-size: 16px; color: #555555;\">" + request.getEmail() + "</td>"
                + "                    </tr>"
                + "                    <tr style=\"border-bottom: 1px solid #eeeeee;\">"
                + "                        <td style=\"padding: 12px 0; font-size: 16px; color: #333333; font-weight: bold;\">Số điện thoại:</td>"
                + "                        <td style=\"padding: 12px 0; font-size: 16px; color: #555555;\">" + request.getPhone() + "</td>"
                + "                    </tr>"
                + "                    <tr style=\"border-bottom: 1px solid #eeeeee;\">"
                + "                        <td style=\"padding: 12px 0; font-size: 16px; color: #333333; font-weight: bold;\">Khóa học quan tâm:</td>"
                + "                        <td style=\"padding: 12px 0; font-size: 16px; color: #555555;\">" + program.getName() + "</td>"
                + "                    </tr>"
                + "                    <tr>"
                + "                        <td style=\"padding: 12px 0; font-size: 16px; color: #333333; font-weight: bold; vertical-align: top;\">Nguyện vọng:</td>"
                + "                        <td style=\"padding: 12px 0; font-size: 16px; color: #555555; line-height: 1.6;\">" + aspirationText + "</td>"
                + "                    </tr>"
                + "                </table>"
                + "                <p style=\"font-size: 16px; color: #555555; line-height: 1.6; margin-top: 30px;\">"
                + "                    Vui lòng chủ động liên hệ với học sinh này trong thời gian sớm nhất để hỗ trợ."
                + "                </p>"
                + "            </td>"
                + "        </tr>"
                + "        <tr>"
                + "            <td align=\"center\" style=\"padding: 20px 40px; background-color: #f4f7f6; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;\">"
                + "                <p style=\"margin: 0; font-size: 12px; color: #999999;\">"
                + "                    Đây là email tự động từ hệ thống EduTrial. Vui lòng không trả lời trực tiếp email này."
                + "                </p>"
                + "                <p style=\"margin: 5px 0 0; font-size: 12px; color: #999999;\">"
                + "                    &copy; " + java.time.Year.now().getValue() + " EduTrial. All rights reserved."
                + "                </p>"
                + "            </td>"
                + "        </tr>"
                + "    </table>"
                + "</body>"
                + "</html>";
    }
}
