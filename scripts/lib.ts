// scripts 共通：frontmatter の読み込み
import { readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const DATA = join(ROOT, 'src', 'data');

export type Collection = 'tools' | 'capabilities' | 'categories';

export interface Entry {
  collection: Collection;
  id: string;
  file: string;
  data: Record<string, any>;
  body: string;
  raw: string;
  parseError?: string;
}

export function splitFrontmatter(raw: string): { fm: string; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error('frontmatter (--- ... ---) が見つからない');
  return { fm: m[1], body: m[2] ?? '' };
}

export function readEntry(collection: Collection, file: string): Entry {
  const raw = readFileSync(file, 'utf8');
  const { fm, body } = splitFrontmatter(raw);
  const data = parse(fm) ?? {};
  return { collection, id: basename(file, '.md'), file, data, body, raw };
}

export function readCollection(collection: Collection): Entry[] {
  const dir = join(DATA, collection);
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  return files.map((f) => {
    const file = join(dir, f);
    try {
      return readEntry(collection, file);
    } catch (e) {
      // YAML の構文エラーは検証側で報告できるよう、空データのエントリとして返す
      return { collection, id: basename(f, '.md'), file, data: {}, body: '', raw: '', parseError: String((e as Error).message) } as Entry;
    }
  });
}

export function rel(file: string): string {
  return file.replace(ROOT, '').replace(/^[\\/]/, '').replaceAll('\\', '/');
}

export function daysSince(d: Date, now = new Date()): number {
  return Math.floor((now.getTime() - d.getTime()) / 86_400_000);
}
