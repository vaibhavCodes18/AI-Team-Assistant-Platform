package com.ai_powered_app.ai_team_assistant_platform.service.interfaces;

import com.nimbusds.jose.util.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(
            MultipartFile file,
            Long workspaceId
    );

    void deleteFile(String path);

    Resource loadFile(String path);
}
