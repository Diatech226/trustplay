export const PageMetaSidebar = ({ sections }) => (
  <div className="page-sidebar-stack">
    {sections.map((section) => (
      <div key={section.title} className="page-sidebar-card">
        <div className="page-sidebar-card__header">
          <h3>{section.title}</h3>
          {section.action}
        </div>
        <div className="page-sidebar-card__body">{section.content}</div>
      </div>
    ))}
  </div>
);
