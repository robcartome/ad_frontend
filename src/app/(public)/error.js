'use client';
export default function Error({ reset }) { return <div className="sf-container sf-page sf-empty">
    <h1>No pudimos cargar esta página</h1>
    <p>Intenta nuevamente en unos momentos.</p>
    <button className="sf-button sf-button-orange" onClick={reset}>Volver a intentar</button>
  </div>; }
