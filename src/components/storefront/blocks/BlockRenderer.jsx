function Hero({ config, theme }) {
  return <section className="relative overflow-hidden px-6 py-24 text-center text-white" style={{ backgroundColor: theme?.primary_color || "#0B1F3A", backgroundImage: config.image_url ? `linear-gradient(rgba(0,0,0,${(config.overlay ?? 35) / 100}), rgba(0,0,0,${(config.overlay ?? 35) / 100})), url(${config.image_url})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }}><div className="relative mx-auto max-w-4xl"><h1 className="text-4xl font-bold md:text-6xl">{config.title}</h1>{config.subtitle ? <p className="mx-auto mt-5 max-w-2xl text-lg">{config.subtitle}</p> : null}{config.cta_label && config.cta_url ? <a className="mt-8 inline-block rounded-md px-6 py-3 font-semibold" style={{ backgroundColor: theme?.accent_color || "#F97316" }} href={config.cta_url}>{config.cta_label}</a> : null}</div></section>;
}

function ImageText({ config }) {
  const image = config.image_url ? <img className="h-72 w-full rounded-xl object-cover" src={config.image_url} alt="" /> : <div className="h-72 rounded-xl bg-slate-100" />;
  const content = <div><h2 className="text-3xl font-bold">{config.title}</h2><p className="mt-4 whitespace-pre-line text-slate-600">{config.body}</p></div>;
  return <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2">{config.alignment === "right" ? <>{content}{image}</> : <>{image}{content}</>}</section>;
}

function Benefits({ config }) {
  return <section className="bg-slate-50 px-6 py-16"><div className="mx-auto max-w-6xl"><h2 className="text-center text-3xl font-bold">{config.title}</h2><div className="mt-10 grid gap-5 md:grid-cols-3">{config.items.map((item, index) => <article key={`${item.title}-${index}`} className="rounded-xl bg-white p-6 shadow-sm"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm text-slate-600">{item.text}</p></article>)}</div></div></section>;
}

function Contact({ config, contact = {} }) {
  return <section className="mx-auto max-w-4xl px-6 py-16 text-center"><h2 className="text-3xl font-bold">{config.title}</h2><div className="mt-6 space-y-2 text-slate-600">{config.show_whatsapp && contact.whatsapp ? <p>WhatsApp: {contact.whatsapp}</p> : null}{config.show_phone && contact.phone ? <p>Teléfono: {contact.phone}</p> : null}{config.show_address && contact.address ? <p>{contact.address}</p> : null}</div></section>;
}

const renderers = { "hero.v1": Hero, "image_text.v1": ImageText, "benefits.v1": Benefits, "contact.v1": Contact };
export default function BlockRenderer({ section, website }) { if (!section?.enabled) return null; const Component = renderers[section.section_type]; return Component ? <Component config={section.config} theme={website?.theme} contact={website?.contact} /> : null; }
