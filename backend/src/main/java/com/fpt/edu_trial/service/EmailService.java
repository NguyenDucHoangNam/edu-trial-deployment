package com.fpt.edu_trial.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async; // Để gửi email bất đồng bộ
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context; // Nếu dùng Thymeleaf cho email template
import org.thymeleaf.spring6.SpringTemplateEngine; // Nếu dùng Thymeleaf

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    // private final SpringTemplateEngine thymeleafTemplateEngine; // Bỏ comment nếu bạn dùng Thymeleaf

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Async // Chạy bất đồng bộ để không block luồng chính
    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8"); // false: không phải multipart

            helper.setFrom(senderEmail); // Hoặc đặt một tên hiển thị: helper.setFrom(senderEmail, "EDU TRIAL Platform");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false); // false: không phải HTML

            mailSender.send(message);
            log.info("Email đơn giản đã được gửi tới: {}", to);
        } catch (MailException | MessagingException e) {
            log.error("Lỗi khi gửi email đơn giản tới {}: {}", to, e.getMessage());
            // Bạn có thể ném một custom exception ở đây nếu muốn xử lý ở tầng gọi
        }
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8"); // true: là multipart, cho phép HTML

            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true: nội dung là HTML

            mailSender.send(message);
            log.info("Email HTML đã được gửi tới: {}", to);
        } catch (MailException | MessagingException e) {
            log.error("Lỗi khi gửi email HTML tới {}: {}", to, e.getMessage());
        }
    }


    /*
    @Async
    public void sendEmailWithThymeleafTemplate(String to, String subject, String templateName, Map<String, Object> templateModel) {
        try {
            Context thymeleafContext = new Context();
            thymeleafContext.setVariables(templateModel);
            String htmlBody = thymeleafTemplateEngine.process("mail/" + templateName + ".html", thymeleafContext);

            sendHtmlEmail(to, subject, htmlBody);
            log.info("Email sử dụng template Thymeleaf '{}' đã được gửi tới: {}", templateName, to);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email với template Thymeleaf '{}' tới {}: {}", templateName, to, e.getMessage());
        }
    }
    */

    // --- Các phương thức tiện ích cho việc tạo nội dung email OTP ---

    public String buildOtpEmailContent(String userName, String otp) {
        // Đây là một ví dụ HTML đơn giản, bạn có thể làm phức tạp hơn hoặc dùng template
        return "<!DOCTYPE html>"
                + "<html lang='vi'>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "<title>Xác nhận Mã OTP</title>"
                + "<style>"
                + "  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }"
                + "  .container { max-width: 600px; margin: 20px auto; background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 0 15px rgba(0,0,0,0.1); }"
                + "  .header { text-align: center; margin-bottom: 20px; }"
                + "  .header h1 { color: #0056b3; margin:0; }"
                + "  .content p { margin-bottom: 15px; }"
                + "  .otp-code { font-size: 24px; font-weight: bold; color: #d9534f; text-align: center; padding: 10px; background-color: #f9f2f4; border-radius: 5px; margin: 20px 0; }"
                + "  .footer { text-align: center; margin-top: 30px; font-size: 0.9em; color: #777; }"
                + "  .footer p { margin: 5px 0; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "  <div class='container'>"
                + "    <div class='header'>"
                + "      <h1>Xác nhận Tài khoản EDU TRIAL</h1>"
                + "    </div>"
                + "    <div class='content'>"
                + "      <p>Xin chào " + userName + ",</p>"
                + "      <p>Cảm ơn bạn đã đăng ký tài khoản trên nền tảng EDU TRIAL. Vui lòng sử dụng mã OTP dưới đây để hoàn tất quá trình xác thực tài khoản của bạn. Mã OTP này sẽ có hiệu lực trong vòng <strong>1 phút</strong>.</p>"
                + "      <div class='otp-code'>" + otp + "</div>"
                + "      <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này một cách an toàn.</p>"
                + "      <p>Trân trọng,<br>Đội ngũ EDU TRIAL</p>"
                + "    </div>"
                + "    <div class='footer'>"
                + "      <p>&copy; " + java.time.Year.now().getValue() + " EDU TRIAL. Bảo lưu mọi quyền.</p>"
                // + "      <p><a href='https://your-website.com'>Website của chúng tôi</a> | <a href='mailto:" + senderEmail + "'>Liên hệ hỗ trợ</a></p>"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }
}
