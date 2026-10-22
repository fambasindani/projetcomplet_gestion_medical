-- Migration : rendre le numéro de sécurité sociale facultatif
-- tout en conservant l'unicité pour les valeurs non nulles (index unique filtré).

-- 1. Lever l'ancien index unique (généré par Hibernate via unique = true)
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_patients_numero_securite_sociale' AND object_id = OBJECT_ID('patients'))
    DROP INDEX IX_patients_numero_securite_sociale ON patients;

-- 2. Autoriser NULL (nvarchar(20) pour préserver le type d'origine)
ALTER TABLE patients ALTER COLUMN numero_securite_sociale nvarchar(20) NULL;

-- 3. Réintroduire l'unicité uniquement pour les valeurs non nulles
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_patients_ss_nonnull' AND object_id = OBJECT_ID('patients'))
    CREATE UNIQUE INDEX UX_patients_ss_nonnull ON patients(numero_securite_sociale)
    WHERE numero_securite_sociale IS NOT NULL;
