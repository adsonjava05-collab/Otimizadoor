import { buildOfficialAddress } from './normalizeService';
import {
  readXlsxByHeaders,
  findColumnIndices,
} from './xlsxReaderService';
import { createTsvBlob } from './tsvService';
import { groupDeliveriesWithOptions } from './groupingService';
import {
  findSimilarAddresses,
  applyUnificationToRows,
  type SimilarityGroup,
  type SimilarityDecision,
} from './similarAddressService';
import type { RawRow } from '../types';

export interface AddressDetectResult {
  similarGroups: SimilarityGroup[];
  headers: string[];
  rows: string[][];
  addressIndex: number;
  spxIndex: number;
  sequenceIndex: number;
}

export interface AddressOptimizeResult {
  processedCount: number;
  outputFileName: string;
  blob: Blob;
  totalOrders: number;
  totalStops: number;
}

export async function readAndDetectSimilar(file: File): Promise<AddressDetectResult> {
  const { headers, rows } = await readXlsxByHeaders(file);

  if (rows.length === 0) {
    return {
      similarGroups: [],
      headers,
      rows: [],
      addressIndex: -1,
      spxIndex: -1,
      sequenceIndex: -1,
    };
  }

  const indices = findColumnIndices(headers);

  if (indices.destinationAddress === -1) {
    throw new Error(
      'Coluna de endereço não encontrada. Verifique se a planilha possui um cabeçalho de endereço (ex: "Destination Address", "Endereco").',
    );
  }

  const similarGroups = findSimilarAddresses(
    rows,
    indices.destinationAddress,
    indices.spxTn,
    indices.sequence,
  );

  return {
    similarGroups,
    headers,
    rows,
    addressIndex: indices.destinationAddress,
    spxIndex: indices.spxTn,
    sequenceIndex: indices.sequence,
  };
}

export function optimizeRows(
  headers: string[],
  rows: string[][],
  addressIndex: number,
  spxIndex: number,
  sequenceIndex: number,
  decisions: SimilarityDecision[],
): AddressOptimizeResult {
  let workingRows = rows;

  if (decisions.length > 0) {
    workingRows = applyUnificationToRows(rows, decisions, addressIndex);
  }

  let processedCount = 0;
  let unchangedCount = 0;
  let alreadyCorrectCount = 0;

  const optimizedRows = workingRows.map((row) => {
    const addressCell = row[addressIndex]?.trim();

    if (addressCell) {
      const optimized = buildOfficialAddress(addressCell);
      if (optimized && optimized !== addressCell) {
        row[addressIndex] = optimized;
        processedCount++;
      } else if (optimized) {
        row[addressIndex] = optimized;
        alreadyCorrectCount++;
      } else {
        unchangedCount++;
      }
    } else {
      unchangedCount++;
    }

    return row;
  });

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const outputFileName = `Rota_${day}-${month}.tsv`;

  const blob = createTsvBlob(headers, optimizedRows);

  const statsRows: RawRow[] = optimizedRows.map((row, i) => ({
    colA: '',
    sequence: sequenceIndex >= 0 ? row[sequenceIndex] : '',
    colC: '',
    spxTn: spxIndex >= 0 ? row[spxIndex] : '',
    destinationAddress: row[addressIndex],
    colF: '',
    colG: '',
    colH: '',
    colI: '',
    colJ: '',
    extra: [],
    originalIndex: i,
  }));
  const totalStops = groupDeliveriesWithOptions(statsRows, true).length;

  return {
    processedCount,
    outputFileName,
    blob,
    totalOrders: rows.length,
    totalStops,
  };
}
