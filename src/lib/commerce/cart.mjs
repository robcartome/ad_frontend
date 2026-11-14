export const CART_VERSION = 1;
export const MAX_QUANTITY = 999;
export const MAX_ITEM_NOTES = 240;
const cleanNotes = notes => typeof notes === 'string' && notes.trim() ? notes.slice(0, MAX_ITEM_NOTES) : '';
export const cartKey = storeId => `apudig:quotation:${storeId}:v${CART_VERSION}`;
export const validQuantity = value => Number.isInteger(value) && value >= 1 && value <= MAX_QUANTITY;
export const hasPrice = product => typeof product.price === 'number' && Number.isFinite(product.price) && product.price >= 0;
export const money = value => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
export function validateItems(items, products) {
    if (!Array.isArray(items))
        return [];
    const knownIds = new Set(products.map(product => product.id));
    const seen = new Set();
    return items.slice(0, 200).filter(item => {
        if (!item || !knownIds.has(item.id) || seen.has(item.id) || !validQuantity(item.quantity))
            return false;
        seen.add(item.id);
        return true;
    }).map(({ id, quantity, notes }) => ({ id, quantity, ...(cleanNotes(notes) ? { notes: cleanNotes(notes) } : {}) }));
}
export function restoreCart(raw, storeId, products) {
    try {
        const data = JSON.parse(raw);
        if (data?.version !== CART_VERSION || data.storeId !== storeId)
            return [];
        return validateItems(data.items, products);
    }
    catch {
        return [];
    }
}
export function serializeCart(items, storeId) {
    return JSON.stringify({ version: CART_VERSION, storeId, items: items.map(({ id, quantity, notes }) => ({ id, quantity, ...(cleanNotes(notes) ? { notes: cleanNotes(notes).trim() } : {}) })) });
}
export function resolveCart(items, products) {
    return validateItems(items, products).map(item => ({ ...products.find(product => product.id === item.id), quantity: item.quantity, ...(item.notes ? { notes: item.notes } : {}) }));
}
export function cartTotals(lines) {
    let subtotal = 0, savings = 0;
    for (const line of lines) {
        if (!hasPrice(line)) continue;
        const price = Math.round(line.price * 100);
        subtotal += price * line.quantity;
        if (Number.isFinite(line.originalPrice) && line.originalPrice > line.price)
            savings += (Math.round(line.originalPrice * 100) - price) * line.quantity;
    }
    return { subtotal: subtotal / 100, savings: savings / 100, beforeDiscount: (subtotal + savings) / 100, unpriced: lines.some(line => !hasPrice(line)) };
}
export function buildQuotationMessage(store, items, products) {
    const lines = resolveCart(items, products);
    if (!lines.length)
        return '';
    return [
        `Hola, ${store.name}. Quisiera solicitar una cotización:`, '',
        ...lines.map(product => `• ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}: ${product.quantity} ${product.unit}${hasPrice(product) ? ` · precio unitario referencial ${money(product.price)}` : ' · precio por confirmar'}${product.notes ? `\n  Detalles solicitados: ${product.notes}` : ''}`),
        '', 'Por favor, confirmar precios y disponibilidad. Esta solicitud no constituye un pedido ni una reserva de stock.',
    ].join('\n');
}
export function quotationUrl(store, items, products) {
    if (store.mode === 'demo' || !/^\d{8,15}$/.test(store.whatsapp ?? ''))
        return null;
    const message = buildQuotationMessage(store, items, products);
    return message ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}` : null;
}
