import React from 'react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="mb-4">
      <input
        className="w-full p-3 rounded border"
        placeholder="Search by title, company or location..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
