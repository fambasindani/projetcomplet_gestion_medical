-- Liaison explicite entre une catégorie d'examen (categories_examen)
-- et son groupe d'actes du catalogue (groupes_actes).
-- Remplace le rapprochement fragile par libellé.

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('categories_examen') AND name = 'id_groupe_catalogue'
)
BEGIN
    ALTER TABLE categories_examen ADD id_groupe_catalogue INT NULL;

    ALTER TABLE categories_examen
        ADD CONSTRAINT FK_categories_examen_groupe
        FOREIGN KEY (id_groupe_catalogue) REFERENCES groupes_actes (id_groupe);

    CREATE INDEX IX_categories_examen_groupe ON categories_examen (id_groupe_catalogue);
END
GO

-- Seed : association automatique quand le libellé correspond strictement
UPDATE ce
SET ce.id_groupe_catalogue = g.id_groupe
FROM categories_examen ce
JOIN groupes_actes g
  ON g.categorie = 'Examen'
 AND ce.id_groupe_catalogue IS NULL
 AND (
      LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(ce.libelle,
        'é','e'),'è','e'),'ê','e'),'à','a'),'â','a'),'î','i'),'ô','o'),'û','u'),'ç','c'))
      =
      LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(g.libelle,
        'é','e'),'è','e'),'ê','e'),'à','a'),'â','a'),'î','i'),'ô','o'),'û','u'),'ç','c'))
 );
GO
