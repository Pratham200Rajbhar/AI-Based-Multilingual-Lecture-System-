import { useState, useEffect, useRef } from 'react';
import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';

export default function SearchBar({ onSearch, placeholder = 'Search...', debounceMs = 500 }) {
  const [value, setValue] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => clearTimeout(timerRef.current);
  }, [value, debounceMs]);

  const clear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="relative">
      <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9 pr-8"
      />
      {value && (
        <button onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600">
          <HiXMark className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
