import { createContext, useContext, useState, useEffect } from "react";
import { getMe, loginUser, logoutUser, isLoggedIn } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (isLoggedIn()) {
                try {
                    const { data } = await getMe();
                    setUser(data.user || data);
                } catch {
                    logoutUser();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (credentials) => {
        const data = await loginUser(credentials);
        setUser(data.data);
        return data;
    };

    const logout = () => {
        logoutUser();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
