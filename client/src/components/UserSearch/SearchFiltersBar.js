import * as React from 'react';
import { FACULTIES } from '../../data/facultyPrograms';

const GRAD_YEARS = [];
const y = new Date().getFullYear();
for (let i = y - 2; i <= y + 8; i += 1) GRAD_YEARS.push(i);

const EXCHANGE_TERMS = ['3A', '3B', '4A', '4B'];

const emptyFilters = {
  faculty: '',
  gradYear: '',
  exchangeTerm: '',
};

/**
 * User search filters — same visual pattern as Course Search (.cs-filters / .cs-select).
 */
const SearchFiltersBar = ({ filters, onChange, onClear }) => {
  const hasAny = Boolean(
    filters.faculty || filters.gradYear || filters.exchangeTerm
  );

  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="cs-filters" style={{ marginTop: 0 }}>
      <select
        className="cs-select"
        value={filters.faculty}
        onChange={(e) => set({ faculty: e.target.value })}
        aria-label="Faculty"
      >
        <option value="">All faculties</option>
        {FACULTIES.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select
        className="cs-select"
        value={filters.gradYear}
        onChange={(e) => set({ gradYear: e.target.value })}
        aria-label="Class (graduation year)"
      >
        <option value="">All classes</option>
        {GRAD_YEARS.map((year) => (
          <option key={year} value={String(year)}>
            Class of {year}
          </option>
        ))}
      </select>

      <select
        className="cs-select"
        value={filters.exchangeTerm}
        onChange={(e) => set({ exchangeTerm: e.target.value })}
        aria-label="Exchange term"
      >
        <option value="">All exchange terms</option>
        {EXCHANGE_TERMS.map((term) => (
          <option key={term} value={term}>
            {term}
          </option>
        ))}
      </select>

      {hasAny && (
        <button type="button" className="cs-clear-filters" onClick={onClear}>
          Clear filters
        </button>
      )}
    </div>
  );
};

export default SearchFiltersBar;
export { emptyFilters };
