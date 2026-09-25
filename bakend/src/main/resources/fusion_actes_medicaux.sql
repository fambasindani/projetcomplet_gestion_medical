-- FUSION DES RÉFÉRENTIELS D'ACTES
-- Le catalogue d'actes (groupes_actes + actes_catalogue) devient le référentiel unique.
-- On y ajoute les champs de cotation de l'ancien actes_medicaux, puis on migre.

-- 1) Colonnes de cotation sur le catalogue
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('actes_catalogue') AND name='coefficient')
    ALTER TABLE actes_catalogue ADD coefficient DECIMAL(10,2) NULL;
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('actes_catalogue') AND name='lettre_cle')
    ALTER TABLE actes_catalogue ADD lettre_cle NVARCHAR(20) NULL;
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('actes_catalogue') AND name='remboursable')
    ALTER TABLE actes_catalogue ADD remboursable BIT NOT NULL DEFAULT 1;
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('actes_catalogue') AND name='taux_remboursement')
    ALTER TABLE actes_catalogue ADD taux_remboursement DECIMAL(5,2) NULL;
GO

-- 2) Report de cotation sur les actes déjà présents dans le catalogue
UPDATE ac
SET ac.coefficient = am.coefficient,
    ac.lettre_cle = am.lettre_cle,
    ac.remboursable = am.remboursable,
    ac.taux_remboursement = am.taux_remboursement
FROM actes_catalogue ac
JOIN actes_medicaux am ON am.code_acte = ac.code;
GO

-- 3) Migration des actes absents, rattachés à un groupe de leur catégorie
INSERT INTO actes_catalogue (code, libelle, id_groupe, prix_defaut, description, actif,
                             coefficient, lettre_cle, remboursable, taux_remboursement, date_creation)
SELECT am.code_acte, am.libelle,
       (SELECT TOP 1 g.id_groupe FROM groupes_actes g
         WHERE g.categorie = am.categorie AND g.actif = 1 ORDER BY g.id_groupe),
       am.prix_base, am.description, am.actif,
       am.coefficient, am.lettre_cle, am.remboursable, am.taux_remboursement, getdate()
FROM actes_medicaux am
WHERE NOT EXISTS (SELECT 1 FROM actes_catalogue ac WHERE ac.code = am.code_acte);
GO

-- 4) Détacher details_facture de l'ancienne table.
-- Le détail de facture pointe uniquement vers actes_catalogue (id_acte_catalogue).
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name='FK_details_facture_actes_medicaux_id_acte')
    ALTER TABLE details_facture DROP CONSTRAINT FK_details_facture_actes_medicaux_id_acte;
GO

-- NOTE : la table actes_medicaux est conservée en archive.
-- Elle pourra être supprimée une fois tous les usages basculés.
