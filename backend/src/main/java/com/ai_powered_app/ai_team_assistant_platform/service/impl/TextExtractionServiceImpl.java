package com.ai_powered_app.ai_team_assistant_platform.service.impl;

import com.ai_powered_app.ai_team_assistant_platform.exception.ResourceNotFoundException;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.FileStorageService;
import com.ai_powered_app.ai_team_assistant_platform.service.interfaces.TextExtractionService;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
@Slf4j
public class TextExtractionServiceImpl implements TextExtractionService {

    @Override
    public String extractText(String filePath) {
        try {

            if (filePath == null || filePath.isBlank()) {
                throw new ResourceNotFoundException("File path cannot be null");
            }

            String lowerCasePath = filePath.toLowerCase();

            if (lowerCasePath.endsWith(".pdf")) {
                return extractPdfText(filePath);
            }

            if (lowerCasePath.endsWith(".txt")) {
                return extractTxtText(filePath);
            }

            throw new ResourceNotFoundException(
                    "Unsupported file type: " + filePath
            );

        } catch (Exception ex) {

            log.error(
                    "Failed to extract text from file={}",
                    filePath,
                    ex
            );

            throw new ResourceNotFoundException(
                    "Text extraction failed"
            );
        }
    }
    private String extractPdfText(String filePath)
            throws IOException {

        File file = new File(filePath);

        try (PDDocument document =
                     Loader.loadPDF(file)) {

            PDFTextStripper stripper =
                    new PDFTextStripper();

            return stripper.getText(document);
        }
    }
    private String extractTxtText(String filePath)
            throws IOException {

        return Files.readString(
                Path.of(filePath)
        );
    }
}
