import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PostCard from '../PostCard';

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

const mockPost = {
  _id: '1',
  title: 'Titre test',
  slug: 'titre-test',
  image: 'https://via.placeholder.com/640x384',
  subCategory: 'news',
  content: '<p>Contenu de test</p>',
};

describe('PostCard', () => {
  it('affiche le titre et les métadonnées', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    expect(screen.getByText('Titre test')).toBeInTheDocument();
    expect(screen.getByText(/Lire l'article/i)).toBeInTheDocument();
  });

  it('applique le lazy loading sur l’image', () => {
    renderWithRouter(<PostCard post={mockPost} />);
    const image = screen.getByAltText('Titre test');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('decoding', 'async');
  });
});
