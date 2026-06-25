import { useState } from 'react'
import { supabase } from '../supabaseClient'

// Pantalla de acceso. Solo entran usuarios dados de alta por el equipo
// (no hay registro público). El acceso real lo controla el RLS de Supabase,
// que exige usuario autenticado del dominio @freedomtwin.com.
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw error
      // onAuthStateChange en App.jsx detecta la sesión y renderiza el tablero.
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos.'
          : `No se pudo iniciar sesión: ${err.message}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__brand">
          <span className="login__dot" />
          <h1 className="login__title">Central de Tareas</h1>
        </div>
        <p className="login__subtitle">Freedom · The Twin Factory</p>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tunombre@freedomtwin.com"
            autoComplete="username"
            autoFocus
            required
          />
        </label>

        <label className="field">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="login__error">{error}</p>}

        <button type="submit" className="btn btn--primary login__submit" disabled={loading}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="login__hint">
          Acceso solo para el equipo de Freedom. Si no tienes cuenta, pídesela a
          Lucas.
        </p>
      </form>
    </div>
  )
}
