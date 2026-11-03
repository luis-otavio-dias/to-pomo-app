import React from 'react';

export default function DateInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return React.createElement('input', {
    'aria-label': 'Prazo',
    type: 'date',
    value,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
    style: { width: '100%', minHeight: 44, padding: 8, border: '1px solid #bdb5aa', borderRadius: 6, background: '#FAF6EE', color: '#272523' },
  });
}
