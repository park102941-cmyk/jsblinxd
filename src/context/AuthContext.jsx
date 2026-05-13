import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Safety timeout: if Firebase doesn't respond in 5s, unblock the app
        const timeout = setTimeout(() => setLoading(false), 5000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            clearTimeout(timeout);
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setCurrentUser({ ...user, ...userDoc.data() });
                    } else {
                        setCurrentUser(user);
                    }
                } catch (err) {
                    console.error("Auth profile fetch error:", err);
                    setCurrentUser(user);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    }, []);

    const logout = () => firebaseSignOut(auth);

    return (
        <AuthContext.Provider value={{ currentUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
