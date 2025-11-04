package hcmute.hackathon.vibecoders.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupRequestDto {
    @Email(message = "Email invalid format")
    @NotBlank(message = "Email must be not blank")
    @NotNull
    private String email;
    @NotBlank(message = "Password must be not blank")
    @Size(min = 6, message = "Password must be greater 6 ")
    private String password;

    @NotBlank(message = "Full Name must be not blank")
    private String fullName;

    //    @EnumValue(enumClass = Role.class, message = "Invalid role. Must be TOOL, DEV, BA or TESTER")
//    private String role;
}
