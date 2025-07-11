
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Données simulées pour la démo
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@company.com',
    firstName: 'Admin',
    lastName: 'System',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'ingenieur1',
    email: 'ingenieur@company.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'ingenieurpr',
    isActive: true,
    mustChangePassword: true,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    username: 'validateur1',
    email: 'validateur@company.com',
    firstName: 'Marie',
    lastName: 'Martin',
    role: 'validateur',
    isActive: true,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '4',
    username: 'observateur1',
    email: 'observateur@company.com',
    firstName: 'Pierre',
    lastName: 'Bernard',
    role: 'observateur',
    isActive: true,
    createdAt: '2024-01-20T00:00:00Z'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulation de la vérification du token au démarrage
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulation d'un appel API avec délai
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.username === username);
    
    if (foundUser && password === 'password123') {
      const token = `mock_token_${foundUser.id}_${Date.now()}`;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(foundUser));
      
      setUser(foundUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (currentPassword === 'password123') {
      // Mise à jour de l'utilisateur pour supprimer le flag mustChangePassword
      const updatedUser = { ...user, mustChangePassword: false };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      return true;
    }
    
    return false;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    changePassword,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
