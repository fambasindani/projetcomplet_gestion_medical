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
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://127.0.0.1:3000"
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
                        // ===== PUBLIC =====
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ===== STATISTIQUES GLOBALES (spécifique) =====
                        .requestMatchers(HttpMethod.GET, "/api/statistiques").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.GET, "/api/*/statistiques").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")

                        // ===== SPECIALITES =====
                        .requestMatchers(HttpMethod.GET, "/api/specialites/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/specialites/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.PUT, "/api/specialites/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/specialites/**").hasAuthority("ADMIN")

                        // ===== MEDECINS =====
                        .requestMatchers(HttpMethod.GET, "/api/medecins/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/medecins/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/medecins/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/medecins/**").hasAuthority("ADMIN")

                        // ===== PATIENTS (avec s) =====
                        .requestMatchers(HttpMethod.GET, "/api/patients/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/patients/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/patients/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/patients/**").hasAuthority("ADMIN")

                        // ===== PATIENT (sans s) - pour compatibilité =====
                        .requestMatchers(HttpMethod.GET, "/api/patient/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/patient/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/patient/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/patient/**").hasAuthority("ADMIN")

                        // ===== RENDEZ-VOUS =====
                        .requestMatchers(HttpMethod.GET, "/api/rendezvous/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/rendezvous/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/rendezvous/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/rendezvous/**").hasAnyAuthority("ADMIN", "SECRETAIRE")

                        .requestMatchers("/api/planning/**")
                        .hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")

                        // ===== CONSULTATIONS =====
                        .requestMatchers(HttpMethod.GET, "/api/consultations/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/consultations/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.PUT, "/api/consultations/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/consultations/**").hasAuthority("ADMIN")


                        // ===== CHAMBRES =====
                        .requestMatchers(HttpMethod.GET, "/api/chambres/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/chambres/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/chambres/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.PATCH, "/api/chambres/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/chambres/**").hasAuthority("ADMIN")

                                // ===== RENDEZ-VOUS =====
                                .requestMatchers(HttpMethod.GET, "/api/rendezvous/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                                .requestMatchers(HttpMethod.POST, "/api/rendezvous/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                                .requestMatchers(HttpMethod.PUT, "/api/rendezvous/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                                .requestMatchers(HttpMethod.PATCH, "/api/rendezvous/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                                .requestMatchers(HttpMethod.DELETE, "/api/rendezvous/**").hasAnyAuthority("ADMIN", "SECRETAIRE")

                                     // ===== CONSULTATIONS =====
                                .requestMatchers(HttpMethod.GET, "/api/consultations/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                                .requestMatchers(HttpMethod.POST, "/api/consultations/**").hasAnyAuthority("ADMIN", "MEDECIN")
                                .requestMatchers(HttpMethod.PUT, "/api/consultations/**").hasAnyAuthority("ADMIN", "MEDECIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/consultations/**").hasAuthority("ADMIN")

                        // ===== HOSPITALISATIONS =====
                        .requestMatchers(HttpMethod.GET, "/api/hospitalisations/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/hospitalisations/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/hospitalisations/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/hospitalisations/**").hasAuthority("ADMIN")


                        .requestMatchers(HttpMethod.GET, "/api/constantes/**").hasAnyAuthority("ADMIN", "MEDECIN", "INFIRMIER", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/constantes/**").hasAnyAuthority("ADMIN", "MEDECIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.PUT, "/api/constantes/**").hasAnyAuthority("ADMIN", "MEDECIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.DELETE, "/api/constantes/**").hasAuthority("ADMIN")

                        // ===== PRESCRIPTIONS =====
                        .requestMatchers(HttpMethod.GET, "/api/prescriptions/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/prescriptions/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.PUT, "/api/prescriptions/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/prescriptions/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/prescriptions/**").hasAuthority("ADMIN")

                        // ===== CATEGORIES =====
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").hasAnyAuthority("ADMIN", "PHARMACIEN", "MEDECIN")
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAuthority("ADMIN")


                        // ===== MEDICAMENTS =====
                        .requestMatchers(HttpMethod.GET, "/api/medicaments/**").hasAnyAuthority("ADMIN", "PHARMACIEN", "MEDECIN")
                        .requestMatchers(HttpMethod.POST, "/api/medicaments/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.PUT, "/api/medicaments/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.DELETE, "/api/medicaments/**").hasAuthority("ADMIN")


                        // ===== FOURNISSEURS =====
                        .requestMatchers(HttpMethod.GET, "/api/fournisseurs/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.POST, "/api/fournisseurs/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.PUT, "/api/fournisseurs/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.DELETE, "/api/fournisseurs/**").hasAuthority("ADMIN")


                        // LOTS
                        .requestMatchers(HttpMethod.GET, "/api/lots/**").hasAnyAuthority("ADMIN", "PHARMACIEN", "MEDECIN")
                        .requestMatchers(HttpMethod.POST, "/api/lots/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.PUT, "/api/lots/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.DELETE, "/api/lots/**").hasAuthority("ADMIN")

                        // COMMANDES FOURNISSEURS (spécifique)
                        .requestMatchers(HttpMethod.GET, "/api/commandes-fournisseurs/**").hasAnyAuthority("ADMIN", "PHARMACIEN", "MEDECIN")
                        .requestMatchers(HttpMethod.POST, "/api/commandes-fournisseurs/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.PUT, "/api/commandes-fournisseurs/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.DELETE, "/api/commandes-fournisseurs/**").hasAuthority("ADMIN")

                        // ===== DELIVRANCES =====
                        .requestMatchers(HttpMethod.GET, "/api/delivrances/**").hasAnyAuthority("ADMIN", "PHARMACIEN", "MEDECIN")
                        .requestMatchers(HttpMethod.POST, "/api/delivrances/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.DELETE, "/api/delivrances/**").hasAuthority("ADMIN")


                        // ===== PERSONNEL =====
                        .requestMatchers(HttpMethod.GET, "/api/personnel/**").hasAnyAuthority("ADMIN", "RH", "MEDECIN")
                        .requestMatchers(HttpMethod.POST, "/api/personnel/**").hasAnyAuthority("ADMIN", "RH")
                        .requestMatchers(HttpMethod.PUT, "/api/personnel/**").hasAnyAuthority("ADMIN", "RH")
                        .requestMatchers(HttpMethod.PATCH, "/api/personnel/**").hasAnyAuthority("ADMIN", "RH")
                        .requestMatchers(HttpMethod.DELETE, "/api/personnel/**").hasAuthority("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/categories-examen/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/categories-examen/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories-examen/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories-examen/**").hasAuthority("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/examens/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.POST, "/api/examens/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.PUT, "/api/examens/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/examens/**").hasAuthority("ADMIN")

                        // ===== DOSSIER MEDICAL (spécifique avant /api/patients/**) =====
                        .requestMatchers(HttpMethod.GET, "/api/patients/{patientId}/dossier-medical")
                        .hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE")

                        // Soins infirmiers
                        .requestMatchers(HttpMethod.GET, "/api/soins-infirmiers/**").hasAnyAuthority("ADMIN", "MEDECIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.POST, "/api/soins-infirmiers/**").hasAnyAuthority("ADMIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.PUT, "/api/soins-infirmiers/**").hasAnyAuthority("ADMIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.DELETE, "/api/soins-infirmiers/**").hasAuthority("ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/soins-prescriptions/**").hasAnyAuthority("ADMIN", "MEDECIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.POST, "/api/soins-prescriptions/**").hasAnyAuthority("ADMIN", "MEDECIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.PUT, "/api/soins-prescriptions/**").hasAnyAuthority("ADMIN", "MEDECIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.DELETE, "/api/soins-prescriptions/**").hasAuthority("ADMIN")

                        // ===== SOINS INFIRMIERS (hospitalisation) =====
                        .requestMatchers(HttpMethod.GET, "/api/soins-infirmiers/**").hasAnyAuthority("ADMIN", "MEDECIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.POST, "/api/soins-infirmiers/**").hasAnyAuthority("ADMIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.PUT, "/api/soins-infirmiers/**").hasAnyAuthority("ADMIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.DELETE, "/api/soins-infirmiers/**").hasAuthority("ADMIN")

                        // Alertes stock
                        .requestMatchers(HttpMethod.GET, "/api/alertes-stock/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.PATCH, "/api/alertes-stock/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.POST, "/api/alertes-stock/**").hasAuthority("ADMIN")

                        // ===== INVENTAIRES =====
                        .requestMatchers(HttpMethod.GET, "/api/inventaires/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.POST, "/api/inventaires/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.PATCH, "/api/inventaires/**").hasAnyAuthority("ADMIN", "PHARMACIEN")
                        .requestMatchers(HttpMethod.DELETE, "/api/inventaires/**").hasAuthority("ADMIN")

                        // ===== FACTURATION =====
                        .requestMatchers(HttpMethod.GET, "/api/actes-medicaux/**").hasAnyAuthority("ADMIN", "SECRETAIRE", "MEDECIN")
                        .requestMatchers(HttpMethod.POST, "/api/actes-medicaux/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/actes-medicaux/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/actes-medicaux/**").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/factures/**").hasAnyAuthority("ADMIN", "SECRETAIRE", "MEDECIN")
                        .requestMatchers(HttpMethod.POST, "/api/factures/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/factures/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.PATCH, "/api/factures/**").hasAnyAuthority("ADMIN", "SECRETAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/factures/**").hasAuthority("ADMIN")

                        // ===== NOTIFICATIONS =====
                        .requestMatchers("/api/notifications/**")
                        .hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE", "PHARMACIEN", "RH", "INFIRMIER")

                        // ===== URGENCES =====
                        .requestMatchers(HttpMethod.GET, "/api/urgences/**").hasAnyAuthority("ADMIN", "MEDECIN", "SECRETAIRE", "INFIRMIER")
                        .requestMatchers(HttpMethod.POST, "/api/urgences/**").hasAnyAuthority("ADMIN", "MEDECIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.PUT, "/api/urgences/**").hasAnyAuthority("ADMIN", "MEDECIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/urgences/**").hasAnyAuthority("ADMIN", "MEDECIN", "INFIRMIER")
                        .requestMatchers(HttpMethod.DELETE, "/api/urgences/**").hasAuthority("ADMIN")

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}