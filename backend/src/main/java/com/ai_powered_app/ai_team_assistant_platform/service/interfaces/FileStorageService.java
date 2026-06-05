package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileStorageService {
    String storeFile(
            MultipartFile file,
            Long workspaceId
    );

    void deleteFile(String path) throws IOException;

    Resource loadFile(String path);
}
