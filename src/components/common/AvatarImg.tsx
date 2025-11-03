// src/components/common/AvatarImg.tsx
import { DEFAULT_AVATAR } from '../../lib/contentUtils';

export default function AvatarImg({
  src,
  alt,
  className = 'w-8 h-8 rounded-full object-cover border border-gray-200',
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src || DEFAULT_AVATAR}
      alt={alt}
      className={className}
      onError={e => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = DEFAULT_AVATAR;
      }}
    />
  );
}
