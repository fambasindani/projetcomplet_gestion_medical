import PersonnelList from '@/app/components/personnel/PersonnelList';

export default function PersonnelInfirmiersPage() {
  return (
    <PersonnelList
      fonctionFixe="Infirmier"
      titre="Infirmiers"
      labelAjout="Nouvel infirmier"
    />
  );
}
