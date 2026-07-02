import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { authService, userService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes from Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('token', token);
          
          // Verify with local database and load SQL profile
          const data = await userService.getProfile();
          if (data.success) {
            setUser(data.user);
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error('Firebase Auth sync failed:', error);
          // If we fail on startup, it might be due to missing registration profile
          setUser(null);
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();
      
      // Store token immediately for request interceptor
      localStorage.setItem('token', idToken);
      
      // Sync login session details
      const data = await authService.login();
      if (data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        // Rollback Firebase session if SQL profile doesn't exist
        await signOut(auth);
        localStorage.removeItem('token');
        return { success: false, message: data.message };
      }
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Invalid email address format.';
      }
      return { success: false, message: msg };
    }
  };

  const handleRegister = async (userData) => {
    const { email, password, name, phone, role } = userData;
    let firebaseUser = null;

    try {
      // 1. Create account in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();
      
      localStorage.setItem('token', idToken);

      // 2. Synchronize profile details in MySQL
      const data = await authService.register({ name, phone, role });
      if (data.success) {
        setUser(data.user);
        return { success: true };
      } else {
        // Rollback Firebase account if DB sync fails
        if (firebaseUser) await firebaseUser.delete();
        localStorage.removeItem('token');
        return { success: false, message: data.message };
      }
    } catch (error) {
      let msg = error.response?.data?.message || error.message;
      if (error.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password is too weak. Must be at least 6 characters.';
      }
      
      // Cleanup Firebase if registration fails during SQL syncing
      if (firebaseUser && error.code !== 'auth/email-already-in-use' && error.code !== 'auth/weak-password') {
        try {
          await firebaseUser.delete();
        } catch (e) {
          console.error('Failed to cleanup Firebase account:', e);
        }
        localStorage.removeItem('token');
      }

      return { success: false, message: msg };
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUserProfile,
    isAdmin: user?.role === 'admin'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
