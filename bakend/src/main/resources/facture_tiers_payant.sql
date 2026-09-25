-- Ventilation tiers payant sur les factures (France / Belgique / Chine)
-- France  : régime obligatoire (Assurance Maladie / CPAM) + complémentaire (mutuelle)
-- Belgique: INAMI + assurance complémentaire
-- Chine   : assurance maladie de base + assurance complémentaire

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('factures') AND name='taux_assurance')
    ALTER TABLE factures ADD taux_assurance DECIMAL(5,2) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('factures') AND name='montant_assurance')
    ALTER TABLE factures ADD montant_assurance DECIMAL(10,2) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('factures') AND name='reste_a_charge_patient')
    ALTER TABLE factures ADD reste_a_charge_patient DECIMAL(10,2) NULL;
GO
