import { useContext,useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login,register,logout,getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user,setUser,Loading,setLoading } = context

    const handleLogin = async({email,password}) => {
        setLoading(true)
        try {
            const data = await login({email,password})
            if (data && data.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false, error: data?.message || "Login failed" }
        } catch (err) {
            console.error(err)
            return { success: false, error: "An unexpected error occurred" }
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async({username,email,password}) => {
        setLoading(true)
        try {
            const data = await register({username,email,password})
            if (data && data.user) {
                setUser(data.user)
                return { success: true }
            }
            return { success: false, error: data?.message || "Registration failed" }
        } catch (err) {
            console.error(err)
            return { success: false, error: "An unexpected error occurred" }
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(()=>{
        const getAndSetUser = async() => {
            try {
                const data = await getMe()
                if (data && data.user) {
                    setUser(data.user)
                } else {
                    setUser(null)
                }
            } catch (err) {
                console.error("Session restoration failed:", err)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        getAndSetUser()
    },[])


    return {user,Loading,handleRegister,handleLogin,handleLogout } 

}