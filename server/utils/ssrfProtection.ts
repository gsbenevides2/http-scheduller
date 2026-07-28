const BLOCKED_PROTOCOLS = new Set(["file:", "ftp:", "data:"]);

const PRIVATE_IP_RANGES = [
  { start: [10, 0, 0, 0], end: [10, 255, 255, 255] },
  { start: [172, 16, 0, 0], end: [172, 31, 255, 255] },
  { start: [192, 168, 0, 0], end: [192, 168, 255, 255] },
  { start: [127, 0, 0, 0], end: [127, 255, 255, 255] },
  { start: [169, 254, 0, 0], end: [169, 254, 255, 255] },
  { start: [0, 0, 0, 0], end: [0, 255, 255, 255] },
];

const ALLOWED_INTERNAL_INFRA_HOSTS = new Set(["tplink.infra.gui.dev.br"]);

function parseIpv4(ip: string): number[] | null {
  const parts = ip.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)
  ) {
    return null;
  }
  return parts;
}

function isPrivateIpv4(ip: string): boolean {
  const parsed = parseIpv4(ip);
  if (!parsed) return true;
  return PRIVATE_IP_RANGES.some((range) => {
    for (let i = 0; i < 4; i++) {
      if (parsed[i] < range.start[i]) return false;
      if (parsed[i] > range.end[i]) return false;
      if (parsed[i] !== range.start[i]) break;
    }
    return true;
  });
}
function isHostnameIpv4(hostname: string): boolean {
  // Validar formato básico
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

  if (!ipv4Pattern.test(hostname)) {
    return false;
  }

  // Validar cada octeto (0-255)
  const octets = hostname.split(".");
  return octets.every((octet) => {
    const num = parseInt(octet, 10);
    return num >= 0 && num <= 255 && octet === num.toString();
  });
}

function isBlockedHostname(hostname: string): boolean {
  if (hostname === "localhost") return true;
  if (isHostnameIpv4(hostname) && isPrivateIpv4(hostname)) return true;
  if (hostname.startsWith("[") || hostname.includes("::")) return true;
  return false;
}

async function resolveDns(hostname: string): Promise<string[]> {
  try {
    const { Resolver } = await import(
      /* webpackIgnore: true */ "dns" + "/promises"
    );
    const resolver = new Resolver();
    return resolver.resolve4(hostname);
  } catch {
    return [hostname];
  }
}

function isAllowedInternalInfra(hostname: string) {
  return ALLOWED_INTERNAL_INFRA_HOSTS.has(hostname);
}

export async function validateUrl(urlString: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error(`Invalid URL: ${urlString}`);
  }

  if (BLOCKED_PROTOCOLS.has(url.protocol)) {
    throw new Error(`Blocked protocol: ${url.protocol}`);
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Unsupported protocol: ${url.protocol}`);
  }

  if (isBlockedHostname(url.hostname)) {
    throw new Error(`Blocked hostname: ${url.hostname}`);
  }

  const addresses = await resolveDns(url.hostname);
  for (const addr of addresses) {
    if (isPrivateIpv4(addr) && !isAllowedInternalInfra(url.hostname)) {
      throw new Error(
        `Blocked resolved IP: ${addr} for hostname ${url.hostname}`,
      );
    }
  }
}
