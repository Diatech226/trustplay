export const SeoFields = ({ values, onChange }) => (
  <div className="form-grid">
    <label className="form-field">
      SEO Title
      <input
        name="seoTitle"
        value={values.seoTitle}
        onChange={onChange}
        placeholder="Titre SEO"
      />
    </label>
    <label className="form-field">
      SEO Description
      <textarea
        name="seoDescription"
        value={values.seoDescription}
        onChange={onChange}
        placeholder="Résumé SEO (150-160 caractères)"
      />
    </label>
    <label className="form-field">
      OG Image URL
      <input
        name="ogImage"
        value={values.ogImage}
        onChange={onChange}
        placeholder="https://..."
      />
    </label>
  </div>
);
