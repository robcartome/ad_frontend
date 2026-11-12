"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { getEcommerceSectionDefinition } from "@/templates/ecommerce/contentSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function BenefitListField({ field, value, onChange }) {
  const text = (Array.isArray(value) ? value : []).map((item) => `${item.title} | ${item.text}`).join("\n");
  return <Textarea value={text} onChange={(event) => onChange(event.target.value.split("\n").filter(Boolean).slice(0, field.maxItems).map((line) => { const [title, ...description] = line.split("|"); return { title: title.trim(), text: description.join("|").trim(), icon: "support" }; }))} placeholder="Un beneficio por línea: Título | Descripción" />;
}

function SectionField({ field, value, onChange }) {
  if (field.type === "checkbox") return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} /> {field.label}</label>;
  if (field.type === "textarea") return <label className="block space-y-1 text-sm"><span>{field.label}</span><Textarea value={value ?? ""} required={field.required} maxLength={field.maxLength} onChange={(event) => onChange(event.target.value)} /></label>;
  if (field.type === "select") return <label className="block space-y-1 text-sm"><span>{field.label}</span><select className="h-9 w-full rounded-md border px-3 text-sm" value={value ?? field.options[0]?.value ?? ""} onChange={(event) => onChange(event.target.value)}>{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
  if (field.type === "benefit-list") return <label className="block space-y-1 text-sm"><span>{field.label}</span><BenefitListField field={field} value={value} onChange={onChange} /></label>;
  return <label className="block space-y-1 text-sm"><span>{field.label}</span><Input type={field.type === "number" ? "number" : "text"} value={value ?? ""} required={field.required} min={field.min} max={field.max} maxLength={field.maxLength} onChange={(event) => onChange(field.type === "number" ? Number(event.target.value) : event.target.value)} /></label>;
}

export default function SectionEditor({ section, index, count, onChange, onMove, onRemove }) {
  const definition = getEcommerceSectionDefinition(section.section_type);
  const setConfig = (field, value) => onChange({ ...section, config: { ...section.config, [field]: value } });
  if (!definition) return <article className="rounded-xl border border-amber-300 bg-amber-50 p-4"><p className="font-semibold">Bloque no compatible</p><p className="text-sm text-amber-800">El tipo {section.section_type} no pertenece al contrato ecommerce actual.</p></article>;
  return <article className="rounded-xl border bg-white p-4 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><div><p className="font-semibold">{definition.label}</p><p className="text-xs text-slate-500">{definition.slot} · Posición {index + 1}</p></div><div className="flex gap-1"><Button size="icon-sm" variant="ghost" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Subir"><ArrowUp /></Button><Button size="icon-sm" variant="ghost" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Bajar"><ArrowDown /></Button><Button size="icon-sm" variant="ghost" onClick={onRemove} aria-label="Eliminar"><Trash2 /></Button></div></div><label className="mb-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={section.enabled} onChange={(event) => onChange({ ...section, enabled: event.target.checked })} /> Mostrar este bloque</label><div className="space-y-3">{definition.fields.map((field) => <SectionField key={field.name} field={field} value={section.config[field.name]} onChange={(value) => setConfig(field.name, value)} />)}</div></article>;
}
