import { createContext,useState } from "react";

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user,setUser] = useState(null)

    const [Loading,setLoading] = useState(false)

    return (
        <AuthContext.Provider value={{user,setUser,Loading,setLoading}}>
            {children}
        </AuthContext.Provider>
    )
}
