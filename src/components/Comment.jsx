import moment from 'moment';
import { useEffect, useState } from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Button, Textarea } from 'flowbite-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Comment({ comment, onLike, onEdit, onDelete }) {
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { currentUser } = useSelector((state) => state.user);
  // Récupérer les informations utilisateur lorsque le composant est monté
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/${comment.id}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);  // Mettre à jour l'utilisateur avec les données récupérées
        }
      } catch (error) {
        console.error('Erreur de récupération des informations utilisateur:', error);
      }
    };

    fetchUser();
  }, [API_URL, comment.id]);

  const handleSave = async () => {
    if (!currentUser) {
      console.log("L'utilisateur doit être connecté pour modifier un commentaire.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/comment/editComment/${comment.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          content: editedContent,
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        onEdit(comment, editedContent);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className='flex p-4 border-b dark:border-gray-600 text-sm'>
      <div className='flex-shrink-0 mr-3'>
        <img
          className='w-10 h-10 rounded-full bg-gray-200'
          src={user.profilePicture || '/default-avatar.png'} // Si pas d'avatar, mettre un avatar par défaut
          alt={user.username || 'Utilisateur inconnu'}
        />
      </div>
      <div className='flex-1'>
        <div className='flex items-center mb-1'>
          <span className='font-bold mr-1 text-xs truncate'>
            {user.username ? `@${user.username}` : 'Utilisateur anonyme'}
          </span>
          <span className='text-gray-500 text-xs'>
            {moment(comment.createdAt).fromNow()}
          </span>
        </div>
        {isEditing ? (
          <>
            <Textarea
              className='mb-2'
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className='flex justify-end gap-2 text-xs'>
              <Button
                type='button'
                size='sm'
                gradientDuoTone='purpleToBlue'
                onClick={handleSave}
              >
                Sauvegarder
              </Button>
              <Button
                type='button'
                size='sm'
                gradientDuoTone='purpleToBlue'
                outline
                onClick={() => setIsEditing(false)}
              >
                Retour
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className='text-gray-500 pb-2'>{comment.content}</p>
            <div className='flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2'>
              <button
                type='button'
                onClick={() => onLike(comment.id)}
                className={`text-gray-400 hover:text-blue-500 ${
                  currentUser && comment.likes.includes(currentUser.id) && '!text-blue-500'
                }`}
              >
                <FaThumbsUp className='text-sm' />
              </button>
              <p className='text-gray-400'>
                {comment.numberOfLikes > 0 &&
                  `${comment.numberOfLikes} ${comment.numberOfLikes === 1 ? 'like' : 'likes'}`}
              </p>
              {currentUser && currentUser.id === comment.userId && (
                <>
                  <button
                    type='button'
                    onClick={() => {
                      setIsEditing(true);
                      setEditedContent(comment.content);
                      onEdit?.(comment.id);
                    }}
                    className='text-gray-400 hover:text-blue-500'
                  >
                    Modifier
                  </button>
                  <button
                    type='button'
                    onClick={() => onDelete(comment.id)}
                    className='text-gray-400 hover:text-red-500'
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
