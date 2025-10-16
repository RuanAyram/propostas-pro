'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface UserProfile {
  id: number;
  userId: string;
  cpf: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProfileData {
  userId: string;
  cpf: string;
  phone: string;
}

export interface UpdateProfileData {
  cpf?: string;
  phone?: string;
}

export function useUserProfile(userId?: string) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (id?: string) => {
    const targetUserId = id || userId;
    if (!targetUserId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/profile?userId=${targetUserId}`);
      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
      } else if (response.status === 404) {
        // Perfil não existe
        setProfile(null);
      } else {
        // Outro erro
        throw new Error(data.error);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao buscar perfil';
      setError(errorMessage);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createProfile = useCallback(async (data: CreateProfileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao criar perfil');
      }

      setProfile(result.profile);
      toast.success('Perfil criado com sucesso!');
      return result.profile;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar perfil';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao atualizar perfil');
      }

      setProfile(result.profile);
      toast.success('Perfil atualizado com sucesso!');
      return result.profile;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar perfil';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    }
  }, [userId, fetchProfile]);

  return {
    loading,
    profile,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
  };
}