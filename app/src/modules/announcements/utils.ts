import type { Announcement } from '../../core/types/database';

const clean = (s: string | null | undefined) => (s && s.trim() ? s : null);

// Display title with the fallback chain: en -> fr -> ar, fr -> ar, ar.
export function localizedTitle(item: Announcement, lang: string): string {
  if (lang.startsWith('en')) {
    return clean(item.title_en) ?? clean(item.title_fr) ?? item.title;
  }
  if (lang.startsWith('fr')) {
    return clean(item.title_fr) ?? item.title;
  }
  return item.title;
}

export function localizedDescription(item: Announcement, lang: string): string | null {
  if (lang.startsWith('en')) {
    return clean(item.description_en) ?? clean(item.description_fr) ?? item.description;
  }
  if (lang.startsWith('fr')) {
    return clean(item.description_fr) ?? item.description;
  }
  return item.description;
}
