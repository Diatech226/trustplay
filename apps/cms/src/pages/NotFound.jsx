import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="section">
      <div className="section-header">
        <h2>Page introuvable</h2>
      </div>
      <p className="notice">Cette section n'existe pas dans le CMS v2.</p>
      <Link className="button" to="/">
        Retour à l'overview
      </Link>
    </div>
  );
};
