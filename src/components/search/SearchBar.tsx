// 검색컴포넌트

import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  initialValue?: string;
  onSearch: (term: string) => void;
  className?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
}

function SearchBar({
  placeholder,
  initialValue = '',
  onSearch,
  className = '',
  inputClassName = '',
  icon,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand"
      >
        {icon || <img src="/search.png" alt="검색" className="w-[20px] h-[20px]" />}
      </button>
    </form>
  );
}

export default SearchBar;
