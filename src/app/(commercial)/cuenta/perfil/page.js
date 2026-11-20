'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommercialAccount } from '@/components/account/CommercialProvider';

export default function AccountProfile() {
  const { profile } = useCommercialAccount();
  return <Card><CardHeader><CardTitle>Mi perfil</CardTitle></CardHeader><CardContent>
    <dl className="grid gap-5 break-words sm:grid-cols-2">{[['Nombre', profile.user.name], ['Correo electrónico', profile.user.email], ['Teléfono', profile.user.phone || 'No registrado'], ['Empresa', profile.company.name], ['Verificación', 'Correo verificado'], ['Acceso mayorista', profile.wholesaleApproved ? 'Aprobado' : 'Sin aprobación mayorista']].map(([title, value]) => <div key={title}><dt className="text-sm text-gray-500">{title}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl>
    <p className="mt-7 text-sm text-gray-600">Los cambios de contacto requerirán una nueva verificación. La actualización de datos aún no está disponible desde esta sección.</p>
  </CardContent></Card>;
}
