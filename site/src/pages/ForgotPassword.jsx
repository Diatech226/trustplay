import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../lib/apiClient';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Veuillez saisir votre email.');
      return;
    }

    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      setMessage('Si un compte existe, un lien de réinitialisation a été envoyé.');
    } catch (err) {
      setError(err?.message || "Impossible d'envoyer le lien de réinitialisation.");
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
            Entrez votre email pour recevoir un lien sécurisé de réinitialisation de mot de passe.
          </p>
        </div>

        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Votre email' />
              <TextInput
                type='email'
                placeholder='name@company.com'
                id='email'
                onChange={(e) => setEmail(e.target.value.trim())}
                required
                value={email}
              />
            </div>

            <Button gradientDuoTone='purpleToPink' type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Envoi...</span>
                </>
              ) : (
                'Envoyer le lien'
              )}
            </Button>
          </form>

          <div className='flex gap-2 text-sm mt-5'>
            <span>Vous vous souvenez de votre mot de passe ?</span>
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
