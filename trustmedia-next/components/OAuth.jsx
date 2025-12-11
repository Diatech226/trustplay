"use client";

// migrated from Vite React route to Next.js app router


import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess, signInFailure, signInStart } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/apiClient';

export default function OAuth() {
  const auth = getAuth(app);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      dispatch(signInStart());
      const resultsFromGoogle = await signInWithPopup(auth, provider);
      const data = await apiRequest('/api/auth/google', {
        method: 'POST',
        body: {
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL,
        },
      });

      const token = data.token || data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      const user = data.user || data.data?.user || data;
      dispatch(signInSuccess({ ...user, token }));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };
  return (
    <Button type='button' gradientDuoTone='pinkToOrange' outline onClick={handleGoogleClick}>
      <AiFillGoogleCircle className='w-6 h-6 mr-2' />
      Continue with Google
    </Button>
  );
}
