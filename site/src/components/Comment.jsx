import moment from 'moment';
import { FaThumbsUp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { resolveMediaUrl } from '../lib/mediaUrls';

export default function Comment({ comment, onDelete }) {
  const { currentUser } = useSelector((state) => state.user);
  const commentId = comment._id || comment.id;
  const displayName = comment.userName || comment.username || 'Utilisateur';
  const avatar = resolveMediaUrl(comment.profilePicture) || '/default-avatar.png';
  const createdAt = comment.createdAt || comment.created_on;

  return (
    <div className='flex p-4 border-b dark:border-gray-600 text-sm'>
      <div className='flex-shrink-0 mr-3'>
        <img
          className='w-10 h-10 rounded-full bg-gray-200'
          src={avatar}
          alt={displayName}
          loading='lazy'
          decoding='async'
          width='40'
          height='40'
        />
      </div>
      <div className='flex-1'>
        <div className='flex items-center mb-1'>
          <span className='font-bold mr-1 text-xs truncate'>@{displayName}</span>
          {createdAt && (
            <span className='text-gray-500 text-xs'>
              {moment(createdAt).fromNow()}
            </span>
          )}
        </div>
        <p className='text-gray-500 pb-2'>{comment.content}</p>
        <div className='flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2'>
          <button type='button' disabled className='text-gray-400'>
            <FaThumbsUp className='text-sm' />
          </button>
          <p className='text-gray-400'>
            {comment.numberOfLikes > 0 &&
              `${comment.numberOfLikes} ${comment.numberOfLikes === 1 ? 'like' : 'likes'}`}
          </p>
          {currentUser && (currentUser._id === comment.userId || currentUser.id === comment.userId) && (
            <button
              type='button'
              onClick={() => onDelete?.(commentId)}
              className='text-gray-400 hover:text-red-500'
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
