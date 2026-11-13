'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import CategoryIcon from './CategoryIcon';

function ActiveLink({ category }) {
  const params = useSearchParams();
  const pathname = usePathname();
  return <CategoryLink category={category} selected={pathname === '/shop' && params.get('category') === category.id}/>;
}
function CategoryLink({ category, selected = false }) {
  return <Link className="sf-nav-category" href={`/shop?${new URLSearchParams({ category: category.id })}`} aria-current={selected ? 'page' : undefined}><CategoryIcon type={category.icon} size={19}/><span>{category.name}</span></Link>;
}
export default function CategoryNavLink({ category }) {
  return <Suspense fallback={<CategoryLink category={category}/>}><ActiveLink category={category}/></Suspense>;
}
