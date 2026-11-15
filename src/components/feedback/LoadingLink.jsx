'use client';
import Link, { useLinkStatus } from 'next/link';
import LoadingIndicator from './LoadingIndicator';

function NavigationStatus() {
  const { pending } = useLinkStatus();
  return pending ? <LoadingIndicator fullScreen label="Cargando página…"/> : null;
}
export default function LoadingLink({ children, ...props }) {
  return <Link {...props}>{children}<NavigationStatus/></Link>;
}
