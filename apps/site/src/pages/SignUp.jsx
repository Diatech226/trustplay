import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/apiClient';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value.trim() });
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username) {
      errors.username = 'Veuillez indiquer votre nom.';
    }
    if (!formData.email) {
      errors.email = 'Veuillez renseigner votre email.';
    }
    if (!formData.password) {
      errors.password = 'Veuillez choisir un mot de passe.';
    }
    if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: payload,
      });

      setLoading(false);
      navigate('/sign-in');
    } catch (error) {
      setErrorMessage(error?.message || 'Impossible de créer le compte');
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <Link to='/' className='inline-flex items-center justify-center font-bold text-3xl'>
            <span className='px-3 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
              Trust
            </span>
            <span className='ml-2 text-gray-900 dark:text-white'>Media</span>
          </Link>
          <p className='mt-3 text-sm text-gray-500 dark:text-gray-400'>
            Créez un compte pour rejoindre la rédaction.
          </p>
        </div>

        <div className='rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-6 sm:p-8'>
          <div className='text-center mb-6'>
            <h1 className='text-2xl font-semibold text-gray-900 dark:text-white'>Créer un compte</h1>
            <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
              Quelques informations suffisent pour démarrer.
            </p>
          </div>

          {errorMessage && (
            <Alert className='mb-4' color='failure'>
              {errorMessage}
            </Alert>
          )}

          <form className='space-y-4' onSubmit={handleSubmit}>
            <div>
              <Label htmlFor='username' value='Nom complet' />
              <TextInput
                type='text'
                placeholder='Votre nom'
                id='username'
                name='username'
                onChange={handleChange}
                required
                disabled={loading}
                value={formData.username}
                autoComplete='name'
                color={fieldErrors.username ? 'failure' : 'gray'}
              />
              {fieldErrors.username && (
                <p className='mt-1 text-xs text-red-600'>{fieldErrors.username}</p>
              )}
            </div>
            <div>
              <Label htmlFor='email' value='Adresse email' />
              <TextInput
                type='email'
                placeholder='vous@entreprise.com'
                id='email'
                name='email'
                onChange={handleChange}
                required
                disabled={loading}
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
                  placeholder='Créer un mot de passe'
                  id='password'
                  name='password'
                  onChange={handleChange}
                  required
                  disabled={loading}
                  value={formData.password}
                  autoComplete='new-password'
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
            <div>
              <Label htmlFor='confirmPassword' value='Confirmer le mot de passe (optionnel)' />
              <TextInput
                type={showPassword ? 'text' : 'password'}
                placeholder='Confirmer le mot de passe'
                id='confirmPassword'
                name='confirmPassword'
                onChange={handleChange}
                disabled={loading}
                value={formData.confirmPassword}
                autoComplete='new-password'
                color={fieldErrors.confirmPassword ? 'failure' : 'gray'}
              />
              {fieldErrors.confirmPassword && (
                <p className='mt-1 text-xs text-red-600'>{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <Button
              gradientDuoTone='purpleToPink'
              type='submit'
              disabled={loading}
              className='w-full'
            >
              {loading ? (
                <span className='flex items-center justify-center gap-2'>
                  <Spinner size='sm' />
                  Création...
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 text-sm mt-6'>
            <span className='text-gray-600 dark:text-gray-300'>Already have an account?</span>
            <Link to='/sign-in' className='text-blue-500 hover:underline'>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
