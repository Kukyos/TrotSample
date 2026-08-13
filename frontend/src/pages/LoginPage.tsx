import { useState, type FormEvent } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'
import { signInWithPassword, signUpWithPassword } from '../services/auth'

type Mode = 'login' | 'signup'

export function LoginPage() {
  const { status } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('login')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  if (status === 'loading') {
    return <main className="auth-state" role="status">Checking your session…</main>
  }

  if (status === 'authenticated') return <Navigate to="/dashboard" replace />

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode)
    setError('')
    setNotice('')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setNotice('')

    const trimmedEmail = email.trim()
    if (!trimmedEmail) return setError('Enter your email address.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (mode === 'signup' && !displayName.trim()) {
      return setError('Enter the name you want other travellers to see.')
    }

    setPending(true)
    try {
      if (mode === 'login') {
        await signInWithPassword(trimmedEmail, password)
        navigate('/dashboard', { replace: true })
      } else {
        const result = await signUpWithPassword({
          displayName,
          email: trimmedEmail,
          password,
        })
        if (result.requiresEmailConfirmation) {
          setNotice('Account created. Check your email to confirm your address, then log in.')
          setMode('login')
          setPassword('')
        } else {
          navigate('/dashboard', { replace: true })
        }
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Authentication failed. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro" aria-label="GlobeTrotter introduction">
        <Link className="wordmark" to="/">GLOBE<span>/</span>TROTTER</Link>
        <p className="auth-index">ACCESS / 01</p>
        <div>
          <p className="hero-kicker">YOUR JOURNEY STARTS HERE</p>
          <h1>Plan the world.<span className="display-italic">Keep it yours.</span></h1>
          <p className="auth-intro-copy">Sign in to keep every city, day, and budget connected in one clear travel plan.</p>
        </div>
      </section>

      <section className="auth-panel" aria-labelledby="auth-title">
        <Link className="auth-back" to="/">← Back to home</Link>
        <div className="auth-card">
          <p className="auth-eyebrow">MEMBER ACCESS</p>
          <h2 id="auth-title">{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2>
          <p>{mode === 'login' ? 'Continue building the trip you started.' : 'Turn the places in your head into a journey you can follow.'}</p>

          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')}>Log in</button>
            <button type="button" role="tab" aria-selected={mode === 'signup'} onClick={() => switchMode('signup')}>Sign up</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === 'signup' && (
              <label>Display name<input name="displayName" autoComplete="name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} disabled={pending} /></label>
            )}
            <label>Email address<input name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={pending} /></label>
            <label>Password<input name="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} disabled={pending} /><small>At least 6 characters</small></label>

            {error && <p className="auth-message is-error" role="alert">{error}</p>}
            {notice && <p className="auth-message is-success" role="status">{notice}</p>}

            <button className="auth-submit" type="submit" disabled={pending}>{pending ? 'Please wait…' : mode === 'login' ? 'Log in →' : 'Create account →'}</button>
          </form>
        </div>
      </section>
    </main>
  )
}
