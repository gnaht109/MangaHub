package com.mangahub.backend.config;

import org.springframework.context.annotation.Configuration;

import io.github.cdimascio.dotenv.Dotenv;

@Configuration
public class EnvConfig {

    static {
        Dotenv dotenv = Dotenv.configure()
                .directory("../")
                .ignoreIfMissing()
                .load();

        setIfPresent(dotenv, "SPRING_DATASOURCE_URL");
        setIfPresent(dotenv, "SPRING_DATASOURCE_USERNAME");
        setIfPresent(dotenv, "SPRING_DATASOURCE_PASSWORD");
        setIfPresent(dotenv, "JWT_SECRET_KEY");
        setIfPresent(dotenv, "JWT_EXPIRATION");
    }

    private static void setIfPresent(Dotenv dotenv, String key) {
        String value = dotenv.get(key);
        if (value != null && !value.isBlank()) {
            System.setProperty(key, value);
        }
    }
}
