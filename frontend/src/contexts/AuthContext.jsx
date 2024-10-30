import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = (props) => {
    const [user, setUser] = useState(null);
    const [ admin, setAdmin ] = useState(null);

    return (
        <AuthContext.Provider value={{ user, setUser, admin, setAdmin }}>
        {props.children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);