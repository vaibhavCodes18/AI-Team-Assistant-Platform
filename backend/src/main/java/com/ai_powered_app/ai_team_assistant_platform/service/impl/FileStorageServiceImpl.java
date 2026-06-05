package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.config.StorageProperties;
import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
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
    public void deleteFile(String filePath) throws IOException {

        Path path = Paths.get(filePath);

        if (Files.exists(path)) {

            Files.delete(path);

            log.info(
                    "File deleted successfully: {}",
                    filePath
            );

        } else {

            log.warn(
                    "File not found: {}",
                    filePath
            );
        }
    }

    @Override
    public Resource loadFile(String filePath) {
        try {
            Path path = Paths.get(filePath);

            Resource resource = new UrlResource(
                    path.toUri()
            );

            if (!resource.exists()) {
                throw new ResourceNotFoundException(
                        "File not found"
                );
            }

            return resource;
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found");
        }
    }
}
