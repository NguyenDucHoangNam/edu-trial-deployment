package com.fpt.edu_trial.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Value("${spring.application.name:EDU TRIAL API}")
    private String applicationName;

    @Value("${api.version:1.0.0}")
    private String apiVersion;

    @Value("${api.server.url:http://localhost:8080}")
    private String serverUrl;

    @Value("${api.server.description:Development Server}")
    private String serverDescription;


    @Bean
    public OpenAPI customOpenAPI() {
        Contact contact = new Contact();
        contact.setEmail("namnguyenduchoang@gmail.com");
        contact.setName("EDU TRIAL Support Team");
        contact.setUrl("https://your-project-website.com");

        License mitLicense = new License()
                .name("MIT License")
                .url("https://choosealicense.com/licenses/mit/");

        Info info = new Info()
                .title(applicationName)
                .version(apiVersion)
                .description("Tài liệu API cho Nền tảng EDU TRIAL - nơi các trường đại học đăng tải khóa học thử cho học sinh.")
                .contact(contact)
                .license(mitLicense);

        final String securitySchemeName = "bearerAuth";

        SecurityScheme bearerAuthScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");

        Server devServer = new Server();
        devServer.setUrl(serverUrl);
        devServer.setDescription(serverDescription);

        return new OpenAPI()
                .info(info)
                .servers(List.of(devServer /*, prodServer*/))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components().addSecuritySchemes(securitySchemeName, bearerAuthScheme));
    }
}
