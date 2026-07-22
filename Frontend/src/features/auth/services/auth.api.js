import axios from "axios"

export async function register({username,email,password}){
try{
    const response = await axios.post('http://localhost:3000/api/auth/register',{
        username,email,password
    },{
        withCredentials: true
    })
     return response.data

} catch (err) {
    console.log(err)
}

}


export async function login({email,password}){
    try{
         const response = await axios.post("http://localhost:3000/api/auth/login",{
            email,password
         },{
            withCredentials: true
         })
         return response.data
    }catch(err){
        console.log(err)
    }
}


export async function logout(){
    try{
         const response = await axios.get("http://localhost:3000/api/auth/logout",{
            withCredentials: true
         })
         return response.data
    } catch (err){
        console.log(err)
    }
}


export async function getMe(){
    try{
        const response = await axios.get("http://localhost:3000/api/auth/get-me",{
            withCredentials: true
        })
        return response.data
    } catch (err){
        console.log(err)
    }
}

export async function googleLogin(token) {
    try {
        const response = await axios.post("http://localhost:3000/api/auth/google", { token }, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.error("Google Auth API error:", err);
        throw err;
    }
}

export async function getUserProfile() {
    try {
        const response = await axios.get("http://localhost:3000/api/auth/profile", {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.error("getUserProfile API error:", err);
        throw err;
    }
}

export async function updateUserProfile(data) {
    try {
        const response = await axios.put("http://localhost:3000/api/auth/profile", data, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.error("updateUserProfile API error:", err);
        throw err;
    }
}