const HOST_LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;

export function normalizeHost(value) {
  const raw = String(value || "").trim().toLowerCase().replace(/\.$/, "");
  if (!raw || raw.includes("://") || raw.includes("/") || raw.includes("@")) {
    return null;
  }

  let hostname;
  try {
    hostname = new URL(`http://${raw}`).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return null;
  }

  if (
    !hostname ||
    hostname.length > 253 ||
    hostname.includes(":") ||
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
  ) {
    return null;
  }

  return hostname.split(".").every((label) => HOST_LABEL.test(label))
    ? hostname
    : null;
}

export function parseHostList(value, fallback = []) {
  const source = value ? value.split(",") : fallback;
  return new Set(source.map(normalizeHost).filter(Boolean));
}
