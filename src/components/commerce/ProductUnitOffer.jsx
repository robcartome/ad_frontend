'use client';
import { useState } from 'react';
import { formatPublicMoney } from '@/lib/commerce/catalog.mjs';

export default function ProductUnitOffer({ product }) {
  const [unitId, setUnitId] = useState(product.unitId);
  const unit = product.saleUnits.find(item => item.unitId === unitId) || product;
  return <div className="sf-purchase">
    <label htmlFor="sale-unit">Unidad de venta</label>
    <select id="sale-unit" value={unitId} onChange={event => setUnitId(event.target.value)}>
      {product.saleUnits.map(item => <option key={item.unitId} value={item.unitId}>{item.unit}</option>)}
    </select>
    <p className="sf-detail-price">{unit.price === null ? 'Consultar precio' : formatPublicMoney(unit.price, product.currency)}</p>
    <p>{unit.availability === 'available' ? 'Disponible' : unit.availability === 'unavailable' ? 'No disponible' : 'Consultar disponibilidad'}</p>
    <p className="sf-callout">Puedes consultar los productos publicados. Los pedidos y cotizaciones aún no están habilitados.</p>
  </div>;
}
