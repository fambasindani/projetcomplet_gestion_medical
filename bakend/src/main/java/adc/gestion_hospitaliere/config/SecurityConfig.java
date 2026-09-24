package adc.gestion_hospitaliere.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Sécurité basée sur les permissions RBAC.
 * Chaque endpoint exige une permission (VOIR pour la lecture, GERER pour les écritures).
 * Les autorités de permission sont injectées par CustomUserDetailsService.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // En développement, on autorise tout port localhost (3000, 3001, ...).
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:[*]",
                "http://127.0.0.1:[*]"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ===== AUTH =====
                        .requestMatchers("/api/auth/change-password").authenticated()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ===== ADMINISTRATION (utilisateurs + rôles/permissions) =====
                        .requestMatchers("/api/admin/**").hasAuthority("UTILISATEURS_GERER")

                        // ===== SPECIALITES =====
                        .requestMatchers(HttpMethod.GET, "/api/specialites/**").hasAuthority("SPECIALITES_VOIR")
                        .requestMatchers("/api/specialites/**").hasAuthority("SPECIALITES_GERER")

                        // ===== MEDECINS =====
                        .requestMatchers(HttpMethod.GET, "/api/medecins/**").hasAuthority("MEDECINS_VOIR")
                        .requestMatchers("/api/medecins/**").hasAuthority("MEDECINS_GERER")

                        // ===== PATIENTS =====
                        .requestMatchers(HttpMethod.GET, "/api/patients/**").hasAuthority("PATIENTS_VOIR")
                        .requestMatchers(HttpMethod.POST, "/api/patients/**").hasAuthority("PATIENTS_AJOUTER")
                        .requestMatchers(HttpMethod.PUT, "/api/patients/**").hasAuthority("PATIENTS_MODIFIER")
                        .requestMatchers(HttpMethod.DELETE, "/api/patients/**").hasAuthority("PATIENTS_SUPPRIMER")
                        .requestMatchers(HttpMethod.GET, "/api/patient/**").hasAuthority("PATIENTS_VOIR")
                        .requestMatchers(HttpMethod.POST, "/api/patient/**").hasAuthority("PATIENTS_AJOUTER")
                        .requestMatchers(HttpMethod.PUT, "/api/patient/**").hasAuthority("PATIENTS_MODIFIER")
                        .requestMatchers(HttpMethod.DELETE, "/api/patient/**").hasAuthority("PATIENTS_SUPPRIMER")

                        // ===== RENDEZ-VOUS / PLANNING =====
                        .requestMatchers(HttpMethod.GET, "/api/rendezvous/**").hasAuthority("RENDEZ_VOUS_VOIR")
                        .requestMatchers("/api/rendezvous/**").hasAuthority("RENDEZ_VOUS_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/planning/**").hasAuthority("RENDEZ_VOUS_VOIR")
                        .requestMatchers("/api/planning/**").hasAuthority("RENDEZ_VOUS_GERER")

                        // ===== CONSULTATIONS =====
                        .requestMatchers(HttpMethod.GET, "/api/consultations/**").hasAuthority("CONSULTATIONS_VOIR")
                        .requestMatchers("/api/consultations/**").hasAuthority("CONSULTATIONS_GERER")

                        // ===== CHAMBRES =====
                        .requestMatchers(HttpMethod.GET, "/api/chambres/**").hasAuthority("CHAMBRES_VOIR")
                        .requestMatchers("/api/chambres/**").hasAuthority("CHAMBRES_GERER")

                        // ===== HOSPITALISATIONS =====
                        .requestMatchers(HttpMethod.GET, "/api/hospitalisations/**").hasAuthority("HOSPITALISATIONS_VOIR")
                        .requestMatchers("/api/hospitalisations/**").hasAuthority("HOSPITALISATIONS_GERER")

                        // ===== INTERVENTIONS (bloc opératoire) =====
                        .requestMatchers(HttpMethod.GET, "/api/interventions/**").hasAuthority("HOSPITALISATIONS_VOIR")

                        // ===== CONSTANTES =====
                        .requestMatchers(HttpMethod.GET, "/api/constantes/**").hasAuthority("CONSTANTES_VOIR")
                        .requestMatchers("/api/constantes/**").hasAuthority("CONSTANTES_GERER")

                        // ===== PRESCRIPTIONS =====
                        .requestMatchers(HttpMethod.GET, "/api/prescriptions/**").hasAuthority("PRESCRIPTIONS_VOIR")
                        .requestMatchers("/api/prescriptions/**").hasAuthority("PRESCRIPTIONS_GERER")

                        // ===== PHARMACIE =====
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").hasAuthority("PHARMACIE_VOIR")
                        .requestMatchers("/api/categories/**").hasAuthority("PHARMACIE_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/medicaments/**").hasAuthority("PHARMACIE_VOIR")
                        .requestMatchers("/api/medicaments/**").hasAuthority("PHARMACIE_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/fournisseurs/**").hasAuthority("PHARMACIE_VOIR")
                        .requestMatchers("/api/fournisseurs/**").hasAuthority("PHARMACIE_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/lots/**").hasAuthority("PHARMACIE_VOIR")
                        .requestMatchers("/api/lots/**").hasAuthority("PHARMACIE_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/commandes-fournisseurs/**").hasAuthority("PHARMACIE_VOIR")
                        .requestMatchers("/api/commandes-fournisseurs/**").hasAuthority("PHARMACIE_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/delivrances/**").hasAuthority("PHARMACIE_VOIR")
                        .requestMatchers("/api/delivrances/**").hasAuthority("PHARMACIE_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/inventaires/**").hasAuthority("PHARMACIE_VOIR")
                        .requestMatchers("/api/inventaires/**").hasAuthority("PHARMACIE_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/alertes-stock/**").hasAuthority("PHARMACIE_VOIR")
                        .requestMatchers("/api/alertes-stock/**").hasAuthority("PHARMACIE_GERER")

                        // ===== PERSONNEL =====
                        .requestMatchers(HttpMethod.GET, "/api/personnel/**").hasAuthority("PERSONNEL_VOIR")
                        .requestMatchers("/api/personnel/**").hasAuthority("PERSONNEL_GERER")

                        // ===== EXAMENS / CATEGORIES EXAMEN =====
                        .requestMatchers(HttpMethod.GET, "/api/categories-examen/**").hasAuthority("CATEGORIES_EXAMEN_VOIR")
                        .requestMatchers("/api/categories-examen/**").hasAuthority("CATEGORIES_EXAMEN_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/examens/**").hasAuthority("EXAMENS_VOIR")
                        .requestMatchers("/api/examens/**").hasAuthority("EXAMENS_GERER")

                        // ===== SOINS =====
                        .requestMatchers(HttpMethod.GET, "/api/soins-infirmiers/**").hasAuthority("SOINS_VOIR")
                        .requestMatchers("/api/soins-infirmiers/**").hasAuthority("SOINS_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/soins-prescriptions/**").hasAuthority("SOINS_VOIR")
                        .requestMatchers("/api/soins-prescriptions/**").hasAuthority("SOINS_GERER")

                        // ===== FACTURATION =====
                        .requestMatchers(HttpMethod.GET, "/api/actes-medicaux/**").hasAuthority("FACTURATION_VOIR")
                        .requestMatchers("/api/actes-medicaux/**").hasAuthority("FACTURATION_GERER")
                        .requestMatchers(HttpMethod.GET, "/api/factures/**").hasAuthority("FACTURATION_VOIR")
                        .requestMatchers("/api/factures/**").hasAuthority("FACTURATION_GERER")

                        // ===== NOTIFICATIONS =====
                        .requestMatchers("/api/notifications/**").hasAuthority("NOTIFICATIONS_VOIR")

                        // ===== URGENCES =====
                        .requestMatchers(HttpMethod.GET, "/api/urgences/**").hasAuthority("URGENCES_VOIR")
                        .requestMatchers("/api/urgences/**").hasAuthority("URGENCES_GERER")

                        // ===== ACTES CATALOGUE (prescriptions / examens / facturation) =====
                        .requestMatchers(HttpMethod.GET, "/api/actes-catalogue/**")
                        .hasAnyAuthority("FACTURATION_VOIR", "PRESCRIPTIONS_VOIR", "EXAMENS_VOIR",
                                "CATALOGUE_VOIR", "CATALOGUE_GERER")
                        .requestMatchers("/api/actes-catalogue/**")
                        .hasAnyAuthority("CATALOGUE_GERER", "FACTURATION_GERER")

                        // ===== UPLOAD =====
                        .requestMatchers("/api/upload/**").authenticated()

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
