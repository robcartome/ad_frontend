'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, UserRound, ShoppingBag, Menu, X } from 'lucide-react';
import DashboardFrame from '@/components/layout/DashboardFrame';
import CredentialsForm from '@/components/auth/CredentialsForm';
import LoadingIndicator from '@/components/feedback/LoadingIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/AuthContext';
import { getAccessToken } from '@/services/authService';
import { useCommercialAccount } from './CommercialProvider';

const navigation = [{ href: '/cuenta', name: 'Inicio', icon: Home }, { href: '/cuenta/perfil', name: 'Mi perfil', icon: UserRound }, { href: '/cuenta/carrito', name: 'Revisar selección', icon: ShoppingBag }, { href: '/cuenta/solicitudes', name: 'Mis solicitudes', icon: ShoppingBag }, { href: '/shop', name: 'Catálogo público', icon: ShoppingBag }];

export default function CommercialShell({ children }) {
  const account = useCommercialAccount();
  const labor = useAuth();
  const pathname = usePathname();
  if (account.busy && !account.profile) return <div className="flex min-h-screen items-center justify-center"><LoadingIndicator label="Verificando tu cuenta…"/></div>;
  if (!account.profile) return <div className="mx-auto max-w-md px-5 py-12"><Card><CardHeader><CardTitle>Mi cuenta</CardTitle><p className="text-sm text-gray-600">Accede a tu cuenta de cliente en {account.companyName}.</p></CardHeader><CardContent className="space-y-5">
    {account.error && <p role="alert" className="text-sm text-red-700">{account.error}</p>}
    <CredentialsForm onSubmit={account.login} busy={account.busy}/>
    {labor.isAuthenticated && <Button variant="outline" className="w-full whitespace-normal" disabled={account.busy} onClick={() => account.enterFromIdentity(getAccessToken())}>Usar mi sesión APUDIG para esta cuenta</Button>}
    <p className="text-sm text-gray-600">{account.registrationEnabled ? '¿No tienes una cuenta? Regístrate para verificar tu correo.' : 'El registro de nuevas cuentas aún no está disponible.'}</p>
    <div className="flex flex-wrap gap-4 text-sm"><Link className="underline" href="/registro">{account.registrationEnabled ? 'Registrarme' : 'Información de registro'}</Link><Link className="underline" href="/recuperar-cuenta">Recuperar mi cuenta</Link></div>
    <Link className="inline-block text-sm text-orange-800 underline" href="/">Volver a la página web</Link>
  </CardContent></Card></div>;
  const profile = account.profile;
  return <>
    <a className="sr-only focus:not-sr-only focus:block focus:p-3" href="#dashboard-main">Saltar al contenido</a>
    <DashboardFrame
      sidebar={({ mobileOpen, setMobileOpen, desktopOpen }) => <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r bg-white transition-transform lg:static lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} ${desktopOpen ? 'lg:w-64' : 'lg:w-20'}`}>
        <div className="flex h-14 items-center justify-between border-b px-4"><Link href="/cuenta" aria-label="Mi cuenta APUDIG" className="font-semibold">{desktopOpen ? 'APUDIG' : 'AD'}</Link><button className="rounded p-2 lg:hidden" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)}><X size={20}/></button></div>
        <nav aria-label="Mi cuenta comercial" className="space-y-2 p-3">{navigation.map(({ href, name, icon: Icon }) => <Link key={href} href={href} title={name} onClick={() => setMobileOpen(false)} aria-current={pathname === href ? 'page' : undefined} className={`flex items-center gap-3 rounded-lg p-3 text-sm focus-visible:outline-2 focus-visible:outline-orange-700 ${pathname === href ? 'bg-orange-100 text-orange-950' : 'text-gray-700 hover:bg-gray-100'}`}><Icon size={20} className="shrink-0"/><span className={desktopOpen ? '' : 'lg:sr-only'}>{name}</span></Link>)}</nav>
        <div className="mt-auto space-y-3 border-t p-4 text-sm"><Link className="block underline" href="/">Ver página web</Link>{labor.isAuthenticated && labor.selectedCompany && <Link className="block underline" href="/admin">Cambiar a mi sesión de personal</Link>}</div>
      </aside>}
      topbar={({ onMenuClick, onDesktopToggle }) => <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-2"><button className="rounded p-2 lg:hidden" aria-label="Abrir menú" onClick={onMenuClick}><Menu size={20}/></button><button className="hidden rounded p-2 lg:block" aria-label="Alternar menú lateral" onClick={onDesktopToggle}><Menu size={20}/></button><p className="min-w-0 flex-1 break-words text-sm font-medium">{profile.company.name}</p><Button variant="outline" disabled={account.busy} onClick={account.logout}>Cerrar sesión de cliente</Button></header>}
    >
      {!account.persistent && <p role="status" className="mx-5 my-3 text-sm">La sesión solo se conservará durante esta visita.</p>}
      {account.error && <p role="alert" className="mx-5 my-3 text-sm text-red-700">{account.error}</p>}
      <div className="mx-auto max-w-5xl px-5 py-7">{children}</div>
    </DashboardFrame>
  </>;
}
