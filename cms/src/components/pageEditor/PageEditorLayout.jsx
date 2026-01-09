export const PageEditorLayout = ({ main, sidebar }) => (
  <div className="page-editor-layout">
    <div className="page-editor-main">{main}</div>
    <aside className="page-editor-sidebar">{sidebar}</aside>
  </div>
);
