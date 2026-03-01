package com.medical.auth.config;

import com.medical.auth.entity.User;
import com.medical.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Users already seeded — skipping DataInitializer");
            return;
        }

        List<User> users = List.of(
            User.builder().username("admin").password(passwordEncoder.encode("admin123")).role("ADMIN").build(),
            User.builder().username("doctor1").password(passwordEncoder.encode("doctor123")).role("DOCTOR").build(),
            User.builder().username("receptionist1").password(passwordEncoder.encode("recep123")).role("RECEPTIONIST").build(),
            User.builder().username("pharmacist1").password(passwordEncoder.encode("pharma123")).role("PHARMACIST").build(),
            User.builder().username("labtech1").password(passwordEncoder.encode("lab123")).role("LAB_TECH").build()
        );

        userRepository.saveAll(users);
        log.info("Seeded {} test users", users.size());
    }
}
