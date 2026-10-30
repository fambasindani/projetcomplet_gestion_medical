import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaEdit, FaUserMd, FaCalendarAlt, FaHospital, FaCheckCircle } from 'react-icons/fa';
import { soinInfirmierService } from '@/services/soinInfirmierService';
import type { SoinInfirmier } from '@/types/soin';
import SkeletonDetails from '@/ui/SkeletonDetails';
import PageShell from '@/ui/PageShell';
import DetailBanner from '@/ui/DetailBanner';
import { InfoGrid, InfoCard } from '@/ui/InfoCard';
import Button from '@/ui/Button';

export default function SoinInfirmierDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [soin, setSoin] = useState<SoinInfirmier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/hospitalisations/soins');
      return;
    }
    soinInfirmierService.getById(Number(id))
      .then(setSoin)
      .catch(() => {
        console.error('Chargement échoué');
        navigate('/hospitalisations/soins');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!soin) return <div className="p-6 text-center">Soin non trouvé</div>;

  return (
    <PageShell
      title="Détails du soin infirmier"
      maxWidth="max-w-6xl"
      onBack={() => navigate('/hospitalisations/soins')}
      actions={
        <>
            <Button icon={<FaEdit />} onClick={() => navigate(`/hospitalisations/soins/${soin.idSoin}/modifier`)}>
              Modifier
            </Button>
        </>
      }
    >

      <DetailBanner
        meta="Soin infirmier"
        title={soin.typeSoin}
        subtitle={`Soin infirmier #${soin.idSoin}`}
      >
        <InfoGrid>
          <InfoCard icon={FaCalendarAlt} label="Date" value={format(new Date(soin.dateSoin), 'dd/MM/yyyy à HH:mm', { locale: fr })} />
          <InfoCard icon={FaUserMd} label="Infirmier" value={soin.infirmierNom || `ID ${soin.idInfirmier}`} />
          <InfoCard icon={FaHospital} label="Hospitalisation" value={`#${soin.idHospitalisation} — ${soin.patientNom || 'Patient inconnu'}`} />
          <InfoCard icon={FaCheckCircle} label="Signature infirmier" value={soin.signatureInfirmier ? 'Signé' : 'Non signé'} />
        </InfoGrid>

        <div className="space-y-4 px-6 pb-6">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-gray-700">{soin.description || 'Aucune description'}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Observations</p>
            <p className="mt-1 whitespace-pre-wrap text-gray-700">{soin.observations || 'Aucune observation'}</p>
          </div>
        </div>
      </DetailBanner>
    </PageShell>
  );
}
