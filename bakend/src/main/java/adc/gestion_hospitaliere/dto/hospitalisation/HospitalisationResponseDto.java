package adc.gestion_hospitaliere.dto.hospitalisation;
import adc.gestion_hospitaliere.Enums.ModeEntreeHospitalisation;
import adc.gestion_hospitaliere.Enums.ModeSortieHospitalisation;
import adc.gestion_hospitaliere.Enums.StatutHospitalisation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HospitalisationResponseDto {
    private Integer idHospitalisation;
    private String numeroAdmission;
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private Integer idChambre;
    private String chambreNumero;
    private Integer idMedecinResponsable;
    private String medecinNom;
    private String medecinPrenom;
    private LocalDateTime dateAdmission;
    private LocalDateTime dateSortie;
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
    private LocalDateTime dateCreation;
}
