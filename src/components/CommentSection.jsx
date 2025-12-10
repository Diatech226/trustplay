import { Alert, Button, Modal, Textarea, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Comment from './Comment';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function CommentSection({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL; 
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/comment/getPostComments/${postId}`);
        if (!res.ok) throw new Error("Échec du chargement des commentaires");
    
        const data = await res.json();
        
        setComments(data); // ✅ Les noms des utilisateurs sont déjà peuplés grâce au backend
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
    if (!currentUser || !currentUser?.id) {
      setCommentError("Vous devez être connecté pour commenter.");
      return;
    }
    
    if (!comment.trim()) {
      setCommentError("Le commentaire ne peut pas être vide.");
      return;
    }
    console.log(localStorage.getItem("accessToken"));

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/comment/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({
          content: comment,
          postId,
          userId: currentUser?.id,  // Vérifie bien que userId est défini
        }),
      });
  
      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || "Erreur lors de l'ajout du commentaire");
  
      setComments((prev) => [
        ...prev,
        {
          ...responseData,
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
          <Link to="/dashboard?tab=profile" className="text-xs text-cyan-600 hover:underline">
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
            key={comment._id}
            comment={comment}
            onDelete={() => {
              setShowModal(true);
              setCommentToDelete(comment.id);
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
              <Button color="failure" onClick={() => {
                setComments(comments.filter(c => c._id !== commentToDelete));
                setShowModal(false);
              }}>
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
