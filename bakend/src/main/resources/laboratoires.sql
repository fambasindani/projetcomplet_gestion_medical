-- ============================================================
-- Laboratoires (plateaux techniques) - mod\u00e8le France
-- Chaque laboratoire est une entit\u00e9 physique (accr\u00e9ditation ISO 15189).
-- Les examens sont rattach\u00e9s \u00e0 un laboratoire via id_laboratoire.
-- Le personnel (technicien/laborantin) est affect\u00e9 via personnel_laboratoire.
-- ============================================================

IF OBJECT_ID('dbo.laboratoires', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.laboratoires (
        id_laboratoire INT IDENTITY(1,1) PRIMARY KEY,
        nom            NVARCHAR(100) NOT NULL,
        type           NVARCHAR(50)  NULL,
        responsable    NVARCHAR(150) NULL,
        accreditation  NVARCHAR(50)  NULL,
        actif          BIT           NOT NULL DEFAULT 1,
        date_creation  DATETIME2     NULL DEFAULT SYSDATETIME()
    );
END;

IF OBJECT_ID('dbo.personnel_laboratoire', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.personnel_laboratoire (
        id_personnel   INT NOT NULL,
        id_laboratoire INT NOT NULL,
        CONSTRAINT pk_personnel_laboratoire PRIMARY KEY (id_personnel, id_laboratoire),
        CONSTRAINT fk_pl_personnel   FOREIGN KEY (id_personnel)   REFERENCES dbo.personnel(id_personnel),
        CONSTRAINT fk_pl_laboratoire FOREIGN KEY (id_laboratoire) REFERENCES dbo.laboratoires(id_laboratoire)
    );
END;

IF COL_LENGTH('dbo.examens', 'id_laboratoire') IS NULL
BEGIN
    ALTER TABLE dbo.examens ADD id_laboratoire INT NULL;
    ALTER TABLE dbo.examens
        ADD CONSTRAINT fk_examens_laboratoire
        FOREIGN KEY (id_laboratoire) REFERENCES dbo.laboratoires(id_laboratoire);
END;

-- Modele francais : la CATEGORIE porte le plateau technique (laboratoire).
IF COL_LENGTH('dbo.categories_examen', 'id_laboratoire') IS NULL
BEGIN
    ALTER TABLE dbo.categories_examen ADD id_laboratoire INT NULL;
    ALTER TABLE dbo.categories_examen
        ADD CONSTRAINT fk_categorie_laboratoire
        FOREIGN KEY (id_laboratoire) REFERENCES dbo.laboratoires(id_laboratoire);
END;

-- Donn\u00e9es de base (plateaux techniques)
IF NOT EXISTS (SELECT 1 FROM dbo.laboratoires)
BEGIN
    INSERT INTO dbo.laboratoires (nom, type, accreditation) VALUES
        (N'Biologie m\u00e9dicale', N'Biologie', N'ISO 15189'),
        (N'Radiologie',           N'Imagerie', NULL),
        (N'Scanner',              N'Imagerie', NULL),
        (N'IRM',                  N'Imagerie', NULL),
        (N'\u00c9chographie',         N'Imagerie', NULL),
        (N'Cardiologie',          N'Exploration', NULL),
        (N'Neurologie',           N'Exploration', NULL),
        (N'Pneumologie',          N'Exploration', NULL),
        (N'Ophtalmologie',        N'Exploration', NULL),
        (N'ORL',                  N'Exploration', NULL),
        (N'Urologie',             N'Exploration', NULL),
        (N'Dermatologie',         N'Exploration', NULL),
        (N'Gyn\u00e9cologie',         N'Exploration', NULL),
        (N'Gastro-ent\u00e9rologie',  N'Exploration', NULL),
        (N'Autre',                N'Autre', NULL);
END;

-- Lier chaque categorie d'examen a son plateau technique.
UPDATE c SET c.id_laboratoire = l.id_laboratoire
FROM dbo.categories_examen c
JOIN dbo.laboratoires l ON (
   (c.code='BIO'    AND l.nom=N'Biologie m\u00e9dicale') OR
   (c.code='RAD'    AND l.nom=N'Radiologie')         OR
   (c.code='ECHO'   AND l.nom=N'\u00c9chographie')        OR
   (c.code='SCAN'   AND l.nom=N'Scanner')            OR
   (c.code='IRM'    AND l.nom=N'IRM')                OR
   (c.code='CARD'   AND l.nom=N'Cardiologie')        OR
   (c.code='NEURO'  AND l.nom=N'Neurologie')         OR
   (c.code='OPHT'   AND l.nom=N'Ophtalmologie')      OR
   (c.code='ORL'    AND l.nom=N'ORL')                OR
   (c.code='DERM'   AND l.nom=N'Dermatologie')       OR
   (c.code='GYN'    AND l.nom=N'Gyn\u00e9cologie')        OR
   (c.code='URO'    AND l.nom=N'Urologie')           OR
   (c.code='PNEU'   AND l.nom=N'Pneumologie')        OR
   (c.code='GASTRO' AND l.nom=N'Gastro-ent\u00e9rologie') OR
   (c.code='AUTRE'  AND l.nom=N'Autre')
);

-- Les examens heritent du laboratoire de leur categorie.
UPDATE e SET e.id_laboratoire = c.id_laboratoire
FROM dbo.examens e
JOIN dbo.categories_examen c ON c.id_categorie_examen = e.id_categorie_examen
WHERE c.id_laboratoire IS NOT NULL;