'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaFilter, FaTimes, FaSave } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';

import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import { acteMedicalService } from '@/app/services/acteMedicalService';
import type { ActeMedical, ActeMedicalCreate, CategorieActeMedical } from '@/app/types/facture';
import { CategorieActeLabels, CategorieActeMedicalValues } from '@/app/types/facture';
import type { PagedResult } from '@/app/types/pagination';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const categorieOptions = CategorieActeMedicalValues.map((categorie) => ({
  value: categorie,
  label: CategorieActeLabels[categorie],
}));

const categorieBadgeColors: Record<CategorieActeMedical, string> = {
  Consultation: 'bg-blue-100 text-blue-800',
  Intervention: 'bg-purple-100 text-purple-800',
  Examen: 'bg-emerald-100 text-emerald-800',
  Soin: 'bg-amber-100 text-amber-800',
  Hospitalisation: 'bg-indigo-100 text-indigo-800',
  Pharmacie: 'bg-rose-100 text-rose-800',
};

interface ActeFormState {
  codeActe: string;
  libelle: string;
  description: string;
  prixBase: string;
  categorie: CategorieActeMedical;
  coefficient: string;
  lettreCle: string;
  remboursable: boolean;
  tauxRemboursement: string;
  actif: boolean;
}

const emptyForm = (): ActeFormState => ({
  codeActe: '',
  libelle: '',
  description: '',
  prixBase: '0',
  categorie: 'Consultation',
  coefficient: '',
  lettreCle: '',
  remboursable: true,
  tauxRemboursement: '',
  actif: true,
});

const toForm = (acte: ActeMedical): ActeFormState => ({
  codeActe: acte.codeActe,
  libelle: acte.libelle,
  description: acte.description || '',
  prixBase: String(acte.prixBase),
  categorie: acte.categorie,
  coefficient: acte.coefficient !== null ? String(acte.coefficient) : '',
  lettreCle: acte.lettreCle || '',
  remboursable: acte.remboursable,
  tauxRemboursement: acte.tauxRemboursement !== null ? String(acte.tauxRemboursement) : '',
  actif: acte.actif,
});

function ActeFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData: ActeMedical | null;
}) {
  const [formData, setFormData] = useState<ActeFormState>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (prevOpen !== isOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setFormData(initialData ? toForm(initialData) : emptyForm());
      setErrors({});
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!formData.codeActe.trim()) err.codeActe = 'Le code est requis';
    if (!formData.libelle.trim()) err.libelle = 'Le libellé est requis';
    const prix = parseFloat(formData.prixBase);
    if (isNaN(prix) || prix < 0) err.prixBase = 'Le prix de base est invalide';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const buildPayload = (): ActeMedicalCreate => ({
    codeActe: formData.codeActe.trim(),
    libelle: formData.libelle.trim(),
    description: formData.description || null,
    prixBase: parseFloat(formData.prixBase) || 0,
    categorie: formData.categorie,
    coefficient: formData.coefficient !== '' ? Number(formData.coefficient) : null,
    lettreCle: formData.lettreCle || null,
    remboursable: formData.remboursable,
    tauxRemboursement:
      formData.tauxRemboursement !== '' ? Number(formData.tauxRemboursement) : null,
    actif: formData.actif,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (initialData) {
        await acteMedicalService.update(initialData.idActe, buildPayload());
        toast.success('Acte médical mis à jour');
      } else {
        await acteMedicalService.create(buildPayload());
        toast.success('Acte médical créé');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {initialData ? 'Modifier l&apos;acte médical' : 'Nouvel acte médical'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Code"
              name="codeActe"
              value={formData.codeActe}
              onChange={handleChange}
              required
              error={errors.codeActe}
            />
            <FormSelect
              label="Catégorie"
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              options={categorieOptions}
              required
            />
          </div>
          <FormInput
            label="Libellé"
            name="libelle"
            value={formData.libelle}
            onChange={handleChange}
            required
            error={errors.libelle}
          />
          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Prix de base"
              name="prixBase"
              type="number"
              step="0.01"
              min={0}
              value={formData.prixBase}
              onChange={handleChange}
              required
              error={errors.prixBase}
            />
            <FormInput
              label="Coefficient"
              name="coefficient"
              type="number"
              step="0.01"
              value={formData.coefficient}
              onChange={handleChange}
            />
            <FormInput
              label="Lettre clé"
              name="lettreCle"
              value={formData.lettreCle}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="remboursable"
                checked={formData.remboursable}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remboursable
            </label>
            <FormInput
              label="Taux de remboursement (%)"
              name="tauxRemboursement"
              type="number"
              step="0.01"
              value={formData.tauxRemboursement}
              onChange={handleChange}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="actif"
                checked={formData.actif}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Actif
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} icon={<FaSave />}>
              {loading ? 'Enregistrement...' : initialData ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ActesMedicaux() {
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<PagedResult<ActeMedical> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState<CategorieActeMedical | ''>('');
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [showModal, setShowModal] = useState(false);
  const [editingActe, setEditingActe] = useState<ActeMedical | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await acteMedicalService.getAll({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        search: search || undefined,
        categorie: categorie || undefined,
      });
      setPagedData(data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, search, categorie]);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  const handleDelete = async (acte: ActeMedical) => {
    const ok = await confirm({
      title: 'Supprimer',
      message: `Supprimer l'acte médical "${acte.libelle}" ?`,
    });
    if (!ok) return;
    try {
      await acteMedicalService.delete(acte.idActe);
      toast.success('Acte médical supprimé');
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const openCreate = () => {
    setEditingActe(null);
    setShowModal(true);
  };

  const openEdit = (acte: ActeMedical) => {
    setEditingActe(acte);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingActe(null);
  };

  if (loading) return <SkeletonTable columns={7} rows={8} />;
  if (!pagedData) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Actes médicaux"
        subtitle={`${pagedData.totalCount} actes`}
        actions={
          <>
            <RefreshButton onRefresh={loadData} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={openCreate}>
              Nouvel acte
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <FilterPanel>
            <FilterInput
              type="text"
              placeholder="Rechercher par libellé, code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 1 }));
              }}
            />
            <FilterSelect
              value={categorie}
              onChange={(e) => {
                setCategorie(e.target.value as CategorieActeMedical | '');
                setPagination((prev) => ({ ...prev, pageIndex: 1 }));
              }}
            >
              <option value="">Toutes les catégories</option>
              {categorieOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          </FilterPanel>
        </div>
      )}

      {pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaTimes />}
          title="Aucun acte médical trouvé"
          description="Ajustez vos filtres ou créez un nouvel acte médical"
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Code</Th>
                <Th>Libellé</Th>
                <Th>Catégorie</Th>
                <Th align="right">Prix de base</Th>
                <Th>Remboursable</Th>
                <Th>Actif</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((acte) => (
                <Tr key={acte.idActe}>
                  <Td className="whitespace-nowrap font-mono">{acte.codeActe}</Td>
                  <Td className="font-medium">{acte.libelle}</Td>
                  <Td className="whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${categorieBadgeColors[acte.categorie]}`}
                    >
                      {CategorieActeLabels[acte.categorie]}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-right">{acte.prixBase.toFixed(2)} $</Td>
                  <Td>
                    {acte.remboursable ? (
                      <span className="text-green-600">
                        Oui{acte.tauxRemboursement !== null ? ` (${acte.tauxRemboursement}%)` : ''}
                      </span>
                    ) : (
                      <span className="text-gray-500">Non</span>
                    )}
                  </Td>
                  <Td>
                    {acte.actif ? <span className="text-green-600">Oui</span> : <span className="text-red-600">Non</span>}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="blue" title="Modifier" onClick={() => openEdit(acte)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(acte)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {pagedData.totalPages > 1 && (
            <Pagination
              pageIndex={pagedData.pageIndex}
              totalPages={pagedData.totalPages}
              totalCount={pagedData.totalCount}
              pageSize={pagedData.pageSize}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, pageIndex: page }))}
            />
          )}
        </TableContainer>
      )}

      <ActeFormModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={loadData}
        initialData={editingActe}
      />
    </div>
  );
}
