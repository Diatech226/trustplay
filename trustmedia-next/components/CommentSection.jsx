"use client";

// migrated from Vite React route to Next.js app router


import { Alert, Button, Modal, Textarea, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Comment from './Comment';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { apiRequest } from '../utils/apiClient';

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/api/comment/getPostComments/${postId}`);
        setComments(data.comments || data);
      } catch (error) {
        console.error(error.message);
        setCommentError("Impossible de charger les commentaires.");
      } finally {
        setLoading(false);
      } 
    };

    fetchComments();
  }, [postId]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser || !(currentUser?.id || currentUser?._id)) {
      setCommentError("Vous devez être connecté pour commenter.");
      return;
    }
    
    if (!comment.trim()) {
      setCommentError("Le commentaire ne peut pas être vide.");
      return;
    }
    setSubmitting(true);
    try {
      const responseData = await apiRequest('/api/comment/create', {
        method: 'POST',
        auth: true,
        body: {
          content: comment,
          postId,
        },
      });

      const createdComment = responseData.comment || responseData;
      setComments((prev) => [
        ...prev,
        {
          ...createdComment,
          userName: currentUser.username,
          profilePicture: currentUser.profilePicture,
        },
      ]);
      setComment("");
      setCommentError(null);
    } catch (error) {
      console.error("Error adding comment:", error.message);
      setCommentError(error.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto w-full p-3">
      {currentUser ? (
        <div className="flex items-center gap-1 my-5 text-gray-500 text-sm">
          <p>Connecté en tant que</p>
          <img className="h-5 w-5 object-cover rounded-full" src={currentUser.profilePicture} alt="" />
          <Link to="/dashboard/profile" className="text-xs text-cyan-600 hover:underline">
            @{currentUser.username}
          </Link>
        </div>
      ) : (
        <div className="text-sm text-teal-500 my-5 flex gap-1">
          Vous devez vous connecter pour commenter
          <Link className="text-blue-500 hover:underline" to="/sign-in">
            Se connecter
          </Link>
        </div>
      )}

      {currentUser && (
        <form onSubmit={handleSubmit} className="border border-teal-500 rounded-md p-3">
          <Textarea
            placeholder="Ajouter un commentaire..."
            rows="3"
            maxLength="200"
            onChange={(e) => setComment(e.target.value)}
            value={comment}
          />
          <div className="flex justify-between items-center mt-5">
            <p className="text-gray-500 text-xs">{200 - comment.length} caractères restants</p>
            <Button outline gradientDuoTone="purpleToBlue" type="submit" disabled={submitting}>
              {submitting ? <Spinner size="sm" /> : "Valider"}
            </Button>
          </div>
          {commentError && <Alert color="failure" className="mt-5">{commentError}</Alert>}
        </form>
      )}

      {loading ? (
        <Spinner className="my-5" />
      ) : comments.length === 0 ? (
        <p className="text-sm my-5">Aucun commentaire pour l’instant</p>
      ) : (
        comments.map((comment) => (
          <Comment
            key={comment._id || comment.id}
            comment={comment}
            onDelete={(id) => {
              setShowModal(true);
              setCommentToDelete(id);
            }}
          />
        ))
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg">Êtes-vous sûr de vouloir supprimer ce commentaire ?</h3>
            <div className="flex justify-center gap-4">
              <Button
                color="failure"
                onClick={async () => {
                  try {
                    await apiRequest(`/api/comment/deleteComment/${commentToDelete}`, {
                      method: 'DELETE',
                      auth: true,
                    });
                    setComments((prev) => prev.filter((c) => (c._id || c.id) !== commentToDelete));
                  } catch (error) {
                    setCommentError(error.message);
                  } finally {
                    setShowModal(false);
                  }
                }}
              >
                Oui
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>Non</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
