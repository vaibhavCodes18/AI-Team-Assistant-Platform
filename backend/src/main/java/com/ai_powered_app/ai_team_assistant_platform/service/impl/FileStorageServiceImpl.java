package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.config.StorageProperties;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.FileStorageService;
import com.nimbusds.jose.util.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final StorageProperties storageProperties;

    public FileStorageServiceImpl(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    @Override
    public String storeFile(MultipartFile file, Long workspaceId) {
            try {

                String fileName =
                        UUID.randomUUID() +
                                "_" +
                                file.getOriginalFilename();

                Path workspaceDirectory =
                        Paths.get(
                                storageProperties.getDocumentPath(),
                                "workspace-" + workspaceId
                        );

                Files.createDirectories(workspaceDirectory);

                Path targetLocation =
                        workspaceDirectory.resolve(fileName);

                Files.copy(
                        file.getInputStream(),
                        targetLocation,
                        StandardCopyOption.REPLACE_EXISTING
                );

                return targetLocation.toString();

            } catch (IOException e) {
                throw new ResourceNotFoundException(e.getMessage());
            }
    }

    @Override
    public void deleteFile(String path) {

    }

    @Override
    public Resource loadFile(String path) {
        return null;
    }
}
