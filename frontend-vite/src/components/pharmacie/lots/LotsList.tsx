import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaBoxes, FaSearch } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/ui/Pagination';
import SkeletonTable from '@/ui/SkeletonTable';
import PageHeader from '@/ui/PageHeader';
import EmptyState from '@/ui/EmptyState';
import Button, { IconButton } from '@/ui/Button';
import RefreshButton from '@/ui/RefreshButton';
import { FilterPanel, FilterInput, FilterSelect } from '@/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/ui/Table';
import { lotService } from '@/services/lotService';
import { LotMedicament, StatutLot } from '@/types/lot';
import { medicamentService } from '@/services/medicamentService';
import { extractErrorMessage } from '@/utils/extractErrorMessage';
import Can from '@/components/common/Can';
import RequirePermission from '@/components/common/RequirePermission';
import { usePermission } from '@/hooks/usePermission';

export default function LotsList() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { allowed: peutVoir } = usePermission('PHARMACIE_VOIR');
  const [pagedData, setPagedData] = useState<{ items: LotMedicament[]; totalCount: number; pageIndex: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMedicamentId, setFilterMedicamentId] = useState<number | undefined>(undefined);
  const [filterNumeroLot, setFilterNumeroLot] = useState('');
  const [appliedNumeroLot, setAppliedNumeroLot] = useState('');
  const [filterStatut, setFilterStatut] = useState<StatutLot | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [medicaments, setMedicaments] = useState<{ id: number; nom: string }[]>([]);

  useEffect(() => {
    if (!peutVoir) return;
    medicamentService.getAll(1, 100).then(res => {
      setMedicaments(res.items.map(m => ({ id: m.idMedicament, nom: m.nomCommercial })));
    }).catch(console.error);
  }, [peutVoir]);

  const fetchData = useCallback(async () => {
    if (!peutVoir) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await lotService.search({
        idMedicament: filterMedicamentId,
        numeroLot: appliedNumeroLot || undefined,
        statut: filterStatut,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
      setPagedData(data);
    } catch (error) {
      console.error(error);
      setPagedData({ items: [], totalCount: 0, pageIndex: 1, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [filterMedicamentId, appliedNumeroLot, filterStatut, pagination.pageIndex, pagination.pageSize, peutVoir]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
    setAppliedNumeroLot(filterNumeroLot);
  };

  const handleReset = () => {
    setFilterMedicamentId(undefined);
    setFilterNumeroLot('');
    setAppliedNumeroLot('');
    setFilterStatut(undefined);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const handleDelete = async (lot: LotMedicament) => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer le lot ${lot.numeroLot} ?` });
    if (!ok) return;
    try {
      await lotService.delete(lot.idLot);
      toast.success('Lot supprimé');
      fetchData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleEdit = (lot: LotMedicament) => {
    navigate(`/pharmacie/lots/${lot.idLot}/modifier`);
  };

  const handleAdd = () => {
    navigate('/pharmacie/lots/nouveau');
  };

  if (loading) return <SkeletonTable columns={7} rows={8} />;
  if (!pagedData) return <div className="p-6 text-center">Aucune donnée</div>;

  return (
    <RequirePermission permission="PHARMACIE_VOIR">
    <div className="space-y-6">
      <PageHeader
        title="Lots de médicaments"
        subtitle={`${pagedData.totalCount} lots`}
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Can permission="PHARMACIE_GERER">
            <Button icon={<FaPlus />} onClick={handleAdd}>
              Nouveau lot
            </Button>
            </Can>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <FilterSelect
              value={filterMedicamentId ?? ''}
              onChange={(e) => setFilterMedicamentId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Tous médicaments</option>
              {medicaments.map(m => (
                <option key={m.id} value={m.id}>{m.nom}</option>
              ))}
            </FilterSelect>
            <FilterInput
              type="text"
              placeholder="Numéro de lot..."
              value={filterNumeroLot}
              onChange={(e) => setFilterNumeroLot(e.target.value)}
            />
            <FilterSelect
              value={filterStatut ?? ''}
              onChange={(e) => setFilterStatut(e.target.value ? (e.target.value as StatutLot) : undefined)}
            >
              <option value="">Tous statuts</option>
              {Object.values(StatutLot).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </FilterSelect>
          </FilterPanel>
          <div className="mt-4 flex gap-2">
            <Button icon={<FaSearch size={14} />} onClick={handleSearch}>Rechercher</Button>
            <Button variant="secondary" onClick={handleReset}>Réinitialiser</Button>
          </div>
        </div>
      )}

      {pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaBoxes />}
          title="Aucun lot"
          description="Ajoutez un nouveau lot pour démarrer."
          action={
            <Can permission="PHARMACIE_GERER">
            <Button icon={<FaPlus />} onClick={handleAdd}>
              Nouveau lot
            </Button>
            </Can>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Médicament</Th>
                <Th>Numéro lot</Th>
                <Th>Fournisseur</Th>
                <Th>Péremption</Th>
                <Th>Qté restante</Th>
                <Th>Statut</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((lot) => (
                <Tr key={lot.idLot}>
                  <Td>{lot.medicamentNom || `ID ${lot.idMedicament}`}</Td>
                  <Td className="font-mono">{lot.numeroLot}</Td>
                  <Td>{lot.fournisseurNom || '-'}</Td>
                  <Td>{new Date(lot.datePeremption).toLocaleDateString()}</Td>
                  <Td>{lot.quantiteRestante}</Td>
                  <Td>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      lot.statut === StatutLot.Disponible ? 'bg-green-100 text-green-800' :
                      lot.statut === StatutLot.Rupture ? 'bg-red-100 text-red-800' :
                      lot.statut === StatutLot.Perime ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lot.statut}
                    </span>
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Voir" onClick={() => navigate(`/pharmacie/lots/${lot.idLot}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <Can permission="PHARMACIE_GERER">
                      <IconButton color="blue" title="Modifier" onClick={() => handleEdit(lot)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(lot)}>
                        <FaTrash size={14} />
                      </IconButton>
                      </Can>
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
              onPageChange={(p) => setPagination(prev => ({ ...prev, pageIndex: p }))}
            />
          )}
        </TableContainer>
      )}
    </div>
    </RequirePermission>
  );
}
