-- Acte du catalogue (actes_catalogue) sur une ligne de facture.
-- Permet de facturer directement un acte précis du catalogue (ex. Paludisme / groupe Agent pathogène).

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('details_facture') AND name = 'id_acte_catalogue'
)
BEGIN
    ALTER TABLE details_facture ADD id_acte_catalogue INT NULL;

    ALTER TABLE details_facture
        ADD CONSTRAINT FK_details_facture_acte_catalogue
        FOREIGN KEY (id_acte_catalogue) REFERENCES actes_catalogue (id_acte_catalogue);
END
GO
