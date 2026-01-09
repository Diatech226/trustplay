export const SlugInput = ({ value, onChange, helper }) => (
  <label className="form-field">
    Slug
    <input value={value} onChange={onChange} placeholder="ex: a-propos" />
    {helper ? <span className="helper">{helper}</span> : null}
  </label>
);
