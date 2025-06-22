package com.fpt.edu_trial.service;


import com.fpt.edu_trial.dto.request.LoginRequest;
import com.fpt.edu_trial.dto.request.OtpVerificationRequest;
import com.fpt.edu_trial.dto.request.RegistrationRequest;
import com.fpt.edu_trial.dto.response.AuthResponse;
import com.fpt.edu_trial.dto.response.UserProfileResponse;
import com.fpt.edu_trial.entity.Role;
import com.fpt.edu_trial.entity.User;
import com.fpt.edu_trial.enums.PredefinedRole;
import com.fpt.edu_trial.exception.AppException;
import com.fpt.edu_trial.exception.ErrorCode;
import com.fpt.edu_trial.repository.RoleRepository;
import com.fpt.edu_trial.repository.UserRepository;
import com.fpt.edu_trial.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final ModelMapper modelMapper;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 1;

    /**
     * Xử lý đăng ký người dùng mới.
     *
     * @param request Thông tin đăng ký từ client.
     * @return Thông điệp thành công.
     */
    @Transactional
    public String registerUser(RegistrationRequest request) {
        // 1. Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmailAndEnabledIsTrue(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        // 2. Nếu email đã tồn tại nhưng chưa xác thực → báo lỗi USER_NOT_VERIFIED
        if (userRepository.existsByEmailAndEnabledIsFalse(request.getEmail())) {
            throw new AppException(ErrorCode.USER_NOT_VERIFIED,
                    "Tài khoản đã được đăng ký nhưng chưa xác thực. Vui lòng kiểm tra email của bạn để lấy mã OTP.");
        }



        // 2. Lấy vai trò mặc định cho người dùng mới (ví dụ: USER)
        Role userRole = roleRepository.findByName(PredefinedRole.USER.getRoleName())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED,
                        "Vai trò mặc định " + PredefinedRole.USER.getRoleName() + " không tìm thấy."));

        // 3. Tạo đối tượng User từ RegistrationRequest
        User user = modelMapper.map(request, User.class);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(userRole);
        user.setEnabled(false); // Tài khoản chưa được kích hoạt cho đến khi xác thực OTP
        user.setName(request.getFirstName() + " " + request.getLastName()); // Tạo tên đầy đủ

        // 4. Tạo OTP và thời gian hết hạn
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));

        // 5. Lưu người dùng vào cơ sở dữ liệu
        User savedUser = userRepository.save(user);
        log.info("Người dùng mới đã được tạo (chưa kích hoạt): {}", savedUser.getEmail());

        // 6. Gửi email OTP
        // Bạn có thể tùy chỉnh tên người dùng trong email nếu muốn
        String emailContent = emailService.buildOtpEmailContent(savedUser.getFullName(), otp);
        emailService.sendHtmlEmail(savedUser.getEmail(), "Xác nhận Mã OTP Đăng ký EDU TRIAL", emailContent);
        log.info("Đã gửi OTP tới email: {}", savedUser.getEmail());

        return "Đăng ký thành công! Vui lòng kiểm tra email để nhận mã OTP và xác thực tài khoản.";
    }

    /**
     * Xác thực mã OTP và kích hoạt tài khoản người dùng.
     *
     * @param request Thông tin email và OTP từ client.
     * @return Thông điệp thành công.
     */
    @Transactional
    public String verifyOtp(OtpVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra OTP
        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new AppException(ErrorCode.OTP_INVALID);
        }

        // Kiểm tra thời gian hết hạn OTP
        if (user.getOtpExpiryDate() == null || user.getOtpExpiryDate().isBefore(LocalDateTime.now())) {
            // Xóa OTP cũ để tránh sử dụng lại
            user.setOtp(null);
            user.setOtpExpiryDate(null);
            userRepository.save(user);
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }

        // Xác thực thành công
        user.setEnabled(true);
        user.setOtp(null); // Xóa OTP sau khi đã sử dụng
        user.setOtpExpiryDate(null); // Xóa thời gian hết hạn OTP
        userRepository.save(user);
        log.info("Tài khoản {} đã được kích hoạt thành công.", user.getEmail());

        return "Xác thực OTP thành công! Tài khoản của bạn đã được kích hoạt.";
    }

    /**
     * Đăng nhập người dùng và trả về JWT token.
     *
     * @param request Thông tin đăng nhập từ client.
     * @return AuthResponse chứa token và thông tin người dùng.
     */
    public AuthResponse loginUser(LoginRequest request) {
        try {
            // 1. Xác thực người dùng bằng Spring Security AuthenticationManager
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // 2. Nếu xác thực thành công, thiết lập Authentication vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 3. Lấy thông tin UserDetails từ Authentication
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String username = userDetails.getUsername(); // Đây là email

            // 4. Tạo JWT token
            String jwtToken = jwtTokenProvider.generateToken(authentication); // Hoặc generateToken(username) tùy theo implement của JwtTokenProvider

            // 5. Lấy thông tin chi tiết của người dùng để trả về
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy thông tin người dùng sau khi đăng nhập."));

            // Kiểm tra tài khoản đã được kích hoạt chưa
            if (user.getEnabled() == null || !user.getEnabled()) {
                log.warn("Nỗ lực đăng nhập vào tài khoản chưa kích hoạt: {}", username);
                // Bạn có thể gửi lại OTP ở đây hoặc yêu cầu người dùng xác thực
                // throw new AppException(ErrorCode.ACCOUNT_DISABLED, "Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực OTP.");
                // Tạm thời, để đơn giản, chúng ta sẽ không cho đăng nhập nếu chưa kích hoạt
                throw new AppException(ErrorCode.ACCOUNT_DISABLED, "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email và xác thực OTP.");
            }

            UserProfileResponse userProfile = modelMapper.map(user, UserProfileResponse.class);
            userProfile.setRole(user.getRole().getName()); // Gán tên vai trò

            log.info("Người dùng {} đã đăng nhập thành công.", username);
            return new AuthResponse(jwtToken, "Đăng nhập thành công!", userProfile);

        } catch (BadCredentialsException e) {
            log.warn("Nỗ lực đăng nhập thất bại cho email {}: Sai thông tin đăng nhập", request.getEmail());
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không xác định trong quá trình đăng nhập cho email {}: {}", request.getEmail(), e.getMessage(), e);
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION, "Đã có lỗi xảy ra trong quá trình đăng nhập.");
        }
    }

    /**
     * (Tùy chọn) Gửi lại mã OTP nếu người dùng yêu cầu.
     *
     * @param email Email của người dùng cần gửi lại OTP.
     * @return Thông điệp thành công.
     */
    @Transactional
    public String resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getEnabled() != null && user.getEnabled()) {
            throw new AppException(ErrorCode.ACCOUNT_ALREADY_VERIFIED, "Tài khoản này đã được xác thực."); // Bạn cần thêm ErrorCode này
        }

        // Kiểm tra thời gian giữa các lần gửi OTP (nếu cần, để tránh spam)
        // Ví dụ: if (user.getOtpExpiryDate() != null && user.getOtpExpiryDate().isAfter(LocalDateTime.now().minusMinutes(1))) {
        //     throw new AppException(ErrorCode.OTP_SEND_LIMIT_EXCEEDED, "Vui lòng đợi một chút trước khi yêu cầu gửi lại OTP.");
        // }

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiryDate(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);

        String emailContent = emailService.buildOtpEmailContent(user.getFullName(), otp);
        emailService.sendHtmlEmail(user.getEmail(), "Mã OTP Mới cho EDU TRIAL", emailContent);
        log.info("Đã gửi lại OTP tới email: {}", user.getEmail());

        return "Mã OTP mới đã được gửi đến email của bạn. Vui lòng kiểm tra.";
    }


    /**
     * Tạo mã OTP ngẫu nhiên gồm các chữ số.
     *
     * @return Chuỗi OTP.
     */
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}
