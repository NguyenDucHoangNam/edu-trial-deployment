package com.fpt.edu_trial.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Slf4j
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.file-upload.resource-handler:/uploads/**}")
    private String fileResourceHandler;

    @Value("${app.file-upload.resource-locations:file:./uploads/}")
    private String fileResourceLocations;

    /**
     * Thêm các Interceptors tùy chỉnh.
     * Interceptors có thể được sử dụng để xử lý request trước khi đến controller
     * hoặc xử lý response sau khi controller thực thi.
     */
    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(new LoggingInterceptor())
                .addPathPatterns("/api/**") // Chỉ áp dụng cho các path bắt đầu bằng /api/
                .excludePathPatterns("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**"); // Loại trừ các path này
    }

    /**
     * Cấu hình Resource Handlers để phục vụ các tài nguyên tĩnh
     * như hình ảnh, CSS, JS hoặc các file được người dùng tải lên.
     * Điều này hữu ích nếu ứng dụng Spring Boot của bạn trực tiếp phục vụ các file này.
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        if (fileResourceLocations != null && !fileResourceLocations.isEmpty() &&
                fileResourceHandler != null && !fileResourceHandler.isEmpty()) {
            registry.addResourceHandler(fileResourceHandler)
                    .addResourceLocations(fileResourceLocations);
            log.info("Serving static files from handler '{}' at location '{}'", fileResourceHandler, fileResourceLocations);
        } else {
            log.warn("File resource handler or locations not configured. Static file serving for uploads is disabled.");
        }
    }

    // (Bạn có thể cần định nghĩa thêm các @Bean khác hoặc override các method khác của WebMvcConfigurer nếu cần)
    // Ví dụ:
    // @Override
    // public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
    //     // Tùy chỉnh message converters (ví dụ: thêm converter cho XML)
    // }

    // @Override
    // public void addFormatters(FormatterRegistry registry) {
    //     // Thêm các formatters tùy chỉnh (ví dụ: để chuyển đổi String sang Date với định dạng cụ thể)
    // }
}

/**
 * Một ví dụ đơn giản về Logging Interceptor.
 * Bạn nên tạo file riêng cho Interceptor này nếu logic phức tạp.
 */
@Slf4j
class LoggingInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler) throws Exception {
        log.info("[preHandle] Received request for URL: {} from IP: {}", request.getRequestURI(), request.getRemoteAddr());
        // Có thể trả về false để chặn request nếu cần
        return true;
    }

    @Override
    public void postHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, ModelAndView modelAndView) throws Exception {
        log.info("[postHandle] Processed request for URL: {} with status: {}", request.getRequestURI(), response.getStatus());
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull Object handler, Exception ex) throws Exception {
        if (ex != null) {
            log.error("[afterCompletion] Request for URL: {} completed with exception: {}", request.getRequestURI(), ex.getMessage());
        } else {
            log.info("[afterCompletion] Request for URL: {} completed successfully.", request.getRequestURI());
        }
    }
}
