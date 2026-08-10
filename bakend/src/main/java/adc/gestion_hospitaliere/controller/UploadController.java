package adc.gestion_hospitaliere.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final Logger logger = LoggerFactory.getLogger(UploadController.class);

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "medecins") String folder) {

        logger.info("Upload request: file={}, size={}, folder={}", file.getOriginalFilename(), file.getSize(), folder);

        try {
            // 1. Valider le dossier (anti traversée de chemin)
            String normalizedFolder = folder.replace("\\", "/").replaceAll("^\\.\\./", "").replaceAll("/\\.\\./", "/");
            if (!normalizedFolder.matches("[a-zA-Z0-9_-]+")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Dossier invalide"));
            }

            // 2. Valider fichier
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Aucun fichier fourni"));
            }

            // 3. Valider extension
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
            }
            if (!extension.matches("\\.(jpg|jpeg|png|gif)$")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Format non supporté. Utilisez JPG, PNG ou GIF."));
            }

            // 4. Valider taille (max 5 Mo)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("message", "Fichier trop volumineux (max 5MB)"));
            }

            // 5. Créer le dossier absolu
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path folderPath = uploadPath.resolve(normalizedFolder);
            if (!Files.exists(folderPath)) {
                Files.createDirectories(folderPath);
                logger.info("Dossier créé : {}", folderPath);
            }

            // 6. Générer un nom unique
            String uniqueFileName = UUID.randomUUID().toString() + extension;
            Path filePath = folderPath.resolve(uniqueFileName);

            // 7. Sauvegarder
            file.transferTo(filePath.toFile());
            logger.info("Fichier sauvegardé : {}", filePath);

            // 8. URL relative (pour le front-end)
            String fileUrl = "/uploads/" + normalizedFolder + "/" + uniqueFileName;

            return ResponseEntity.ok(Map.of(
                    "message", "Upload réussi",
                    "url", fileUrl,
                    "fileName", uniqueFileName,
                    "originalName", originalName,
                    "size", file.getSize()
            ));
        } catch (IOException e) {
            logger.error("Erreur I/O lors de l'upload", e);
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Erreur d'écriture du fichier",
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            logger.error("Erreur inattendue", e);
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Erreur interne",
                    "error", e.toString()
            ));
        }
    }
}