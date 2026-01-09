const STATUS_OPTIONS = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'published', label: 'Publié' },
  { value: 'scheduled', label: 'Planifié' },
];

export const StatusSelect = ({ value, onChange }) => (
  <label className="form-field">
    Statut
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);
