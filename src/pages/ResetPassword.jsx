import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../lib/apiClient';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token'), [searchParams]);
  const email = useMemo(() => searchParams.get('email'), [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    setError('');
  }, [newPassword, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email || !token) {
      setError('Le lien de réinitialisation est invalide ou incomplet.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Merci de saisir et confirmer votre nouveau mot de passe.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.resetPassword(email, token, newPassword);
      const tokenFromApi = response?.data?.token || response?.token;
      const userFromApi = response?.data?.user || response?.user;

      if (tokenFromApi && userFromApi) {
        dispatch(signInSuccess({ user: userFromApi, token: tokenFromApi }));
        setMessage('Mot de passe mis à jour. Redirection en cours...');
        setTimeout(() => navigate('/'), 1200);
      } else {
        setMessage('Mot de passe mis à jour. Vous pouvez maintenant vous reconnecter.');
      }
    } catch (err) {
      setError(err?.message || 'Impossible de réinitialiser le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen mt-20'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        <div className='flex-1'>
          <Link to='/' className='font-bold dark:text-white text-4xl'>
            <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
              Trust
            </span>
            Blog
          </Link>
          <p className='text-sm mt-5'>
            Définissez un nouveau mot de passe sécurisé pour votre compte.
          </p>
        </div>

        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Nouveau mot de passe' />
              <TextInput
                type='password'
                placeholder='**********'
                id='newPassword'
                onChange={(e) => setNewPassword(e.target.value)}
                required
                value={newPassword}
                minLength={8}
              />
            </div>
            <div>
              <Label value='Confirmer le mot de passe' />
              <TextInput
                type='password'
                placeholder='**********'
                id='confirmPassword'
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                value={confirmPassword}
                minLength={8}
              />
            </div>
            <Button gradientDuoTone='purpleToPink' type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Mise à jour...</span>
                </>
              ) : (
                'Définir le nouveau mot de passe'
              )}
            </Button>
          </form>

          <div className='flex gap-2 text-sm mt-5'>
            <span>Retour à la connexion ?</span>
            <Link to='/sign-in' className='text-blue-500'>
              Connexion
            </Link>
          </div>

          {message && (
            <Alert className='mt-5' color='success'>
              {message}
            </Alert>
          )}

          {error && (
            <Alert className='mt-5' color='failure'>
              {error}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
