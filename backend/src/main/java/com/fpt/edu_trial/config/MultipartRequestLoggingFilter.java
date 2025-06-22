package com.fpt.edu_trial.config;


import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Part;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Enumeration;

@Component
@Order(Integer.MIN_VALUE)
public class MultipartRequestLoggingFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(MultipartRequestLoggingFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (request instanceof HttpServletRequest &&
                request.getContentType() != null &&
                request.getContentType().toLowerCase().startsWith("multipart/")) {

            HttpServletRequest httpRequest = (HttpServletRequest) request;
            log.info("==================== Multipart Request Details ====================");
            log.info("Request URI: {}", httpRequest.getRequestURI());
            log.info("Request Method: {}", httpRequest.getMethod());
            log.info("Overall Content-Type: {}", httpRequest.getContentType());

            // Log all headers
            Enumeration<String> headerNames = httpRequest.getHeaderNames();
            if (headerNames != null) {
                while (headerNames.hasMoreElements()) {
                    String headerName = headerNames.nextElement();
                    log.info("Header: {} = {}", headerName, httpRequest.getHeader(headerName));
                }
            }

            try {
                Collection<Part> parts = httpRequest.getParts();
                log.info("Number of parts: {}", parts.size());
                for (Part part : parts) {
                    log.info("--- Part ---");
                    log.info("Part Name: '{}'", part.getName());
                    log.info("Part Submitted File Name: '{}'", part.getSubmittedFileName());
                    log.info("Part Content-Type: '{}'", part.getContentType());
                    log.info("Part Size: {}", part.getSize());

                    if ("universityData".equals(part.getName()) && part.getSubmittedFileName() == null) {
                        try {
                            String partContent = new String(part.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                            log.info("Part 'universityData' Content (first 100 chars): '{}'",
                                    (partContent.length() > 100 ? partContent.substring(0, 100) + "..." : partContent));
                        } catch (Exception e) {
                            log.warn("Could not read content of part 'universityData': {}", e.getMessage());
                        }
                    }
                    Collection<String> partHeaderNames = part.getHeaderNames();
                    for (String partHeaderName : partHeaderNames) {
                        log.info("Part Header '{}': {}", partHeaderName, part.getHeader(partHeaderName));
                    }
                }
            } catch (IllegalStateException e) {
                log.warn("Could not get parts, request body might have been already read: {}", e.getMessage());
            } catch (ServletException e) {
                log.error("ServletException while getting parts: {}", e.getMessage());
                if (e.getRootCause() != null) {
                    log.error("Root cause: ", e.getRootCause());
                }
            } catch (IOException e) {
                log.error("IOException while getting parts: {}", e.getMessage());
            }
            log.info("=================================================================");
        }
        chain.doFilter(request, response);
    }
}
