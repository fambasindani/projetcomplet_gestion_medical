-- Référentiel hiérarchique des actes médicaux : groupes (familles) + catalogue (sous-actes)
-- Catégorie -> Groupe (famille) -> Acte précis avec tarif par défaut

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'groupes_actes')
BEGIN
    CREATE TABLE groupes_actes (
        id_groupe   INT IDENTITY(1,1) NOT NULL,
        libelle     NVARCHAR(100) NOT NULL,
        categorie   NVARCHAR(20)  NOT NULL,
        description NVARCHAR(MAX) NULL,
        actif       BIT NOT NULL DEFAULT 1,
        date_creation DATETIME2 NOT NULL DEFAULT (getdate()),
        CONSTRAINT PK_groupes_actes PRIMARY KEY (id_groupe)
    );
    CREATE INDEX IX_groupes_actes_categorie ON groupes_actes (categorie);
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'actes_catalogue')
BEGIN
    CREATE TABLE actes_catalogue (
        id_acte_catalogue INT IDENTITY(1,1) NOT NULL,
        code              NVARCHAR(20)  NOT NULL UNIQUE,
        libelle           NVARCHAR(200) NOT NULL,
        id_groupe         INT NULL,
        prix_defaut       DECIMAL(10,2) NOT NULL DEFAULT 0,
        description       NVARCHAR(MAX) NULL,
        actif             BIT NOT NULL DEFAULT 1,
        date_creation     DATETIME2 NOT NULL DEFAULT (getdate()),
        CONSTRAINT PK_actes_catalogue PRIMARY KEY (id_acte_catalogue),
        CONSTRAINT FK_actes_catalogue_groupe FOREIGN KEY (id_groupe) REFERENCES groupes_actes (id_groupe)
    );
    CREATE INDEX IX_actes_catalogue_groupe ON actes_catalogue (id_groupe);
    CREATE INDEX IX_actes_catalogue_actif ON actes_catalogue (actif);
END
GO

-- ===== SEED : familles de la catégorie EXAMEN =====
IF NOT EXISTS (SELECT 1 FROM groupes_actes WHERE libelle = 'Radiologie' AND categorie = 'Examen')
BEGIN
    INSERT INTO groupes_actes (libelle, categorie, description) VALUES
    (N'Radiologie',   'Examen', N'Examens d''imagerie par rayons X'),
    (N'Scanner',      'Examen', N'Tomodensitométrie (TDM)'),
    (N'IRM',          'Examen', N'Imagerie par résonance magnétique'),
    (N'Échographie',  'Examen', N'Imagerie par ultrasons'),
    (N'Biologie',     'Examen', N'Analyses de laboratoire'),
    (N'Cardiologie',  'Examen', N'Examens du cœur et des vaisseaux'),
    (N'Urologie',     'Examen', N'Examens de l''appareil urinaire'),
    (N'Pneumologie',  'Examen', N'Explorations fonctionnelles respiratoires'),
    (N'Ophtalmologie','Examen', N'Examens de la vue'),
    (N'ORL',          'Examen', N'Examens des oreilles, du nez et de la gorge'),
    (N'Neurologie',   'Examen', N'Explorations du système nerveux'),
    (N'Gynécologie',  'Examen', N'Examens gynécologiques et de grossesse');
END
GO

-- ===== SEED : sous-actes de la catégorie EXAMEN =====
IF NOT EXISTS (SELECT 1 FROM actes_catalogue WHERE code = 'EXA-RAD-THORAX')
BEGIN
    INSERT INTO actes_catalogue (code, libelle, id_groupe, prix_defaut)
    SELECT src.code, src.libelle, g.id_groupe, src.prix
    FROM (
        SELECT N'EXA-RAD-THORAX'   AS code, N'Radio du thorax'        AS libelle, N'Radiologie'   AS groupe, 25.00 AS prix UNION ALL
        SELECT N'EXA-RAD-ABDO',     N'Radio de l''abdomen',           N'Radiologie',    30.00 UNION ALL
        SELECT N'EXA-RAD-CRANE',    N'Radio du crâne',                N'Radiologie',    35.00 UNION ALL
        SELECT N'EXA-RAD-MAMMO',    N'Mammographie',                  N'Radiologie',    60.00 UNION ALL
        SELECT N'EXA-SCAN-CEREB',   N'Scanner cérébral',              N'Scanner',      120.00 UNION ALL
        SELECT N'EXA-SCAN-THORAX',  N'Scanner thoracique',            N'Scanner',      130.00 UNION ALL
        SELECT N'EXA-SCAN-ABDO',    N'Scanner abdominal',             N'Scanner',      140.00 UNION ALL
        SELECT N'EXA-IRM-CEREB',    N'IRM cérébrale',                 N'IRM',          200.00 UNION ALL
        SELECT N'EXA-IRM-LOMBAIRE', N'IRM lombaire',                  N'IRM',          190.00 UNION ALL
        SELECT N'EXA-IRM-GENOU',    N'IRM du genou',                  N'IRM',          180.00 UNION ALL
        SELECT N'EXA-ECHO-ABDO',    N'Échographie abdominale',        N'Échographie',  45.00 UNION ALL
        SELECT N'EXA-ECHO-PELVI',   N'Échographie pelvienne',         N'Échographie',  45.00 UNION ALL
        SELECT N'EXA-ECHO-THYRO',   N'Échographie thyroïdienne',      N'Échographie',  50.00 UNION ALL
        SELECT N'EXA-ECHO-GROSS',   N'Échographie de grossesse',      N'Échographie',  50.00 UNION ALL
        SELECT N'EXA-ECHO-COEUR',   N'Échographie cardiaque',         N'Échographie',  55.00 UNION ALL
        SELECT N'EXA-BIO-NFS',      N'Numération formule sanguine',   N'Biologie',     15.00 UNION ALL
        SELECT N'EXA-BIO-GLY',      N'Glycémie',                      N'Biologie',     10.00 UNION ALL
        SELECT N'EXA-BIO-IONO',     N'Ionogramme sanguin',            N'Biologie',     18.00 UNION ALL
        SELECT N'EXA-BIO-LIPIDE',   N'Bilan lipidique',               N'Biologie',     30.00 UNION ALL
        SELECT N'EXA-BIO-HEPATO',   N'Bilan hépatique',               N'Biologie',     25.00 UNION ALL
        SELECT N'EXA-BIO-RENAL',    N'Bilan rénal',                   N'Biologie',     22.00 UNION ALL
        SELECT N'EXA-BIO-TSH',      N'TSH (thyroïde)',                N'Biologie',     20.00 UNION ALL
        SELECT N'EXA-BIO-CRP',      N'CRP (inflammation)',            N'Biologie',     12.00 UNION ALL
        SELECT N'EXA-BIO-CREAT',    N'Créatinine',                    N'Biologie',     10.00 UNION ALL
        SELECT N'EXA-CARDIO-ECG',   N'Électrocardiogramme (ECG)',     N'Cardiologie',  25.00 UNION ALL
        SELECT N'EXA-CARDIO-HOLTER',N'Holter ECG 24h',                N'Cardiologie',  60.00 UNION ALL
        SELECT N'EXA-CARDIO-EFFORT',N'Test d''effort',                N'Cardiologie',  70.00 UNION ALL
        SELECT N'EXA-CARDIO-TENSION',N'MAPA (tension 24h)',           N'Cardiologie',  55.00 UNION ALL
        SELECT N'EXA-URO-CYSTO',    N'Cystoscopie',                   N'Urologie',     80.00 UNION ALL
        SELECT N'EXA-URO-UIV',      N'Urographie intraveineuse',      N'Urologie',     90.00 UNION ALL
        SELECT N'EXA-URO-ECBU',     N'ECBU (urine)',                  N'Urologie',     15.00 UNION ALL
        SELECT N'EXA-PNEUMO-SPIRO', N'Spirrométrie',                  N'Pneumologie',  40.00 UNION ALL
        SELECT N'EXA-PNEUMO-GDS',   N'Gaz du sang',                   N'Pneumologie',  35.00 UNION ALL
        SELECT N'EXA-OPHT-AV',      N'Acuité visuelle',               N'Ophtalmologie',15.00 UNION ALL
        SELECT N'EXA-OPHT-FOND',    N'Fond d''œil',                   N'Ophtalmologie',35.00 UNION ALL
        SELECT N'EXA-OPHT-TONO',    N'Tonometrie (glaucome)',         N'Ophtalmologie',25.00 UNION ALL
        SELECT N'EXA-ORL-AUDIO',    N'Audiométrie',                   N'ORL',          40.00 UNION ALL
        SELECT N'EXA-NEURO-EEG',    N'Électroencéphalogramme',        N'Neurologie',   60.00 UNION ALL
        SELECT N'EXA-NEURO-EMG',    N'Électromyogramme',              N'Neurologie',   70.00 UNION ALL
        SELECT N'EXA-GYNE-FROTTIS', N'Frottis vaginal',               N'Gynécologie',  30.00 UNION ALL
        SELECT N'EXA-GYNE-COLPO',   N'Colposcopie',                   N'Gynécologie',  45.00
    ) src
    INNER JOIN groupes_actes g ON g.libelle = src.groupe AND g.categorie = 'Examen'
    WHERE NOT EXISTS (SELECT 1 FROM actes_catalogue c WHERE c.code = src.code);
END
GO

-- ===== SEED : familles de la catégorie INTERVENTION =====
IF NOT EXISTS (SELECT 1 FROM groupes_actes WHERE libelle = 'Chirurgie générale' AND categorie = 'Intervention')
BEGIN
    INSERT INTO groupes_actes (libelle, categorie, description) VALUES
    (N'Chirurgie générale',   'Intervention', N'Interventions chirurgicales courantes'),
    (N'Chirurgie orthopédique','Intervention', N'Chirurgie des os et articulations'),
    (N'Chirurgie digestive',  'Intervention', N'Chirurgie du tube digestif'),
    (N'Obstétrique',          'Intervention', N'Accouchements et chirurgie de la grossesse'),
    (N'Petite chirurgie',     'Intervention', N'Actes chirurgicaux mineurs');
END
GO

-- ===== SEED : sous-actes de la catégorie INTERVENTION =====
IF NOT EXISTS (SELECT 1 FROM actes_catalogue WHERE code = 'INT-CHG-APPENDICE')
BEGIN
    INSERT INTO actes_catalogue (code, libelle, id_groupe, prix_defaut)
    SELECT src.code, src.libelle, g.id_groupe, src.prix
    FROM (
        SELECT N'INT-CHG-APPENDICE' AS code, N'Appendicectomie'             AS libelle, N'Chirurgie générale'    AS groupe, 300.00 AS prix UNION ALL
        SELECT N'INT-CHG-HERNIE',    N'Herniorraphie (hernie)',             N'Chirurgie générale',    250.00 UNION ALL
        SELECT N'INT-CHG-VESICULE',  N'Cholécystectomie',                   N'Chirurgie générale',    350.00 UNION ALL
        SELECT N'INT-ORTHO-OSTEO',   N'Ostéosynthèse',                      N'Chirurgie orthopédique',400.00 UNION ALL
        SELECT N'INT-ORTHO-PROTHESE',N'Prothèse de hanche',                 N'Chirurgie orthopédique',900.00 UNION ALL
        SELECT N'INT-ORTHO-GENOU',   N'Arthroscopie du genou',              N'Chirurgie orthopédique',450.00 UNION ALL
        SELECT N'INT-DIG-CAESAR',    N'Césarienne',                         N'Obstétrique',           500.00 UNION ALL
        SELECT N'INT-PETIT-ABCES',   N'Incision drainage d''abcès',         N'Petite chirurgie',       80.00 UNION ALL
        SELECT N'INT-PETIT-SUTURE',  N'Suture de plaie',                    N'Petite chirurgie',       50.00 UNION ALL
        SELECT N'INT-PETIT-EXERESE', N'Exérèse de lésion cutanée',          N'Petite chirurgie',      100.00
    ) src
    INNER JOIN groupes_actes g ON g.libelle = src.groupe AND g.categorie = 'Intervention'
    WHERE NOT EXISTS (SELECT 1 FROM actes_catalogue c WHERE c.code = src.code);
END
GO

-- ===== SEED : familles de la catégorie SOIN =====
IF NOT EXISTS (SELECT 1 FROM groupes_actes WHERE libelle = 'Soins infirmiers' AND categorie = 'Soin')
BEGIN
    INSERT INTO groupes_actes (libelle, categorie, description) VALUES
    (N'Soins infirmiers', 'Soin', N'Actes de soins réalisés par le personnel infirmier'),
    (N'Soins de plaies',  'Soin', N'Pansements et soins des plaies'),
    (N'Soins de perfusion','Soin',N'Perfusions et injections');
END
GO

-- ===== SEED : sous-actes de la catégorie SOIN =====
IF NOT EXISTS (SELECT 1 FROM actes_catalogue WHERE code = 'SOIN-INF-INJ')
BEGIN
    INSERT INTO actes_catalogue (code, libelle, id_groupe, prix_defaut)
    SELECT src.code, src.libelle, g.id_groupe, src.prix
    FROM (
        SELECT N'SOIN-INF-INJ'     AS code, N'Injection (intra-musculaire)' AS libelle, N'Soins infirmiers' AS groupe, 10.00 AS prix UNION ALL
        SELECT N'SOIN-INF-IV',      N'Injection intra-veineuse',            N'Soins infirmiers', 15.00 UNION ALL
        SELECT N'SOIN-PLAIE-PANS',  N'Pansement simple',                    N'Soins de plaies',  15.00 UNION ALL
        SELECT N'SOIN-PLAIE-COMPLEX',N'Pansement complexe',                 N'Soins de plaies',  25.00 UNION ALL
        SELECT N'SOIN-PERF-POSE',   N'Pose de perfusion',                   N'Soins de perfusion',20.00 UNION ALL
        SELECT N'SOIN-PERF-SERUM',  N'Perfusion de sérum',                  N'Soins de perfusion',15.00
    ) src
    INNER JOIN groupes_actes g ON g.libelle = src.groupe AND g.categorie = 'Soin'
    WHERE NOT EXISTS (SELECT 1 FROM actes_catalogue c WHERE c.code = src.code);
END
GO

-- ===== SEED : famille de la catégorie CONSULTATION =====
IF NOT EXISTS (SELECT 1 FROM groupes_actes WHERE libelle = 'Consultations' AND categorie = 'Consultation')
BEGIN
    INSERT INTO groupes_actes (libelle, categorie, description) VALUES
    (N'Consultations', 'Consultation', N'Consultations médicales');
END
GO

IF NOT EXISTS (SELECT 1 FROM actes_catalogue WHERE code = 'CONS-GENERALE')
BEGIN
    INSERT INTO actes_catalogue (code, libelle, id_groupe, prix_defaut)
    SELECT N'CONS-GENERALE', N'Consultation générale', g.id_groupe, 100.00
    FROM groupes_actes g
    WHERE g.libelle = 'Consultations' AND g.categorie = 'Consultation';
END
GO
