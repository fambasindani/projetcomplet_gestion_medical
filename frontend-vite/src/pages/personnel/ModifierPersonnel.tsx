import PersonnelForm from '@/components/personnel/PersonnelForm';
import { useParams } from 'react-router-dom';


export default function ModifierPersonnelPage() {
  const { id } = useParams();
  return <PersonnelForm isEditMode id={Number(id)} />;
}