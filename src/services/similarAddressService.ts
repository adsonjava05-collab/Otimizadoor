import { removeAccents, normalizeAddress } from './normalizeService';

export interface SimilarityGroupMember {
  rowIndex: number;
  originalAddress: string;
  number: string;
  cep: string;
  complement: string;
  spxTn: string;
  sequence: string;
}

export interface SimilarityGroup {
  id: string;
  members: SimilarityGroupMember[];
}

export interface SimilarityDecision {
  groupRowIndex: number;
  selectedRowIndices: number[];
  principalAddress: string;
}

const SIMILARITY_THRESHOLD = 0.82;

function extractCep(address: string): string {
  const match = address.match(/\b(\d{5})-?(\d{3})\b/);
  return match ? `${match[1]}${match[2]}` : '';
}

function extractComplement(address: string): string {
  const patterns = [
    /\b(?:apto|apartamento|ap)\s*[\dº°a-z]+/i,
    /\b(?:bloco|bl)\s*[\dº°a-z]+/i,
    /\b(?:torre|tr)\s*[\dº°a-z]+/i,
    /\b(?:casa|cs)\s*[\dº°a-z]+/i,
    /\b(?:sala|sl)\s*[\dº°a-z]+/i,
    /\b(?:andar|and)\s*[\dº°a-z]+/i,
  ];
  const matches: string[] = [];
  for (const p of patterns) {
    const m = address.match(p);
    if (m) matches.push(m[0].trim());
  }
  return matches.join(', ');
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array(n + 1);
  let curr = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

function similarityRatio(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

export function isSimilarAddress(
  normA: ReturnType<typeof normalizeAddress>,
  normB: ReturnType<typeof normalizeAddress>,
  cepA: string,
  cepB: string,
): boolean {
  const hasNumberA = normA.number.length > 0;
  const hasNumberB = normB.number.length > 0;

  if (hasNumberA && hasNumberB) {
    if (normA.number !== normB.number) return false;
  }

  if (cepA && cepB && cepA !== cepB) return false;

  if (!hasNumberA && !hasNumberB) {
    if (cepA && cepB && cepA === cepB) {
      return similarityRatio(normA.streetName, normB.streetName) >= SIMILARITY_THRESHOLD;
    }
    return similarityRatio(normA.streetName, normB.streetName) >= 0.92;
  }

  if (!hasNumberA || !hasNumberB) return false;

  return similarityRatio(normA.streetName, normB.streetName) >= SIMILARITY_THRESHOLD;
}

export function findSimilarAddresses(
  rows: string[][],
  addressIndex: number,
  spxIndex: number,
  sequenceIndex: number,
): SimilarityGroup[] {
  const entries = rows.map((row, i) => {
    const raw = (row[addressIndex] ?? '').trim();
    const norm = normalizeAddress(raw);
    return {
      rowIndex: i,
      raw,
      norm,
      cep: extractCep(raw),
      complement: extractComplement(raw),
      spxTn: spxIndex >= 0 ? (row[spxIndex] ?? '').trim() : '',
      sequence: sequenceIndex >= 0 ? (row[sequenceIndex] ?? '').trim() : '',
    };
  });

  const visited = new Set<number>();
  const groups: SimilarityGroup[] = [];

  for (let i = 0; i < entries.length; i++) {
    if (visited.has(i)) continue;
    if (!entries[i].raw) continue;

    const cluster: number[] = [i];
    visited.add(i);

    for (let j = i + 1; j < entries.length; j++) {
      if (visited.has(j)) continue;
      if (!entries[j].raw) continue;

      if (
        entries[i].norm.normalized === entries[j].norm.normalized ||
        isSimilarAddress(entries[i].norm, entries[j].norm, entries[i].cep, entries[j].cep)
      ) {
        cluster.push(j);
        visited.add(j);
      }
    }

    if (cluster.length > 1) {
      const members: SimilarityGroupMember[] = cluster.map((idx) => ({
        rowIndex: entries[idx].rowIndex,
        originalAddress: entries[idx].raw,
        number: entries[idx].norm.number,
        cep: entries[idx].cep,
        complement: entries[idx].complement,
        spxTn: entries[idx].spxTn,
        sequence: entries[idx].sequence,
      }));

      groups.push({
        id: `group-${i}`,
        members,
      });
    }
  }

  return groups;
}

export function applyUnificationToRows(
  rows: string[][],
  decisions: SimilarityDecision[],
  addressIndex: number,
): string[][] {
  const result = rows.map((row) => [...row]);

  for (const decision of decisions) {
    for (const rowIdx of decision.selectedRowIndices) {
      const current = result[rowIdx][addressIndex] ?? '';
      const complement = extractComplement(current);
      const complementStr = complement ? ` ${complement}` : '';
      result[rowIdx][addressIndex] = `${decision.principalAddress}${complementStr}`.trim();
    }
  }

  return result;
}
