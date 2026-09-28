/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { getMe, loginUser, logoutUser, isLoggedIn, isDemoMode, getDemoUser } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (isDemoMode()) {
                setUser(getDemoUser());
                setLoading(false);
                return;
            }
            if (isLoggedIn()) {
                try {
                    const { data } = await getMe();
                    setUser(data.user || data);
                } catch {
                    await logoutUser();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (credentials) => {
        if (isDemoMode()) {
            const data = { success: true, data: getDemoUser(), demo: true };
            setUser(data.data);
            return data;
        }
        const data = await loginUser(credentials);
        setUser(data.data);
        return data;
    };

    const logout = async () => {
        await logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
