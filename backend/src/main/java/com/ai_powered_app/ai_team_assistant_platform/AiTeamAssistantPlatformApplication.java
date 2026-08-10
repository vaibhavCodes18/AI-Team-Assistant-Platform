package com.ai_powered_app.ai_team_assistant_platform;

import com.ai_powered_app.ai_team_assistant_platform.config.StorageProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@EnableConfigurationProperties(StorageProperties.class)
public class AiTeamAssistantPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(AiTeamAssistantPlatformApplication.class, args);
	}

}
