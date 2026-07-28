const BLOCKED_PROTOCOLS = new Set(["file:", "ftp:", "data:"]);

const PRIVATE_IPV4_RANGES = [
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
  return PRIVATE_IPV4_RANGES.some((range) => {
    for (let i = 0; i < 4; i++) {
      if (parsed[i] < range.start[i]) return false;
      if (parsed[i] > range.end[i]) return false;
      if (parsed[i] !== range.start[i]) break;
    }
    return true;
  });
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80")) return true;
  if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;
  if (normalized.startsWith("::ffff:")) {
    const ipv4Part = normalized.slice(7);
    return isPrivateIpv4(ipv4Part);
  }
  return false;
}

function isHostnameIpv4(hostname: string): boolean {
  const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!ipv4Pattern.test(hostname)) return false;
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
    const [ipv4, ipv6] = await Promise.allSettled([
      resolver.resolve4(hostname),
      resolver.resolve6(hostname),
    ]);
    const addresses: string[] = [];
    if (ipv4.status === "fulfilled") addresses.push(...ipv4.value);
    if (ipv6.status === "fulfilled") addresses.push(...ipv6.value);
    return addresses;
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

  if (isAllowedInternalInfra(url.hostname)) return;

  const addresses = await resolveDns(url.hostname);
  for (const addr of addresses) {
    if (isPrivateIpv4(addr) || isPrivateIpv6(addr)) {
      throw new Error(
        `Blocked resolved IP: ${addr} for hostname ${url.hostname}`,
      );
    }
  }
}
