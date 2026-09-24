package adc.gestion_hospitaliere.dto.intervention;

import adc.gestion_hospitaliere.Enums.StatutIntervention;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InterventionResponseDto {
    private Integer idIntervention;
    private String numeroIntervention;
    private Integer idHospitalisation;
    private String numeroAdmission;
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private Integer idMedecinPrincipal;
    private String medecinPrincipalNom;
    private String medecinPrincipalPrenom;
    private String typeIntervention;
    private String descriptionPreop;
    private LocalDateTime dateIntervention;
    private Integer dureePrevue;
    private Integer dureeReelle;
    private String salleOperation;
    private String anesthesieType;
    private Integer idAnesthesiste;
    private String anesthesisteNom;
    private String compteRenduOperatoire;
    private String complications;
    private String resultat;
    private String suitesOperatoires;
    private StatutIntervention statut;
    private LocalDateTime dateAnnulation;
    private String motifAnnulation;
    private Boolean consentementSigne;
    private Boolean jeunRespecte;
    private String notesInfirmieres;
}
