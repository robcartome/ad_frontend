import Link from "next/link";
import { CartLink } from "@/components/storefront/CartControls";

function MenuLink({ item }) {
  const external = item.href.startsWith("https://");
  const props = item.open_in_new_tab ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return external ? <a href={item.href} {...props}>{item.label}</a> : <Link href={item.href} {...props}>{item.label}</Link>;
}

export function SiteHeader({ website }) {
  const items = website.menus?.header || [];
  return (
    <header className="border-b bg-white/95 px-4 py-4 shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-bold">
          {website.theme.logo.url ? (
            // Tenant media is already optimized by the backend.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={website.theme.logo.url} alt={website.theme.logo.alt} className="h-10 max-w-44 object-contain" />
          ) : website.name}
        </Link>
        <div className="flex items-center gap-4">
          <nav aria-label="Navegación principal">
            <ul className="flex flex-wrap items-center justify-end gap-4 text-sm font-medium">
              {items.map((item) => (
                <li key={item.id} className="group relative">
                  <MenuLink item={item} />
                  {item.children?.length ? (
                    <ul className="invisible absolute right-0 z-20 mt-2 min-w-48 rounded-lg border bg-white p-2 opacity-0 shadow-lg group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                      {item.children.map((child) => <li className="rounded px-3 py-2 hover:bg-slate-50" key={child.id}><MenuLink item={child} /></li>)}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
          <CartLink />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ website }) {
  const items = website.menus?.footer || [];
  return (
    <footer className="mt-auto border-t bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 md:flex-row">
        <div><p className="font-semibold">{website.name}</p>{website.footer_text ? <p className="mt-2 max-w-xl text-sm text-slate-300">{website.footer_text}</p> : null}</div>
        <nav aria-label="Navegación del pie"><ul className="flex flex-wrap gap-5 text-sm">{items.map((item) => <li key={item.id}><MenuLink item={item} /></li>)}</ul></nav>
      </div>
    </footer>
  );
}
