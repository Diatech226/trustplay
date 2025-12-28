import { Alert, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import { apiRequest } from '../lib/apiClient';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { loading: authLoading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const returnToParam = searchParams.get('returnTo');
  const reasonParam = searchParams.get('reason');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value.trim() });
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Veuillez renseigner votre email.';
    }
    if (!formData.password) {
      errors.password = 'Veuillez renseigner votre mot de passe.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);
    try {
      dispatch(signInStart());
      const authResponse = await apiRequest('/api/auth/signin', {
        method: 'POST',
        body: formData,
      });

      const token = authResponse?.data?.token || authResponse?.token;
      const userFromAuth = authResponse?.data?.user || authResponse?.user;

      let profile = userFromAuth;
      if (token && !profile) {
        const meResponse = await apiRequest('/api/user/me', { auth: true });
        profile = meResponse.user || meResponse.data?.user || meResponse?.data || meResponse;
      }

      if (!profile || !token) {
        throw new Error('Utilisateur introuvable après connexion');
      }

      dispatch(signInSuccess({ user: profile, token }));

      const fromState = location.state?.from;
      const fromQuery = returnToParam && returnToParam !== '/sign-in' ? returnToParam : null;
      const redirectTarget =
        fromQuery ||
        (typeof fromState === 'string'
          ? fromState
          : fromState?.pathname && fromState?.pathname !== '/sign-in'
          ? `${fromState.pathname}${fromState.search || ''}${fromState.hash || ''}`
          : profile?.role === 'ADMIN'
          ? '/dashboard'
          : '/');

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      dispatch(signInFailure(error?.message || 'Impossible de se connecter'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-10'>
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <Link to='/' className='inline-flex items-center justify-center font-bold text-3xl'>
            <span className='px-3 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
              Trust
            </span>
            <span className='ml-2 text-gray-900 dark:text-white'>Media</span>
          </Link>
          <p className='mt-3 text-sm text-gray-500 dark:text-gray-400'>
            Connectez-vous pour accéder à votre espace.
          </p>
        </div>

        <div className='relative z-10 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6 sm:p-8'>
          <div className='text-center mb-6'>
            <h1 className='text-2xl font-semibold text-gray-900 dark:text-white'>Se connecter</h1>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
              Accédez à vos contenus et à votre tableau de bord.
            </p>
          </div>

          {reasonParam === 'unauthorized' && (
            <Alert className='mb-4' color='warning'>
              Votre session a expiré. Merci de vous reconnecter.
            </Alert>
          )}

          {errorMessage && (
            <Alert className='mb-4' color='failure'>
              {errorMessage}
            </Alert>
          )}

          <form className='space-y-4' onSubmit={handleSubmit}>
            <div>
              <Label htmlFor='email' value='Adresse email' />
              <TextInput
                type='email'
                placeholder='vous@entreprise.com'
                id='email'
                name='email'
                onChange={handleChange}
                required
                disabled={loading || authLoading}
                value={formData.email}
                autoComplete='email'
                color={fieldErrors.email ? 'failure' : 'gray'}
              />
              {fieldErrors.email && (
                <p className='mt-1 text-xs text-red-600'>{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <Label htmlFor='password' value='Mot de passe' />
              <div className='relative'>
                <TextInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder='••••••••'
                  id='password'
                  name='password'
                  onChange={handleChange}
                  required
                  disabled={loading || authLoading}
                  value={formData.password}
                  autoComplete='current-password'
                  className='pr-16'
                  color={fieldErrors.password ? 'failure' : 'gray'}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword((prev) => !prev)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 hover:text-blue-700'
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
              {fieldErrors.password && (
                <p className='mt-1 text-xs text-red-600'>{fieldErrors.password}</p>
              )}
            </div>

            <button
              type='submit'
              className='w-full rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400'
            >
              {loading || authLoading ? (
                <span className='flex items-center justify-center gap-2'>
                  <Spinner size='sm' />
                  Connexion...
                </span>
              ) : (
                'Sign in / Se connecter'
              )}
            </button>

            <div className='text-right'>
              <Link to='/forgot-password' className='text-sm text-blue-500 hover:underline'>
                Mot de passe oublié ?
              </Link>
            </div>
          </form>

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 text-sm mt-6'>
            <span className='text-gray-600 dark:text-gray-300'>Pas encore de compte ?</span>
            <Link to='/sign-up' className='text-blue-500 hover:underline'>
              Create account / S’inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
