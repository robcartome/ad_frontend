'use client';
import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CredentialsForm({ onSubmit, busy, submitLabel = 'Entrar' }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  return <form className="space-y-4" onSubmit={event => { event.preventDefault(); onSubmit(email, password); }}>
    <div className="space-y-2"><Label htmlFor={`${id}-email`}>Correo electrónico</Label><Input id={`${id}-email`} type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)}/></div>
    <div className="space-y-2"><Label htmlFor={`${id}-password`}>Contraseña</Label><div className="relative"><Input className="pr-12" id={`${id}-password`} type={visible ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)}/><button className="absolute right-1 top-0 rounded p-2 focus-visible:outline-2" type="button" onClick={() => setVisible(value => !value)} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{visible ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div></div>
    <Button className="w-full" type="submit" disabled={busy}>{busy ? 'Verificando…' : submitLabel}</Button>
  </form>;
}
