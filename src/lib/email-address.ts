const COMMON_DOMAIN_TYPOS: Record<string, string> = {
  "gamil.com": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.de": "gmail.com",
  "gmil.com": "gmail.com",
  "gmx.con": "gmx.com",
  "gmx.d": "gmx.de",
  "hotnail.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "web.d": "web.de",
};

export function suggestEmailCorrection(email: string) {
  const normalized = email.trim().toLowerCase();
  const separator = normalized.lastIndexOf("@");
  if (separator <= 0) return null;

  const domain = normalized.slice(separator + 1);
  const correctedDomain = COMMON_DOMAIN_TYPOS[domain];
  return correctedDomain ? `${normalized.slice(0, separator + 1)}${correctedDomain}` : null;
}
