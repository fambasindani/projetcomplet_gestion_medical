// app/pharmacie/commandes/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaClipboardList } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { commandeService } from '@/app/services/commandeService';
import { CommandeFournisseur, StatutCommandeFournisseur } from '@/app/types/commande';
import { fournisseurService } from '@/app/services/fournisseurService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const statutColors: Record<StatutCommandeFournisseur, string> = {
  En_attente: 'bg-yellow-100 text-yellow-800',
  Confirmee: 'bg-blue-100 text-blue-800',
  Expediee: 'bg-purple-100 text-purple-800',
  Recue_partiellement: 'bg-orange-100 text-orange-800',
  Recue_completement: 'bg-green-100 text-green-800',
  Annulee: 'bg-red-100 text-red-800'
};

export default function CommandesList() {
  const router = useRouter();
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<{
    items: CommandeFournisseur[];
    totalCount: number;
    pageIndex: number;
    totalPages: number;
  }>({
    items: [],
    totalCount: 0,
    pageIndex: 1,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState('');
  const [filterFournisseur, setFilterFournisseur] = useState<number | undefined>();
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });
  const [fournisseurs, setFournisseurs] = useState<{ id: number; nom: string }[]>([]);

  useEffect(() => {
    fournisseurService.getAll(1, 100).then(res => {
      setFournisseurs(res.items.map(f => ({ id: f.idFournisseur, nom: f.nomFournisseur })));
    }).catch(console.error);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await commandeService.search({
        statut: filterStatut as StatutCommandeFournisseur || undefined,
        idFournisseur: filterFournisseur,
        dateStart: dateStart || undefined,
        dateEnd: dateEnd || undefined,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize
      });
      setPagedData(data);
    } catch {
      toast.error('Erreur de chargement');
      setPagedData(prev => ({ ...prev, items: [], totalCount: 0, totalPages: 0 }));
    } finally {
      setLoading(false);
    }
  }, [filterStatut, filterFournisseur, dateStart, dateEnd, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleDelete = async (cmd: CommandeFournisseur) => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer la commande ${cmd.numeroCommande} ?` });
    if (!ok) return;
    try {
      await commandeService.delete(cmd.idCommande);
      toast.success('Commande supprimée');
      fetchData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (loading) return <SkeletonTable columns={6} rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Commandes fournisseurs"
        subtitle={`${pagedData.totalCount} commandes`}
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={() => router.push('/pharmacie/commandes/nouvelle')}>
              Nouvelle commande
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <FilterPanel>
            <FilterSelect value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
              <option value="">Tous statuts</option>
              {Object.values(StatutCommandeFournisseur).map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSelect>
            <FilterSelect value={filterFournisseur ?? ''} onChange={e => setFilterFournisseur(e.target.value ? Number(e.target.value) : undefined)}>
              <option value="">Tous fournisseurs</option>
              {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </FilterSelect>
            <FilterInput type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} placeholder="Date début" />
            <FilterInput type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} placeholder="Date fin" />
          </FilterPanel>
        </div>
      )}

      {pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaClipboardList />}
          title="Aucune commande"
          description="Créez une nouvelle commande fournisseur pour démarrer."
          action={
            <Button icon={<FaPlus />} onClick={() => router.push('/pharmacie/commandes/nouvelle')}>
              Nouvelle commande
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>N° Commande</Th>
                <Th>Fournisseur</Th>
                <Th>Date</Th>
                <Th>Statut</Th>
                <Th>Montant ($)</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((cmd) => (
                <Tr key={cmd.idCommande}>
                  <Td className="whitespace-nowrap font-mono text-gray-900">{cmd.numeroCommande}</Td>
                  <Td className="whitespace-nowrap text-gray-900">{cmd.fournisseurNom}</Td>
                  <Td className="whitespace-nowrap text-gray-900">
                    {new Date(cmd.dateCommande).toLocaleDateString()}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statutColors[cmd.statut]}`}>
                      {cmd.statut}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-gray-900">
                    {cmd.montantTotal ? `$${cmd.montantTotal.toFixed(2)}` : '-'}
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Détails" onClick={() => router.push(`/pharmacie/commandes/${cmd.idCommande}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => router.push(`/pharmacie/commandes/${cmd.idCommande}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(cmd)}>
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
              onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page }))}
            />
          )}
        </TableContainer>
      )}
    </div>
  );
}
