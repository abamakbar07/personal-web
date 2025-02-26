import content from '../data/content.json';

export function getContent(section: keyof typeof content, key: string) {
  return content[section]?.[key] ?? '';
} 