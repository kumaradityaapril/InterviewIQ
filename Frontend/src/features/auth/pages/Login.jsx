import { useState } from 'react'
import "../auth.form.scss"
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { user, Loading, handleLogin, handleLogout } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({ email, password })
        navigate("/")
    }

    if (Loading) {
        return (<main><h1>Loading...</h1></main>)
    }

    if (user) {
        return (
            <main>
                <div className="form-container">
                    <h1>Welcome, {user.username}!</h1>
                    <p>You are logged in successfully.</p>
                    <button
                        onClick={handleLogout}
                        className='button primary-button'
                        style={{ marginTop: '20px' }}
                    >
                        Logout
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main>
            <div className="form-container">
                <h1>Login</h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor='email'>Email</label>
                        <input
                            onChange={(e) => { setEmail(e.target.value) }}
                            type='email' name='email' id='email' placeholder='enter your email'
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor='password'>Password</label>
                        <input
                            onChange={(e) => { setPassword(e.target.value) }}
                            type='password' name='password' id='password' placeholder='enter your password'
                        />
                    </div>
                    <button className='button primary-button' type='submit'>Login</button>
                </form>
                <p>Don't have an account? <Link to={"/register"}>Register</Link> </p>
            </div>
        </main>
    )
}

export default Login
