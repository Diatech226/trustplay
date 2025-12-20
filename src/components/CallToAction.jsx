import { Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

export default function CallToAction() {
  const navigate = useNavigate(); // Hook pour la navigation

  const handleNavigate = () => {
    navigate('/production'); // Redirection vers la page
  };

  return (
    <div className="flex flex-col sm:flex-row p-4 border border-teal-500 rounded-tl-3xl rounded-br-3xl text-center sm:text-left items-center">
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Plongez dans l'univers de l'audio-visuel
        </h2>
        <p className="text-gray-500 my-2">
          Découvrez nos productions et nos articles passionnants !
        </p>
        <Button
          gradientDuoTone="purpleToPink"
          className="rounded-tl-xl rounded-bl-none mt-3"
          onClick={handleNavigate} // Ajout du onClick pour navigation
        >
          Explorer Trust Production
        </Button>
      </div>
      <div className="flex-1 p-4 sm:p-7">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/f/f3/Audio_video.jpg"
          alt="Audio Vidéo"
          className="w-full h-auto rounded-lg shadow-md"
          loading='lazy'
          decoding='async'
          width='640'
          height='360'
        />
      </div>
    </div>
  );
}
