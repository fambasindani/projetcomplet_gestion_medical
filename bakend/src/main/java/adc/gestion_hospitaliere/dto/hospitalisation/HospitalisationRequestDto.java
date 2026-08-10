package adc.gestion_hospitaliere.dto.hospitalisation;

import adc.gestion_hospitaliere.Enums.ModeEntreeHospitalisation;
import adc.gestion_hospitaliere.Enums.ModeSortieHospitalisation;
import adc.gestion_hospitaliere.Enums.StatutHospitalisation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalisationRequestDto {

    // Plus d'@NotBlank – le numéro d'admission peut être généré côté serveur
    @Size(max = 20)
    private String numeroAdmission;

    @NotNull
    private Integer idPatient;

    private Integer idChambre;

    @NotNull
    private Integer idMedecinResponsable;

    @NotNull
    private LocalDateTime dateAdmission;

    private LocalDateTime dateSortie;

    @NotBlank
    private String motifAdmission;

    private ModeEntreeHospitalisation modeEntree;

    private String provenance;

    private String diagnosticPrincipal;

    private String traitementsEnCours;

    private String examensRealises;

    private String regimeAlimentaire;

    private String consignesParticulieres;

    private StatutHospitalisation statut;

    private String notesSortie;

    private ModeSortieHospitalisation modeSortie;

    private String destinationSortie;
}