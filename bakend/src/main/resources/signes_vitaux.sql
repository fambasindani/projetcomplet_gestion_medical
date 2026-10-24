-- Migration : module Signes vitaux (pré-consultation)
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'signes_vitaux')
BEGIN
    CREATE TABLE signes_vitaux (
        id_signe_vital INT IDENTITY(1,1) PRIMARY KEY,
        id_patient INT NOT NULL,
        id_personnel INT NULL,
        date_mesure DATETIME2 NOT NULL,
        poids DECIMAL(5,2) NULL,
        taille DECIMAL(5,2) NULL,
        imc DECIMAL(5,2) NULL,
        temperature DECIMAL(4,2) NULL,
        pouls INT NULL,
        pression_systolique INT NULL,
        pression_diastolique INT NULL,
        saturation INT NULL,
        frequence_respiratoire INT NULL,
        glycemie DECIMAL(5,2) NULL,
        douleur_echelle INT NULL,
        prise_par NVARCHAR(100) NULL,
        observations NVARCHAR(MAX) NULL,
        CONSTRAINT FK_signes_vitaux_patient FOREIGN KEY (id_patient) REFERENCES patients(id_patient),
        CONSTRAINT FK_signes_vitaux_personnel FOREIGN KEY (id_personnel) REFERENCES personnel(id_personnel)
    );
    CREATE INDEX IX_signes_vitaux_patient ON signes_vitaux(id_patient, date_mesure DESC);
END
