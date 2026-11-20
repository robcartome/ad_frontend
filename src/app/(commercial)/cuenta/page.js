'use client';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommercialAccount } from '@/components/account/CommercialProvider';

export default function AccountHome() {
  const { profile } = useCommercialAccount();
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold">Hola, {profile.user.name}</h1><p className="mt-2 text-gray-600">Tu cuenta de cliente en {profile.company.name}.</p></div>
    <div className="grid gap-5 md:grid-cols-2"><Card><CardHeader><CardTitle>Tu cuenta</CardTitle></CardHeader><CardContent className="space-y-3"><p>Correo verificado</p><p>Acceso mayorista: {profile.wholesaleApproved ? 'Aprobado' : 'Sin aprobación mayorista'}</p><Link className="inline-block text-orange-800 underline" href="/cuenta/perfil">Consultar mi perfil</Link></CardContent></Card>
      <Card><CardHeader><CardTitle>Catálogo de la empresa</CardTitle></CardHeader><CardContent><p className="mb-4 text-gray-600">{profile.capabilities.prepareOrders ? 'Revisa tu selección y prepara una solicitud con la oferta actual.' : 'Consulta productos y prepara tu selección. El envío todavía no está autorizado por la empresa.'}</p><Link href="/cuenta/carrito" className="inline-block rounded-md bg-orange-700 px-4 py-2 text-white">Mi carrito</Link></CardContent></Card></div>
    <Card><CardHeader><CardTitle>Mis solicitudes</CardTitle></CardHeader><CardContent><p className="text-gray-600">Consulta las referencias y estados de tus solicitudes. Preparar un resumen no confirma su recepción.</p><Link className="mt-3 inline-block text-orange-800 underline" href="/cuenta/solicitudes">Ver historial</Link></CardContent></Card>
  </div>;
}
