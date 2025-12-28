export const AccessDenied = ({ title = 'Accès refusé', message }) => (
  <div className="section">
    <div className="section-header">
      <h2>{title}</h2>
    </div>
    <div className="empty-state">
      {message || 'Accès admin requis pour consulter cette section.'}
    </div>
  </div>
);
