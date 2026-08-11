'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaPills, FaSearch } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { medicamentService } from '@/app/services/medicamentService';
import { Medicament } from '@/app/types/medicament';
import type { PagedResult } from '@/app/types/pagination';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { CategorieSelect } from '@/app/components/common/CategorieSelect';

export default function MedicamentsList() {
  const router = useRouter();
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<PagedResult<Medicament> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchNom, setSearchNom] = useState('');
  const [searchNomInput, setSearchNomInput] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null);
  const [filterActif, setFilterActif] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await medicamentService.search(
        searchNom || undefined,
        selectedCategorie || undefined,
        filterActif,
        pagination.pageIndex,
        pagination.pageSize
      );
      setPagedData(data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [searchNom, selectedCategorie, filterActif, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchNom(searchNomInput);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const clearFilters = () => {
    setSearchNom('');
    setSearchNomInput('');
    setSelectedCategorie(null);
    setFilterActif(undefined);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const handleDelete = async (med: Medicament) => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer "${med.nomCommercial}" ?` });
    if (!ok) return;
    try {
      await medicamentService.delete(med.idMedicament);
      toast.success('Médicament supprimé');
      fetchData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (loading) return <SkeletonTable columns={6} rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Médicaments"
        subtitle={`${pagedData?.totalCount || 0} produits`}
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={() => router.push('/pharmacie/medicaments/nouveau')}>
              Nouveau médicament
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">Recherche par nom</label>
              <FilterInput
                type="text"
                placeholder="Rechercher par nom commercial..."
                value={searchNomInput}
                onChange={(e) => setSearchNomInput(e.target.value)}
              />
            </div>
            <Button type="submit" icon={<FaSearch />} className="h-[42px] w-full sm:w-auto">Rechercher</Button>
          </form>
          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-gray-100 pt-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Catégorie</label>
              <CategorieSelect
                value={selectedCategorie}
                onChange={setSelectedCategorie}
                placeholder="Toutes catégories"
                hideLabel
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Statut</label>
              <FilterSelect
                value={filterActif === undefined ? '' : filterActif ? 'true' : 'false'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') setFilterActif(undefined);
                  else setFilterActif(val === 'true');
                }}
              >
                <option value="">Tous (actifs/inactifs)</option>
                <option value="true">Actifs</option>
                <option value="false">Inactifs</option>
              </FilterSelect>
            </div>
          </div>
          {(searchNom || selectedCategorie !== null || filterActif !== undefined) && (
            <div className="mt-4 text-right">
              <button type="button" onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {!pagedData || pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaPills />}
          title={pagedData ? 'Aucun médicament' : 'Chargement impossible'}
          description={
            pagedData
              ? 'Ajoutez un nouveau médicament pour démarrer.'
              : 'Impossible de charger la liste des médicaments. Vérifiez que le serveur est démarré puis cliquez sur Actualiser.'
          }
          action={
            <Button icon={<FaPlus />} onClick={() => router.push('/pharmacie/medicaments/nouveau')}>
              Nouveau médicament
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Code CIP</Th>
                <Th>Nom commercial</Th>
                <Th>Catégorie</Th>
                <Th>Prix vente ($)</Th>
                <Th>Actif</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((med: Medicament) => (
                <Tr key={med.idMedicament}>
                  <Td className="font-mono">{med.codeCip}</Td>
                  <Td className="font-medium">{med.nomCommercial}</Td>
                  <Td>{med.nomCategorie || '-'}</Td>
                  <Td>{med.prixVente ? `$${med.prixVente.toFixed(2)}` : '-'}</Td>
                  <Td>
                    {med.actif ? <span className="text-green-600">Oui</span> : <span className="text-red-600">Non</span>}
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Voir" onClick={() => router.push(`/pharmacie/medicaments/${med.idMedicament}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => router.push(`/pharmacie/medicaments/${med.idMedicament}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(med)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {pagedData?.totalPages > 1 && (
            <Pagination
              pageIndex={pagedData.pageIndex}
              totalPages={pagedData.totalPages}
              onPageChange={(p) => setPagination(prev => ({ ...prev, pageIndex: p }))}
            />
          )}
        </TableContainer>
      )}
    </div>
  );
}
