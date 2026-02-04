import { useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const login = (email, userRole) => {
    setUser({ email });
    setRole(userRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
  };

  return { user, role, login, logout };
};