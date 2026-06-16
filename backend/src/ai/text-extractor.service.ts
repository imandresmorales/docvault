import { Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/** Maximum characters to send to OpenAI (~3 000 tokens for gpt-4o-mini) */
const MAX_CHARS = 12_000;

/** MIME types that can yield plain text */
const TEXT_MIMES = new Set(['text/plain', 'text/markdown', 'text/html', 'text/csv']);

@Injectable()
export class TextExtractorService {
  /**
   * Extracts raw text from a file on disk.
   * Currently supports:
   *  - Plain text / Markdown / CSV (read directly)
   *  - PDF (pdf-parse)
   * All other types throw UnsupportedMediaTypeException.
   *
   * @returns  Extracted text, truncated to MAX_CHARS.
   */
  async extract(filePath: string, mimeType: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe en la ruta: ${filePath}`);
    }

    let text: string;

    if (TEXT_MIMES.has(mimeType)) {
      text = fs.readFileSync(filePath, 'utf-8');
    } else if (mimeType === 'application/pdf') {
      text = await this.extractPdf(filePath);
    } else {
      throw new UnsupportedMediaTypeException(
        `Extracción de texto no soportada para el tipo "${mimeType}". ` +
          'Solo se puede resumir PDF, texto plano y Markdown.',
      );
    }

    // Trim and cap to avoid exceeding OpenAI context window
    const trimmed = text.replace(/\s+/g, ' ').trim();
    return trimmed.length > MAX_CHARS ? trimmed.slice(0, MAX_CHARS) + '…' : trimmed;
  }

  private async extractPdf(filePath: string): Promise<string> {
    // Dynamic import avoids issues with pdf-parse's top-level side effects
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>;
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  /**
   * Returns the file extension derived from the MIME type, useful for labelling.
   */
  static mimeToLabel(mimeType: string): string {
    const map: Record<string, string> = {
      'application/pdf': 'PDF',
      'text/plain': 'Texto',
      'text/markdown': 'Markdown',
      'text/csv': 'CSV',
    };
    return map[mimeType] ?? mimeType;
  }
}
