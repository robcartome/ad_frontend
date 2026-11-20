'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/apiConfig';
import { createCommercialRegistration, consumeProofFragment } from '@/services/commercialRegistration.mjs';
import CredentialsForm from '@/components/auth/CredentialsForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import LoadingIndicator from '@/components/feedback/LoadingIndicator';

export default function RegistrationFlow({ hostname, websiteId, companyName, recovery = false, verify = false }) {
  const client = useMemo(() => createCommercialRegistration({ baseUrl: API_URL, hostname, websiteId }), [hostname, websiteId]);
  const [policy, setPolicy] = useState(null);
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [identityNeeded, setIdentityNeeded] = useState(false);
  useEffect(() => {
    let active = true;
    const proof = consumeProofFragment(window.location, window.history);
    // Development Strict Mode repeats effects after the URL fragment is gone.
    if (proof) setToken(proof);
    client.policy().then(value => { if (active) setPolicy(value); }).catch(failure => { if (active) setError(failure.message); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [client]);
  const purpose = recovery ? 'RECOVERY' : 'REGISTER';
  async function execute(operation) {
    setBusy(true); setError('');
    try {
      const result = await operation();
      setMessage(result?.message || (result?.status === 'REVIEW' ? 'Tu correo está verificado. La empresa revisará el vínculo con tu ficha de cliente.' : 'Operación completada. Ya puedes iniciar sesión en tu cuenta.'));
      setPassword(''); setToken('');
    } catch (failure) {
      if (failure.code === 'IDENTITY_LOGIN_REQUIRED') setIdentityNeeded(true);
      const fields = Object.values(failure.fields || {}).flat().filter(value => typeof value === 'string');
      setError([failure.message, ...fields].join(' '));
    } finally { setBusy(false); }
  }
  const title = recovery ? 'Recuperar mi cuenta' : verify ? 'Verificar mi cuenta' : 'Registro de cliente';
  return <main className="mx-auto max-w-lg px-5 py-10"><Card><CardHeader><CardTitle>{title}</CardTitle><p className="text-sm text-gray-600">{companyName}</p></CardHeader><CardContent className="space-y-5">
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    {busy && <LoadingIndicator label="Consultando el servicio…"/>}
    {message ? <p role="status">{message}</p> : policy?.registrationEnabled !== true ? <p>El registro y la recuperación desde esta página aún no están disponibles. Contacta con la empresa si necesitas asistencia.</p> : identityNeeded ? <><p>Tu correo pertenece a una identidad APUDIG existente. Inicia sesión para vincularla sin cambiar sus credenciales.</p><CredentialsForm busy={busy} onSubmit={(identityEmail, identityPassword) => execute(async () => { const identity = await client.existingIdentity(identityEmail, identityPassword); return client.complete({ token, purpose }, identity); })}/><Button type="button" variant="outline" disabled={busy} onClick={() => setIdentityNeeded(false)}>Crear una identidad nueva</Button></> : token ? <form className="space-y-4" onSubmit={event => { event.preventDefault(); execute(() => client.complete({ token, password, purpose })); }}>{!recovery && <Button type="button" variant="outline" disabled={busy} onClick={() => setIdentityNeeded(true)}>Usar mi cuenta APUDIG</Button>}<Label htmlFor="registration-password">{recovery ? 'Nueva contraseña' : 'Contraseña para una identidad nueva'}</Label><Input id="registration-password" type="password" required minLength={8} maxLength={200} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)}/><Button disabled={busy}>Confirmar</Button></form> : verify ? <p>Abre el enlace de verificación que recibiste por correo. Los enlaces caducados requieren una nueva solicitud.</p> : <form className="space-y-4" onSubmit={event => { event.preventDefault(); execute(() => client.start({ email, name, noticeVersion: policy.notice.version, consent, purpose })); }}>
      {!recovery && <div className="space-y-2"><Label htmlFor="registration-name">Nombre de contacto</Label><Input id="registration-name" required maxLength={150} autoComplete="name" value={name} onChange={event => setName(event.target.value)}/></div>}
      <div className="space-y-2"><Label htmlFor="registration-email">Correo electrónico</Label><Input id="registration-email" required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)}/></div>
      <details><summary className="cursor-pointer font-medium">Aviso de privacidad · {policy.notice.version}</summary><p className="mt-3 whitespace-pre-wrap text-sm">{policy.notice.text}</p></details>
      <Label className="flex items-start gap-3"><input className="mt-1" type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)}/><span>He leído y acepto el aviso para tramitar esta solicitud. No incluye suscripción publicitaria.</span></Label>
      <Button disabled={busy || !consent}>Solicitar instrucciones</Button>
    </form>}
    <div className="flex flex-wrap gap-5 text-sm"><Link href="/cuenta" className="text-orange-800 underline">Ir a mi cuenta</Link><Link href="/" className="underline">Volver a la página web</Link></div>
  </CardContent></Card></main>;
}
