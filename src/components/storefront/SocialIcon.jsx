import { Facebook, Instagram, Youtube } from 'lucide-react';

export default function SocialIcon({ network, size = 20 }) {
  const Icon = { facebook: Facebook, instagram: Instagram, youtube: Youtube }[network];
  if (Icon) return <Icon size={size} strokeWidth={1.8} aria-hidden="true"/>;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {network === 'x'
      ? <path d="M18.9 3H22l-6.8 7.8L23 21h-6.1l-4.8-6.3L6.6 21H3.5l7.2-8.3L3 3h6.3l4.4 5.8L18.9 3Zm-1.1 16h1.7L8.3 5H6.5l11.3 14Z"/>
      : <path d="M15 3h3c.3 2.1 1.6 3.4 4 3.8V10a9 9 0 0 1-4-1.3v7.5a6.2 6.2 0 1 1-5-6.1v3.3a3 3 0 1 0 2 2.8V3Z"/>}
  </svg>;
}
