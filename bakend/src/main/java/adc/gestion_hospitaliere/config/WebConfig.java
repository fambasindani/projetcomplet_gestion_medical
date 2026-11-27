package adc.gestion_hospitaliere.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mappe les requetes /uploads/** vers le dossier physique
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + Paths.get(uploadDir).toAbsolutePath().normalize() + "/");

        // Application React (Vite) embarquee dans le jar, servie sous /med :
        // le contenu de frontend-vite/dist est copie dans
        // src/main/resources/static/med avant le build.
        // Toute route inconnue sans extension renvoie index.html pour que le
        // routeur React (BrowserRouter basename="/med") prenne le relais
        // (rechargement F5 sur /med/patients, /med/examens/... etc.).
        registry.addResourceHandler("/med/**")
                .addResourceLocations("classpath:/static/med/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource index = new ClassPathResource("static/med/index.html");

                        // Normalise le chemin : "/" (requete /med/) et "" -> index.html
                        String path = resourcePath == null ? "" : resourcePath;
                        while (path.startsWith("/")) { path = path.substring(1); }
                        while (path.endsWith("/")) { path = path.substring(0, path.length() - 1); }

                        if (path.isEmpty()) {
                            return index.exists() ? index : null;
                        }

                        // Ne pas exposer les fichiers caches (.htaccess, .env...)
                        if (path.startsWith(".") || path.contains("/.")) {
                            return null;
                        }

                        Resource requested = location.createRelative(path);
                        if (requested.exists() && requested.isReadable()) {
                            return requested;
                        }
                        if (isSpaRoute(path)) {
                            return index.exists() ? index : null;
                        }
                        return null;
                    }
                });
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // L'application vit sous /med : la racine redirige vers /med/
        registry.addRedirectViewController("/", "/med/");
        registry.addRedirectViewController("/index.html", "/med/");
        registry.addRedirectViewController("/med", "/med/");
        // ResourceHttpRequestHandler ignore un chemin vide : on sert index.html
        // explicitement pour /med/ (l'URL reste /med/ dans le navigateur).
        registry.addViewController("/med/").setViewName("forward:/med/index.html");
    }

    /**
     * Vrai pour une route du routeur React (ex. "patients/nouveau") et non
     * pour un fichier statique ("assets/index-abc.js") ou le endpoint /error.
     */
    private boolean isSpaRoute(String resourcePath) {
        if (resourcePath == null || resourcePath.isEmpty()) {
            return false;
        }
        String path = resourcePath.startsWith("/") ? resourcePath.substring(1) : resourcePath;
        if ("error".equals(path)) {
            return false;
        }
        String lastSegment = path.substring(path.lastIndexOf('/') + 1);
        return !lastSegment.contains(".");
    }
}
