package com.fpt.edu_trial.config;

import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@Slf4j
public class AsyncConfig implements AsyncConfigurer {

    private static final int CORE_POOL_SIZE = 5;
    private static final int MAX_POOL_SIZE = 10;
    private static final int QUEUE_CAPACITY = 25;
    private static final String THREAD_NAME_PREFIX = "AsyncEduTrial-";

    @Override
    @Bean(name = "asyncTaskExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(CORE_POOL_SIZE);
        executor.setMaxPoolSize(MAX_POOL_SIZE);
        executor.setQueueCapacity(QUEUE_CAPACITY);
        executor.setThreadNamePrefix(THREAD_NAME_PREFIX);
        executor.initialize(); // Khởi tạo executor
        log.info("Configured ThreadPoolTaskExecutor with corePoolSize={}, maxPoolSize={}, queueCapacity={}, threadNamePrefix={}",
                CORE_POOL_SIZE, MAX_POOL_SIZE, QUEUE_CAPACITY, THREAD_NAME_PREFIX);
        return executor;
    }

    /**
     * Tùy chỉnh cách xử lý các exception không được bắt (uncaught exceptions)
     * từ các phương thức @Async trả về void.
     */
    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncExceptionHandler();
    }

    /**
     * Lớp tùy chỉnh để xử lý các exception không được bắt trong tác vụ bất đồng bộ.
     */
    @Slf4j
    static class CustomAsyncExceptionHandler implements AsyncUncaughtExceptionHandler {
        @Override
        public void handleUncaughtException(@NonNull Throwable throwable,
                                            @NonNull Method method,
                                            @NonNull Object... obj) {
            log.error("Exception Cause: - {}", throwable.getMessage());
            log.error("Method name - {}", method.getName());
            for (Object param : obj) {
                log.error("Parameter value - {}", param);
            }
        }
    }
}
