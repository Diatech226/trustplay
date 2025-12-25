import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import { apiRequest } from '../lib/apiClient';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { loading, error: errorMessage } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const returnToParam = searchParams.get('returnTo');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return dispatch(signInFailure('Please fill all the fields'));
    }

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
          : profile?.role && ['ADMIN', 'EDITOR', 'AUTHOR'].includes(profile.role)
          ? '/dashboard'
          : '/');

      navigate(redirectTarget, { replace: true });
    } catch (error) {
      dispatch(signInFailure(error?.message || 'Impossible de se connecter'));
    }
  };

  return (
    <div className='min-h-screen mt-20'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        {/* Left Side */}
        <div className='flex-1'>
          <Link to='/' className='font-bold dark:text-white text-4xl'>
            <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
              Trust
            </span>
            Blog
          </Link>
          <p className='text-sm mt-5'>
            This is a demo project. You can sign in with your email and password.
          </p>
        </div>

        {/* Right Side */}
        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Your email' />
              <TextInput
                type='email'
                placeholder='name@company.com'
                id='email'
                onChange={handleChange}
                required
                value={formData.email}
              />
            </div>
            <div>
              <Label value='Your password' />
              <TextInput
                type='password'
                placeholder='**********'
                id='password'
                onChange={handleChange}
                required
                value={formData.password}
              />
              <div className='text-right mt-1'>
                <Link to='/forgot-password' className='text-sm text-blue-500'>
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>
            <Button
              gradientDuoTone='purpleToPink'
              type='submit'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Loading...</span>
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className='flex gap-2 text-sm mt-5'>
            <span>Don't have an account?</span>
            <Link to='/sign-up' className='text-blue-500'>
              Sign Up
            </Link>
          </div>
          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
