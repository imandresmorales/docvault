import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface AiSummaryResult {
  summary: string;
  keyPoints: string[];
  language: string;
}

@Injectable()
export class AiService {
  private client: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey.trim() !== '') {
      this.client = new OpenAI({ apiKey });
    }
  }

  private ensureClient(): OpenAI {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'La integración con IA no está disponible. Configura OPENAI_API_KEY en el archivo .env.',
      );
    }
    return this.client;
  }

  /**
   * Generates a structured document summary using GPT.
   * Returns a summary, bullet-point key points, and the detected language.
   *
   * @param text  Extracted plain text from the document (≤ 4 000 tokens).
   * @param title Document title for additional context.
   */
  async generateSummary(text: string, title: string): Promise<AiSummaryResult> {
    const client = this.ensureClient();

    const systemPrompt = `
You are a professional document analyst assistant.
Given the content of a document, you must respond ONLY with a valid JSON object with exactly this shape:
{
  "summary": "<2-4 sentence overview of the document's main content and purpose>",
  "keyPoints": ["<point 1>", "<point 2>", "<point 3>", ...],
  "language": "<ISO 639-1 language code, e.g. es, en, fr>"
}
- keyPoints must have 3 to 7 items.
- Write in the same language as the document.
- Do NOT include any text outside the JSON object.
`.trim();

    const userMessage = `Document title: "${title}"\n\nDocument content:\n${text}`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';

    try {
      const parsed = JSON.parse(raw) as AiSummaryResult;
      return {
        summary:   parsed.summary   ?? 'No se pudo generar un resumen.',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        language:  parsed.language  ?? 'es',
      };
    } catch {
      throw new ServiceUnavailableException(
        'La respuesta de la IA no tiene el formato esperado. Inténtalo de nuevo.',
      );
    }
  }

  /**
   * Answers a question about a document using GPT with the extracted text as context.
   *
   * @param question  The user's question.
   * @param text      Extracted document content used as context.
   * @param title     Document title.
   */
  async answerQuestion(question: string, text: string, title: string): Promise<string> {
    const client = this.ensureClient();

    const systemPrompt = `
You are a helpful assistant that answers questions strictly based on the content of the provided document.
If the answer cannot be found in the document, say so clearly.
Always respond in the same language as the question.
`.trim();

    const userMessage = `
Document title: "${title}"

Document content:
${text}

---
Question: ${question}
`.trim();

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage },
      ],
      temperature: 0.4,
      max_tokens: 800,
    });

    return completion.choices[0]?.message?.content?.trim() ?? 'No se pudo obtener una respuesta.';
  }
}
