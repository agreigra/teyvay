// Country dialing data for the phone field. `iso` drives the flag emoji
// (built from regional-indicator symbols), `dial` is the E.164 calling code.
export type Country = {
  iso: string;
  name: string;
  dial: string;
};

// Turn an ISO-3166 alpha-2 code into its flag emoji (🇲🇷 etc.).
export const flagEmoji = (iso: string): string =>
  iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

// Mauritania first (app default), then a broad regional + common set.
export const COUNTRIES: Country[] = [
  { iso: 'MR', name: 'Mauritania', dial: '+222' },
  { iso: 'MA', name: 'Morocco', dial: '+212' },
  { iso: 'DZ', name: 'Algeria', dial: '+213' },
  { iso: 'TN', name: 'Tunisia', dial: '+216' },
  { iso: 'LY', name: 'Libya', dial: '+218' },
  { iso: 'EG', name: 'Egypt', dial: '+20' },
  { iso: 'SN', name: 'Senegal', dial: '+221' },
  { iso: 'ML', name: 'Mali', dial: '+223' },
  { iso: 'GN', name: 'Guinea', dial: '+224' },
  { iso: 'CI', name: "Côte d'Ivoire", dial: '+225' },
  { iso: 'BF', name: 'Burkina Faso', dial: '+226' },
  { iso: 'NE', name: 'Niger', dial: '+227' },
  { iso: 'NG', name: 'Nigeria', dial: '+234' },
  { iso: 'GM', name: 'Gambia', dial: '+220' },
  { iso: 'GW', name: 'Guinea-Bissau', dial: '+245' },
  { iso: 'GH', name: 'Ghana', dial: '+233' },
  { iso: 'TG', name: 'Togo', dial: '+228' },
  { iso: 'BJ', name: 'Benin', dial: '+229' },
  { iso: 'CM', name: 'Cameroon', dial: '+237' },
  { iso: 'TD', name: 'Chad', dial: '+235' },
  { iso: 'SD', name: 'Sudan', dial: '+249' },
  { iso: 'CV', name: 'Cape Verde', dial: '+238' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { iso: 'QA', name: 'Qatar', dial: '+974' },
  { iso: 'KW', name: 'Kuwait', dial: '+965' },
  { iso: 'BH', name: 'Bahrain', dial: '+973' },
  { iso: 'OM', name: 'Oman', dial: '+968' },
  { iso: 'JO', name: 'Jordan', dial: '+962' },
  { iso: 'LB', name: 'Lebanon', dial: '+961' },
  { iso: 'IQ', name: 'Iraq', dial: '+964' },
  { iso: 'SY', name: 'Syria', dial: '+963' },
  { iso: 'YE', name: 'Yemen', dial: '+967' },
  { iso: 'TR', name: 'Turkey', dial: '+90' },
  { iso: 'FR', name: 'France', dial: '+33' },
  { iso: 'ES', name: 'Spain', dial: '+34' },
  { iso: 'PT', name: 'Portugal', dial: '+351' },
  { iso: 'IT', name: 'Italy', dial: '+39' },
  { iso: 'DE', name: 'Germany', dial: '+49' },
  { iso: 'BE', name: 'Belgium', dial: '+32' },
  { iso: 'NL', name: 'Netherlands', dial: '+31' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44' },
  { iso: 'US', name: 'United States', dial: '+1' },
  { iso: 'CA', name: 'Canada', dial: '+1' },
  { iso: 'CN', name: 'China', dial: '+86' },
];

export const DEFAULT_COUNTRY: Country = COUNTRIES[0];

// Pick the country whose dialing code is the longest prefix of an E.164 value.
// Falls back to the default (Mauritania) when nothing matches.
export const countryFromE164 = (value: string): Country => {
  let best: Country | null = null;
  for (const c of COUNTRIES) {
    if (value.startsWith(c.dial) && (!best || c.dial.length > best.dial.length)) {
      best = c;
    }
  }
  return best ?? DEFAULT_COUNTRY;
};
