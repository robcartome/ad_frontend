import { apiFetch } from "./api";

export function getDocumentTypes() {
  return apiFetch("/document-types/");
}