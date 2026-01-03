import { Modal, Table, Button } from 'flowbite-react';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { apiRequest } from '../lib/apiClient';
import { DEFAULT_MEDIA_PLACEHOLDER, resolveMediaUrl } from '../lib/mediaUrls';

// CMS: posts module table
export default function DashPosts({ filters = { category: 'all', subCategory: 'all', status: 'all', query: '' } }) {
  const { currentUser } = useSelector((state) => state.user);
  const [userPosts, setUserPosts] = useState([]);
  const [showMore, setShowMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      if (currentUser?.role !== 'ADMIN') return;
      try {
        const data = await apiRequest(`/api/posts?userId=${currentUser._id}`);
        if (data?.posts) {
          setUserPosts(data.posts);
          setShowMore(data.posts.length >= 9);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, [currentUser]);

  const handleShowMore = async () => {
    try {
      const data = await apiRequest(`/api/posts?userId=${currentUser._id}&startIndex=${userPosts.length}`);
      if (data?.posts) {
        setUserPosts((prev) => [...prev, ...data.posts]);
        setShowMore(data.posts.length >= 9);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    }
  };

  const handleDeletePost = async () => {
    setShowModal(false);
    try {
      const data = await apiRequest(`/api/posts/${postIdToDelete}`, {
        method: 'DELETE',
        auth: true,
      });
      if (data?.success) {
        setUserPosts((prev) => prev.filter((post) => post._id !== postIdToDelete));
      } else {
        console.error('Error deleting post:', data?.message);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const visiblePosts = useMemo(() => {
    return userPosts.filter((post) => {
      const matchCategory =
        filters.category === 'all' || post.category?.toLowerCase() === filters.category.toLowerCase();
      const matchSubCategory =
        filters.subCategory === 'all' || post.subCategory?.toLowerCase() === filters.subCategory.toLowerCase();
      const postStatus = post.status || 'published';
      const matchStatus = filters.status === 'all' || postStatus === filters.status;
      const query = filters.query?.toLowerCase() || '';
      const matchQuery =
        !query ||
        post.title?.toLowerCase().includes(query) ||
        post.username?.toLowerCase().includes(query) ||
        post.author?.toLowerCase().includes(query);
      return matchCategory && matchSubCategory && matchStatus && matchQuery;
    });
  }, [filters.category, filters.query, filters.status, filters.subCategory, userPosts]);

  return (
    <div className='overflow-x-auto p-3'>
      {currentUser.role === 'ADMIN' && visiblePosts.length > 0 ? (
        <>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Image du post</Table.HeadCell>
              <Table.HeadCell>Titre du post</Table.HeadCell>
              <Table.HeadCell>Catégorie</Table.HeadCell>
              <Table.HeadCell>Supprimer</Table.HeadCell>
              <Table.HeadCell>Éditer</Table.HeadCell>
            </Table.Head>
            <Table.Body className='divide-y'>
              {visiblePosts.map((post) => (
                <Table.Row key={post._id} className='bg-white dark:bg-gray-800'>
                  <Table.Cell>{new Date(post.updatedAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Link to={`/post/${post.slug}`}>
                      <img
                        src={resolveMediaUrl(
                          post.imageThumb || post.imageCover || post.imageOriginal || post.image,
                          DEFAULT_MEDIA_PLACEHOLDER
                        )}
                        alt={post.title}
                        className='w-20 h-10 object-cover'
                        loading='lazy'
                        decoding='async'
                        width='160'
                        height='80'
                      />
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Link className='text-gray-900 dark:text-white' to={`/post/${post.slug}`}>
                      {post.title}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>{post.category}</Table.Cell>
                  <Table.Cell>
                    <span onClick={() => { setShowModal(true); setPostIdToDelete(post._id); }} className='text-red-500 cursor-pointer'>Supprimer</span>
                  </Table.Cell>
                  <Table.Cell>
                    <Link className='text-teal-500' to={`/dashboard/posts/${post._id}/edit`}>
                      Éditer
                    </Link>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {showMore && (
            <button onClick={handleShowMore} className='w-full text-teal-500 py-3'>Voir plus</button>
          )}
        </>
      ) : (
        <p>Aucun post disponible.</p>
      )}
      <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500'>Voulez-vous vraiment supprimer ce post ?</h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeletePost}>Oui</Button>
              <Button color='gray' onClick={() => setShowModal(false)}>Non</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
