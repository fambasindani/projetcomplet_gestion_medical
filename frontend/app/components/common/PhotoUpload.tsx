'use client';

import React, { useRef, useState, useMemo } from 'react';
import { FaCamera, FaTrash, FaUpload, FaUserMd } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import api from '@/app/services/api';

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photoUrl: string) => void;
  onPhotoRemove: () => void;
  name: string;
}

interface UploadResponse {
  url: string;
  message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const BASE_URL = API_URL.replace('/api', '');

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhoto,
  onPhotoChange,
  onPhotoRemove,
  name,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tempPreview, setTempPreview] = useState<string | null>(null);

  const getFullImageUrl = (photo: string | null | undefined): string | null => {
    if (!photo) return null;
    if (photo.startsWith('blob:')) return photo;
    if (photo.startsWith('/uploads')) return `${BASE_URL}${photo}`;
    if (photo.startsWith('http')) return photo;
    return photo;
  };

  const previewUrl = useMemo(() => {
    if (tempPreview) return tempPreview;
    return getFullImageUrl(currentPhoto);
  }, [tempPreview, currentPhoto]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setTempPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<UploadResponse>(
        `/upload/image?folder=medecins`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const serverUrl = response.data.url;
      onPhotoChange(serverUrl);
      setTempPreview(null);
      toast.success('Photo uploadée avec succès');
    } catch (err) {
      console.error('❌ Erreur upload:', err);
      let message = 'Erreur lors de l\'upload';
      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      toast.error(message);
      setTempPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    setTempPreview(null);
    onPhotoRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClick = () => fileInputRef.current?.click();

  return (
    <div className="w-full">
      <div className="relative aspect-square w-full overflow-hidden rounded-full bg-gray-100">
        {uploading ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">Upload en cours...</p>
          </div>
        ) : previewUrl ? (
          <div className="group relative h-full w-full">
            <img
              src={previewUrl}
              alt={name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/default-avatar.png';
              }}
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={handleClick}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-indigo-600 shadow-md transition-transform hover:scale-110"
                title="Changer la photo"
              >
                <FaCamera size={14} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition-transform hover:scale-110"
                title="Supprimer la photo"
              >
                <FaTrash size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 transition-all hover:from-indigo-100 hover:to-purple-100"
          >
            <FaUserMd className="mb-2 text-4xl text-indigo-500" />
            <p className="text-sm font-semibold text-gray-700">{name || 'Médecin'}</p>
            <small className="text-xs text-gray-500">Cliquez pour ajouter une photo</small>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {!previewUrl && !uploading && (
        <button
          type="button"
          onClick={handleClick}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <FaUpload className="text-indigo-500" />
          Choisir une photo
        </button>
      )}
    </div>
  );
};

export default PhotoUpload;