const messages = {
  401: 'Tu sesión caducó. Inicia sesión nuevamente; tus cambios permanecen en pantalla.',
  403: 'No tienes permiso para esta operación. Revisa la empresa y tus permisos.',
  404: 'El Website no existe o no pertenece a la empresa autorizada.',
  412: 'Otra persona modificó esta web. Tus cambios permanecen en pantalla; puedes decidir si recargas la versión guardada.',
  428: 'Falta la revisión del contenido. Recarga la versión guardada antes de continuar.',
  413: 'El archivo o documento supera el tamaño permitido.',
  429: 'Se alcanzó el límite de solicitudes. Espera antes de intentar nuevamente.',
  503: 'El servicio no está disponible temporalmente. Tus cambios permanecen en pantalla.',
};
export function websiteErrorMessage(error) {
  return messages[error?.status] || error?.message || 'No se pudo completar la operación.';
}
