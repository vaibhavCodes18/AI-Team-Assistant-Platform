package com.ai_powered_app.ai_team_assistant_platform.repository;

import com.ai_powered_app.ai_team_assistant_platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
