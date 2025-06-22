package com.fpt.edu_trial.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) 
public class AuthResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String refreshToken;
    private String message;
    private UserProfileResponse user;

    public AuthResponse(String accessToken, String message) {
        this.accessToken = accessToken;
        this.message = message;
    }

    public AuthResponse(String accessToken, String message, UserProfileResponse user) {
        this.accessToken = accessToken;
        this.message = message;
        this.user = user;
        // refreshToken và tokenType sẽ có giá trị mặc định (null và "Bearer")
    }

    public AuthResponse(String accessToken, String refreshToken, String message, UserProfileResponse user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.message = message;
        this.user = user;
    }
}
