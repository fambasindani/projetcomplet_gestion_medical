-- Table admissions_urgences (module Urgences)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'admissions_urgences')
BEGIN
    CREATE TABLE admissions_urgences (
        id_admission_urgence    INT IDENTITY(1,1) NOT NULL,
        numero_admission        NVARCHAR(20) NOT NULL,
        id_patient              INT NOT NULL,
        id_medecin              INT NULL,
        date_arrivee            DATETIME2 NOT NULL,
        motif_urgent            NVARCHAR(MAX) NOT NULL,
        gravite                 NVARCHAR(50) NOT NULL DEFAULT 'Non_urgente',
        symptomes               NVARCHAR(MAX) NULL,
        tension_arterielle      NVARCHAR(20) NULL,
        pouls                   INT NULL,
        temperature             FLOAT NULL,
        saturation_oxygene      INT NULL,
        statut                  NVARCHAR(50) NOT NULL DEFAULT 'En_attente',
        date_prise_en_charge    DATETIME2 NULL,
        orientation             NVARCHAR(100) NULL,
        notes                   NVARCHAR(MAX) NULL,
        date_creation           DATETIME2 NOT NULL DEFAULT (getdate()),
        CONSTRAINT PK_admissions_urgences PRIMARY KEY (id_admission_urgence)
    );

    CREATE UNIQUE INDEX IX_admissions_urgences_numero_admission ON admissions_urgences (numero_admission);
    CREATE INDEX IX_admissions_urgences_id_patient ON admissions_urgences (id_patient);
    CREATE INDEX IX_admissions_urgences_id_medecin ON admissions_urgences (id_medecin);
    CREATE INDEX IX_admissions_urgences_statut ON admissions_urgences (statut);
END

-- Table interventions_urgences (module Urgences)
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'interventions_urgences')
BEGIN
    CREATE TABLE interventions_urgences (
        id_intervention_urgence INT IDENTITY(1,1) NOT NULL,
        numero_intervention     NVARCHAR(20) NOT NULL,
        id_patient              INT NOT NULL,
        id_admission_urgence    INT NULL,
        id_medecin_principal    INT NOT NULL,
        type_intervention       NVARCHAR(200) NOT NULL,
        date_intervention       DATETIME2 NOT NULL,
        lieu                    NVARCHAR(100) NULL,
        duree_prevue            INT NULL,
        actes_realises          NVARCHAR(MAX) NULL,
        materiel_utilise        NVARCHAR(MAX) NULL,
        complications           NVARCHAR(MAX) NULL,
        resultat                NVARCHAR(MAX) NULL,
        statut                  NVARCHAR(50) NOT NULL DEFAULT 'Planifiee',
        notes                   NVARCHAR(MAX) NULL,
        date_creation           DATETIME2 NOT NULL DEFAULT (getdate()),
        CONSTRAINT PK_interventions_urgences PRIMARY KEY (id_intervention_urgence)
    );

    CREATE UNIQUE INDEX IX_interventions_urgences_numero_intervention ON interventions_urgences (numero_intervention);
    CREATE INDEX IX_interventions_urgences_id_patient ON interventions_urgences (id_patient);
    CREATE INDEX IX_interventions_urgences_id_admission_urgence ON interventions_urgences (id_admission_urgence);
    CREATE INDEX IX_interventions_urgences_id_medecin_principal ON interventions_urgences (id_medecin_principal);
    CREATE INDEX IX_interventions_urgences_statut ON interventions_urgences (statut);
END
