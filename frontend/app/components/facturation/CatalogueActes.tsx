'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaFilter, FaSave, FaLayerGroup } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { acteCatalogueService } from '@/app/services/acteCatalogueService';
import type { ActeCatalogue, GroupeActe, ActeCatalogueRequest, GroupeActeRequest } from '@/app/services/acteCatalogueService';
import type { CategorieActeMedical } from '@/app/types/facture';
import { CategorieActeLabels, CategorieActeMedicalValues } from '@/app/types/facture';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import PageHeader from '@/app/ui/PageHeader';
import Button, { IconButton } from '@/app/ui/Button';
import Modal from '@/app/ui/Modal';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';

const categorieOptions = CategorieActeMedicalValues.map((c): { value: CategorieActeMedical; label: string } => ({
  value: c,
  label: CategorieActeLabels[c],
}));

interface ActeFormState {
  code: string;
  libelle: string;
  idGroupe: number | '';
  prixDefaut: string;
  description: string;
  actif: boolean;
}

const emptyActeForm = (): ActeFormState => ({
  code: '',
  libelle: '',
  idGroupe: '',
  prixDefaut: '0',
  description: '',
  actif: true,
});

interface GroupeFormState {
  libelle: string;
  categorie: CategorieActeMedical;
  description: string;
  actif: boolean;
}

const emptyGroupeForm = (): GroupeFormState => ({
  libelle: '',
  categorie: 'Examen',
  description: '',
  actif: true,
});

export default function CatalogueActes() {
  const confirm = useConfirm();
  const [actes, setActes] = useState<ActeCatalogue[]>([]);
  const [allGroupes, setAllGroupes] = useState<GroupeActe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categorie, setCategorie] = useState<CategorieActeMedical | ''>('');
  const [idGroupe, setIdGroupe] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal acte
  const [showActeModal, setShowActeModal] = useState(false);
  const [editingActe, setEditingActe] = useState<ActeCatalogue | null>(null);
  const [formCategorie, setFormCategorie] = useState<CategorieActeMedical>('Examen');
  const [acteForm, setActeForm] = useState<ActeFormState>(emptyActeForm());
  const [savingActe, setSavingActe] = useState(false);

  // Modal groupes
  const [showGroupeModal, setShowGroupeModal] = useState(false);
  const [groupeForm, setGroupeForm] = useState<GroupeFormState>(emptyGroupeForm());
  const [editingGroupe, setEditingGroupe] = useState<GroupeActe | null>(null);
  const [savingGroupe, setSavingGroupe] = useState(false);

  const loadGroupes = useCallback(async () => {
    try {
      setAllGroupes(await acteCatalogueService.getGroupesAdmin());
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }, []);

  const loadActes = useCallback(async () => {
    setLoading(true);
    try {
      setActes(await acteCatalogueService.searchAdmin(
        categorie || undefined,
        idGroupe !== '' ? Number(idGroupe) : undefined,
        search || undefined,
      ));
      setPage(1);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [categorie, idGroupe, search]);

  useEffect(() => {
    void loadGroupes();
  }, [loadGroupes]);

  useEffect(() => {
    void loadActes();
  }, [loadActes]);

  const groupesFiltres = useMemo(
    () => allGroupes.filter((g) => !categorie || g.categorie === categorie),
    [allGroupes, categorie]
  );

  const groupedByCategorie = useMemo(
    () => allGroupes.filter((g) => g.categorie === formCategorie && g.actif !== false),
    [allGroupes, formCategorie]
  );

  const totalPages = Math.max(1, Math.ceil(actes.length / pageSize));
  const actesPage = actes.slice((page - 1) * pageSize, page * pageSize);

  // ---------- ACTES ----------

  const openCreateActe = () => {
    setEditingActe(null);
    setFormCategorie(categorie || 'Examen');
    setActeForm(emptyActeForm());
    setShowActeModal(true);
  };

  const openEditActe = (acte: ActeCatalogue) => {
    setEditingActe(acte);
    setFormCategorie(acte.categorie ?? (categorie || 'Examen'));
    setActeForm({
      code: acte.code,
      libelle: acte.libelle,
      idGroupe: acte.idGroupe ?? '',
      prixDefaut: String(acte.prixDefaut),
      description: acte.description ?? '',
      actif: acte.actif,
    });
    setShowActeModal(true);
  };

  const handleSaveActe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acteForm.code.trim() || !acteForm.libelle.trim() || acteForm.idGroupe === '') {
      toast.error('Code, libellé et groupe sont requis');
      return;
    }
    const payload: ActeCatalogueRequest = {
      code: acteForm.code.trim(),
      libelle: acteForm.libelle.trim(),
      idGroupe: Number(acteForm.idGroupe),
      prixDefaut: parseFloat(acteForm.prixDefaut) || 0,
      description: acteForm.description || null,
      actif: acteForm.actif,
    };
    setSavingActe(true);
    try {
      if (editingActe) {
        await acteCatalogueService.updateActe(editingActe.idActeCatalogue, payload);
        toast.success('Acte modifié');
      } else {
        await acteCatalogueService.createActe(payload);
        toast.success('Acte créé');
      }
      setShowActeModal(false);
      await loadActes();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSavingActe(false);
    }
  };

  const handleDeleteActe = async (acte: ActeCatalogue) => {
    const ok = await confirm({
      title: 'Supprimer',
      message: `Supprimer l'acte « ${acte.libelle} » ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await acteCatalogueService.deleteActe(acte.idActeCatalogue);
      toast.success('Acte supprimé');
      await loadActes();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // ---------- GROUPES ----------

  const handleSaveGroupe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupeForm.libelle.trim()) {
      toast.error('Le libellé est requis');
      return;
    }
    const payload: GroupeActeRequest = {
      libelle: groupeForm.libelle.trim(),
      categorie: groupeForm.categorie,
      description: groupeForm.description || null,
      actif: groupeForm.actif,
    };
    setSavingGroupe(true);
    try {
      if (editingGroupe) {
        await acteCatalogueService.updateGroupe(editingGroupe.idGroupe, payload);
        toast.success('Groupe modifié');
      } else {
        await acteCatalogueService.createGroupe(payload);
        toast.success('Groupe créé');
      }
      setEditingGroupe(null);
      setGroupeForm(emptyGroupeForm());
      await loadGroupes();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSavingGroupe(false);
    }
  };

  const handleEditGroupe = (groupe: GroupeActe) => {
    setEditingGroupe(groupe);
    setGroupeForm({
      libelle: groupe.libelle,
      categorie: groupe.categorie,
      description: groupe.description ?? '',
      actif: groupe.actif,
    });
  };

  const handleDeleteGroupe = async (groupe: GroupeActe) => {
    const ok = await confirm({
      title: 'Supprimer',
      message: `Supprimer le groupe « ${groupe.libelle} » ?`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await acteCatalogueService.deleteGroupe(groupe.idGroupe);
      toast.success('Groupe supprimé');
      await loadGroupes();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalogue d'actes"
        subtitle="Tarifs des examens, interventions, soins, consultations…"
        actions={
          <>
            <Button variant="secondary" icon={<FaLayerGroup />} onClick={() => setShowGroupeModal(true)}>
              Groupes
            </Button>
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={openCreateActe}>
              Nouvel acte
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <FilterInput
              type="text"
              placeholder="Rechercher par code, libellé..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FilterSelect
              value={categorie}
              onChange={(e) => {
                setCategorie(e.target.value as CategorieActeMedical | '');
                setIdGroupe('');
              }}
            >
              <option value="">Toutes les catégories</option>
              {categorieOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </FilterSelect>
            <FilterSelect
              value={idGroupe}
              onChange={(e) => setIdGroupe(e.target.value ? Number(e.target.value) : '')}
              disabled={!categorie}
            >
              <option value="">Tous les groupes</option>
              {groupesFiltres.map((g) => (
                <option key={g.idGroupe} value={g.idGroupe}>{g.libelle}</option>
              ))}
            </FilterSelect>
          </FilterPanel>
        </div>
      )}

      {loading ? (
        <SkeletonTable columns={6} rows={8} />
      ) : actes.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm ring-1 ring-slate-200">
          Aucun acte dans le catalogue.
        </p>
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Code</Th>
                <Th>Libellé</Th>
                <Th>Catégorie</Th>
                <Th>Groupe</Th>
                <Th align="right">Prix défaut</Th>
                <Th align="center">Actif</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {actesPage.map((acte) => (
                <Tr key={acte.idActeCatalogue}>
                  <Td className="whitespace-nowrap font-mono text-xs">{acte.code}</Td>
                  <Td className="font-medium">{acte.libelle}</Td>
                  <Td className="whitespace-nowrap text-gray-600">
                    {acte.categorie ? CategorieActeLabels[acte.categorie] : '—'}
                  </Td>
                  <Td className="whitespace-nowrap text-gray-600">{acte.groupeLibelle ?? '—'}</Td>
                  <Td className="whitespace-nowrap text-right">{Number(acte.prixDefaut).toFixed(2)} $</Td>
                  <Td className="text-center">
                    {acte.actif ? <span className="text-green-600">Oui</span> : <span className="text-red-600">Non</span>}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="blue" title="Modifier" onClick={() => openEditActe(acte)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDeleteActe(acte)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {totalPages > 1 && (
            <Pagination pageIndex={page} totalPages={totalPages} totalCount={actes.length} pageSize={pageSize} onPageChange={setPage} />
          )}
        </TableContainer>
      )}

      {/* Modal acte */}
      <Modal
        isOpen={showActeModal}
        onClose={() => setShowActeModal(false)}
        title={editingActe ? "Modifier l'acte" : 'Nouvel acte du catalogue'}
        size="lg"
      >
        <form onSubmit={handleSaveActe} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Code"
              value={acteForm.code}
              onChange={(e) => setActeForm({ ...acteForm, code: e.target.value })}
              required
            />
            <FormInput
              label="Libellé"
              value={acteForm.libelle}
              onChange={(e) => setActeForm({ ...acteForm, libelle: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormSelect
              label="Catégorie"
              value={formCategorie}
              onChange={(e) => {
                setFormCategorie(e.target.value as CategorieActeMedical);
                setActeForm((prev) => ({ ...prev, idGroupe: '' }));
              }}
              options={categorieOptions}
              required
            />
            <FormSelect
              label="Groupe"
              value={acteForm.idGroupe}
              onChange={(e) => setActeForm({ ...acteForm, idGroupe: e.target.value ? Number(e.target.value) : '' })}
              options={[
                { value: '', label: '-- Choisir --' },
                ...groupedByCategorie.map((g) => ({ value: g.idGroupe, label: g.libelle })),
              ]}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="Prix par défaut ($)"
              type="number"
              step="0.01"
              min={0}
              value={acteForm.prixDefaut}
              onChange={(e) => setActeForm({ ...acteForm, prixDefaut: e.target.value })}
              required
            />
            <label className="mt-7 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={acteForm.actif}
                onChange={(e) => setActeForm({ ...acteForm, actif: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Actif
            </label>
          </div>
          <FormTextarea
            label="Description"
            value={acteForm.description}
            onChange={(e) => setActeForm({ ...acteForm, description: e.target.value })}
            rows={2}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowActeModal(false)}>Annuler</Button>
            <Button type="submit" disabled={savingActe} icon={<FaSave />}>
              {savingActe ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal groupes */}
      <Modal
        isOpen={showGroupeModal}
        onClose={() => { setShowGroupeModal(false); setEditingGroupe(null); setGroupeForm(emptyGroupeForm()); }}
        title="Groupes d'actes"
        size="lg"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h6 className="mb-3 text-sm font-semibold text-gray-700">
              {editingGroupe ? 'Modifier le groupe' : 'Nouveau groupe'}
            </h6>
            <form onSubmit={handleSaveGroupe} className="space-y-3">
              <FormInput
                label="Libellé"
                value={groupeForm.libelle}
                onChange={(e) => setGroupeForm({ ...groupeForm, libelle: e.target.value })}
                required
              />
              <FormSelect
                label="Catégorie"
                value={groupeForm.categorie}
                onChange={(e) => setGroupeForm({ ...groupeForm, categorie: e.target.value as CategorieActeMedical })}
                options={categorieOptions}
                required
              />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={groupeForm.actif}
                  onChange={(e) => setGroupeForm({ ...groupeForm, actif: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Actif
              </label>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={savingGroupe} icon={<FaSave />}>
                  {editingGroupe ? 'Modifier' : 'Ajouter'}
                </Button>
                {editingGroupe && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => { setEditingGroupe(null); setGroupeForm(emptyGroupeForm()); }}
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </div>
          <div className="max-h-[50vh] overflow-y-auto">
            <h6 className="mb-3 text-sm font-semibold text-gray-700">Groupes existants ({allGroupes.length})</h6>
            <div className="space-y-2">
              {allGroupes.map((g) => (
                <div key={g.idGroupe} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{g.libelle}</p>
                    <p className="text-xs text-gray-400">{CategorieActeLabels[g.categorie]}</p>
                  </div>
                  <div className="flex gap-1">
                    <IconButton color="gray" title="Modifier" onClick={() => handleEditGroupe(g)}>
                      <FaEdit size={12} />
                    </IconButton>
                    <IconButton color="red" title="Supprimer" onClick={() => handleDeleteGroupe(g)}>
                      <FaTrash size={12} />
                    </IconButton>
                  </div>
                </div>
              ))}
              {allGroupes.length === 0 && <p className="text-sm text-gray-400">Aucun groupe.</p>}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
