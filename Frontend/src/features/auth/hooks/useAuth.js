import { useContext,useEffect } from "react";
import { AuthContext } from "../auth.context";
import { login,register,logout,getMe,googleLogin } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user,setUser,Loading,setLoading } = context

    const handleLogin = async({email,password}) => {
        setLoading(true)
        try {
            const data = await login({email,password})
            if (data && data.user) {
                setUser(data.user)
                sessionStorage.setItem("authSessionActive", "true");
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
                sessionStorage.setItem("authSessionActive", "true");
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
            sessionStorage.removeItem("authSessionActive");
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async (token) => {
        setLoading(true)
        try {
            const data = await googleLogin(token)
            if (data && data.user) {
                setUser(data.user)
                sessionStorage.setItem("authSessionActive", "true");
                return { success: true }
            }
            return { success: false, error: data?.message || "Google Authentication failed" }
        } catch (err) {
            console.error(err)
            return { success: false, error: "Google authentication failed" }
        } finally {
            setLoading(false)
        }
    }

    useEffect(()=>{
        const getAndSetUser = async() => {
            const sessionActive = sessionStorage.getItem("authSessionActive");
            if (!sessionActive) {
                try {
                    await logout();
                } catch (e) {
                    // Ignore errors during silent cleanup
                }
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const data = await getMe()
                if (data && data.user) {
                    setUser(data.user)
                } else {
                    setUser(null)
                    sessionStorage.removeItem("authSessionActive");
                }
            } catch (err) {
                console.error("Session restoration failed:", err)
                setUser(null)
                sessionStorage.removeItem("authSessionActive");
            } finally {
                setLoading(false)
            }
        }
        getAndSetUser()
    },[])


    return {user,Loading,handleRegister,handleLogin,handleLogout,handleGoogleLogin } 

}