'use client';
import PersonnelForm from '@/app/components/personnel/PersonnelForm';
import { useParams } from 'next/navigation';


export default function ModifierPersonnelPage() {
  const { id } = useParams();
  return <PersonnelForm isEditMode id={Number(id)} />;
}