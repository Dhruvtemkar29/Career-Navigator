
import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        if (!token) {
            setLoading(false);
            return;
        }

        api.get('/auth/me')
            .then(response => setUser(response.data))
            .catch(() => {
                localStorage.removeItem('access_token');
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        localStorage.setItem(
            'access_token',
            response.data.access_token
        );

        setUser(response.data.user);
        return response.data;
    };

    const register = async (full_name, email, password) => {
        const response = await api.post('/auth/register', {
            full_name,
            email,
            password
        });

        localStorage.setItem(
            'access_token',
            response.data.access_token
        );

        setUser(response.data.user);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: Boolean(user)
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }

    return context;
}
