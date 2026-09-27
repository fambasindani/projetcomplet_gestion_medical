'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaFlask, FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaPrint, FaTags } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { format } from 'date-fns';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterSelect, FilterInput } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { examenService } from '@/app/services/examenService';
import { categorieExamenService } from '@/app/services/categorieExamenService';
import { useAuth } from '@/app/contexts/AuthContext';
import type { Examen, CategorieExamen } from '@/app/types/examen';
import type { PagedResult } from '@/app/types/pagination';

const statutOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'Prescrit', label: 'Prescrit' },
    { value: 'Planifié', label: 'Planifié' },
    { value: 'En_cours', label: 'En cours' },
    { value: 'Réalisé', label: 'Réalisé' },
    { value: 'Validé', label: 'Validé' },
    { value: 'Annulé', label: 'Annulé' },
];

const statutColors: Record<string, string> = {
    Prescrit: 'bg-yellow-100 text-yellow-800',
    Planifié: 'bg-blue-100 text-blue-800',
    En_cours: 'bg-cyan-100 text-cyan-800',
    Réalisé: 'bg-green-100 text-green-800',
    Validé: 'bg-indigo-100 text-indigo-800',
    Annulé: 'bg-red-100 text-red-800',
};

export default function ExamenList() {
    const router = useRouter();
    const confirm = useConfirm();
    const { hasPermission } = useAuth();
    const peutGerer = hasPermission('EXAMENS_GERER');
    const peutResultat = hasPermission('EXAMENS_GERER') || hasPermission('EXAMENS_RESULTAT');
    const [pagedData, setPagedData] = useState<PagedResult<Examen> | null>(null);
    const [categories, setCategories] = useState<CategorieExamen[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [selectedStatut, setSelectedStatut] = useState('');
    const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [paginationParams, setPaginationParams] = useState({ pageIndex: 1, pageSize: 10 });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Recherche et filtres côté serveur (pagination exacte).
            const data = await examenService.search({
                pageIndex: paginationParams.pageIndex,
                pageSize: paginationParams.pageSize,
                statut: selectedStatut || undefined,
                idCategorie: selectedCategorie,
                term: searchTerm || undefined,
            });
            setPagedData(data);
        } catch (error) {
            toast.error('Erreur lors du chargement des examens');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedStatut, selectedCategorie, paginationParams.pageIndex, paginationParams.pageSize]);

    useEffect(() => {
        void (async () => {
            await fetchData();
        })();
    }, [fetchData]);

    useEffect(() => {
        categorieExamenService.getAllList().then(setCategories).catch(console.error);
    }, []);

    const handleDelete = async (examen: Examen) => {
        const ok = await confirm({
            title: 'Confirmation de suppression',
            message: `Supprimer l'examen ${examen.numeroExamen} ?`,
            confirmText: 'Oui, supprimer',
            cancelText: 'Annuler',
            confirmColor: '#d33',
        });
        if (!ok) return;
        try {
            await examenService.delete(examen.idExamen);
            toast.success('Examen supprimé');
            fetchData();
        } catch {
            toast.error('Erreur lors de la suppression');
        }
    };

    const handleEdit = (examen: Examen) => router.push(`/examens/modifier/${examen.idExamen}`);
    const handleViewDetails = (examen: Examen) => router.push(`/examens/details/${examen.idExamen}`);
    const handleAdd = () => router.push('/examens/nouveau');
    const handlePageChange = (page: number) => {
        setPaginationParams(prev => ({ ...prev, pageIndex: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchTerm(searchInput);
        setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSearchInput('');
        setSelectedStatut('');
        setSelectedCategorie(null);
        setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
    };

    const getStatutBadge = (statut: string) => {
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statutColors[statut] || 'bg-gray-100 text-gray-800'}`}>
                {statut}
            </span>
        );
    };

    if (loading) return <SkeletonTable columns={8} rows={8} />;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestion des examens"
                subtitle={
                    <span>
                        <FaFlask className="inline mr-1" /> {pagedData?.totalCount || 0} examen(s) trouvé(s)
                    </span>
                }
                actions={
                    <>
                        <RefreshButton onRefresh={fetchData} loading={loading} />
                        <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
                            Filtres
                        </Button>
                        {peutGerer && (
                            <Button icon={<FaPlus />} onClick={handleAdd}>
                                Nouvel examen
                            </Button>
                        )}
                    </>
                }
            />

            {showFilters && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <FilterPanel>
                        <form onSubmit={handleSearch} className="flex gap-2 md:col-span-2">
                            <FilterInput
                                type="text"
                                placeholder="Rechercher par n° examen, patient, type..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                            />
                            <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-500">
                                <FaSearch />
                            </button>
                        </form>
                        <FilterSelect value={selectedStatut} onChange={(e) => {
                            setSelectedStatut(e.target.value);
                            setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
                        }}>
                            {statutOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </FilterSelect>
                        <FilterSelect
                            value={selectedCategorie ?? ''}
                            onChange={(e) => {
                                setSelectedCategorie(e.target.value ? Number(e.target.value) : null);
                                setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
                            }}
                        >
                            <option value="">Toutes catégories</option>
                            {categories.map(c => (
                                <option key={c.idCategorieExamen} value={c.idCategorieExamen}>{c.libelle}</option>
                            ))}
                        </FilterSelect>
                    </FilterPanel>
                    {(selectedStatut || selectedCategorie || searchTerm) && (
                        <div className="mt-4 text-right">
                            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">
                                Effacer les filtres
                            </button>
                        </div>
                    )}
                </div>
            )}

            {!pagedData || pagedData.items.length === 0 ? (
                <EmptyState
                    icon={<FaFlask />}
                    title="Aucun examen trouvé"
                    description={
                        searchTerm || selectedStatut || selectedCategorie
                            ? 'Aucun résultat pour vos critères'
                            : 'Commencez par ajouter un nouvel examen'
                    }
                    action={
                        (searchTerm || selectedStatut || selectedCategorie) && (
                            <Button variant="secondary" onClick={clearFilters}>
                                Effacer les filtres
                            </Button>
                        )
                    }
                />
            ) : (
                <TableContainer>
                    <Table>
                        <THead>
                            <tr>
                                <Th>N° Examen</Th>
                                <Th>Patient</Th>
                                <Th>Médecin</Th>
                                <Th>Type</Th>
                                <Th>Catégorie</Th>
                                <Th>Statut</Th>
                                <Th>Date</Th>
                                <Th align="center">Actions</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {pagedData.items.map((examen: Examen) => (
                                <Tr key={examen.idExamen}>
                                    <Td className="whitespace-nowrap">
                                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                                            {examen.numeroExamen}
                                        </span>
                                    </Td>
                                    <Td className="whitespace-nowrap font-medium text-gray-900">
                                        {examen.patientNom}
                                    </Td>
                                    <Td className="whitespace-nowrap text-gray-600">
                                        {examen.medecinNom}
                                    </Td>
                                    <Td className="whitespace-nowrap text-gray-600">
                                        {examen.typeExamen}
                                    </Td>
                                    <Td className="whitespace-nowrap text-gray-600">
                                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                                            {examen.libelleCategorie}
                                        </span>
                                    </Td>
                                    <Td className="whitespace-nowrap">
                                        {getStatutBadge(examen.statut)}
                                    </Td>
                                    <Td className="whitespace-nowrap text-gray-600">
                                        {format(new Date(examen.datePrescription), 'dd/MM/yyyy')}
                                    </Td>
                                    <Td className="whitespace-nowrap text-center">
                                        <div className="flex justify-center gap-2">
                                            <IconButton
                                                color="indigo"
                                                title="Voir détails"
                                                onClick={() => handleViewDetails(examen)}
                                            >
                                                <FaEye size={14} />
                                            </IconButton>
                                            {peutResultat && (
                                                <IconButton
                                                    color="blue"
                                                    title={peutGerer ? 'Modifier' : 'Saisir le résultat'}
                                                    onClick={() => handleEdit(examen)}
                                                >
                                                    <FaEdit size={14} />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                color="green"
                                                title={examen.idPrescription
                                                    ? 'Imprimer tous les examens de la prescription'
                                                    : "Imprimer l'examen"}
                                                onClick={() => {
                                                    if (examen.idPrescription) {
                                                        router.push(`/examens/prescriptions/${examen.idPrescription}/impression`);
                                                    } else {
                                                        router.push(`/examens/${examen.idExamen}/impression`);
                                                    }
                                                }}
                                            >
                                                <FaPrint size={14} />
                                            </IconButton>
                                            <IconButton
                                                color="gray"
                                                title="Imprimer l'etiquette (autocollant boite)"
                                                onClick={() => router.push(`/examens/${examen.idExamen}/etiquette`)}
                                            >
                                                <FaTags size={14} />
                                            </IconButton>
                                            {peutGerer && (
                                                <IconButton
                                                    color="red"
                                                    title="Supprimer"
                                                    onClick={() => handleDelete(examen)}
                                                >
                                                    <FaTrash size={14} />
                                                </IconButton>
                                            )}
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
                            onPageChange={handlePageChange}
                        />
                    )}
                </TableContainer>
            )}
        </div>
    );
}
