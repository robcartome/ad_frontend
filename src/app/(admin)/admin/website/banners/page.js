import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function WebsiteBannersPage() { return <div className="mx-auto max-w-2xl space-y-5"><h1 className="text-2xl font-bold">Banners</h1><p className="text-slate-600">Los banners se administran como bloques de portada <code>hero.v1</code> dentro de cada página. Así conservan borrador, vista previa y publicación atómica.</p><Button asChild><Link href="/admin/website/pages">Ir a páginas</Link></Button></div>; }
