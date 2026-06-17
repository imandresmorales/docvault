import { Injectable, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { TextExtractorService } from '../ai/text-extractor.service';
import * as fs from 'fs';
import * as path from 'path';

/** MIME types that can be previewed inline in the browser */
const PREVIEWABLE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'text/plain',
  'text/markdown',
]);

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private textExtractor: TextExtractorService,
  ) {}

  async create(userId: string, file: Express.Multer.File, metadata: any) {
    return this.prisma.document.create({
      data: {
        title: metadata.title || file.originalname,
        description: metadata.description || '',
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        tags: metadata.tags || '',
        category: metadata.category || null,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, userId },
    });
    
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }
    
    return document;
  }

  async remove(id: string, userId: string) {
    const document = await this.findOne(id, userId);

    // Delete file from disk
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    return this.prisma.document.delete({
      where: { id },
    });
  }

  /**
   * Returns preview metadata.
   * Throws UnsupportedMediaTypeException if the file type cannot be previewed.
   * The controller is responsible for streaming the file.
   */
  async getPreviewInfo(id: string, userId: string) {
    const document = await this.findOne(id, userId);

    if (!PREVIEWABLE_TYPES.has(document.mimeType)) {
      throw new UnsupportedMediaTypeException(
        `Vista previa no disponible para este tipo de archivo (${document.mimeType}). Descarga el archivo para abrirlo.`,
      );
    }

    if (!fs.existsSync(document.path)) {
      throw new NotFoundException('El archivo físico no se encuentra en el servidor.');
    }

    return {
      document,
      filePath: path.resolve(document.path),
      mimeType: document.mimeType,
    };
  }

  /**
   * Extracts text from the document and generates an AI summary.
   * Caches nothing — each call goes to OpenAI.
   */
  async getSummary(id: string, userId: string) {
    const document = await this.findOne(id, userId);
    const filePath = path.resolve(document.path);
    const text = await this.textExtractor.extract(filePath, document.mimeType);
    const result = await this.aiService.generateSummary(text, document.title);
    return {
      documentId: id,
      title: document.title,
      ...result,
    };
  }

  /**
   * Answers a question about the document using its extracted text as context.
   */
  async answerQuestion(id: string, userId: string, question: string) {
    const document = await this.findOne(id, userId);
    const filePath = path.resolve(document.path);
    const text = await this.textExtractor.extract(filePath, document.mimeType);
    const answer = await this.aiService.answerQuestion(question, text, document.title);
    return {
      documentId: id,
      question,
      answer,
    };
  }

  /**
   * Returns per-category counts and aggregated file size for a user's documents.
   * Also includes totals and a breakdown by MIME type.
   */
  async getStats(userId: string) {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      select: { category: true, mimeType: true, size: true, createdAt: true },
    });

    const totalCount = documents.length;
    const totalSize  = documents.reduce((sum, d) => sum + d.size, 0);

    // Group by category
    const categoryMap = new Map<string, { count: number; size: number }>();
    for (const doc of documents) {
      const cat = doc.category ?? 'Sin categoría';
      const entry = categoryMap.get(cat) ?? { count: 0, size: 0 };
      entry.count += 1;
      entry.size  += doc.size;
      categoryMap.set(cat, entry);
    }

    const byCategory = Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count);

    // Group by MIME type label
    const mimeMap = new Map<string, number>();
    for (const doc of documents) {
      mimeMap.set(doc.mimeType, (mimeMap.get(doc.mimeType) ?? 0) + 1);
    }

    const byMimeType = Array.from(mimeMap.entries())
      .map(([mimeType, count]) => ({ mimeType, count }))
      .sort((a, b) => b.count - a.count);

    // Documents uploaded per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentDocs = documents.filter((d) => new Date(d.createdAt) >= sixMonthsAgo);
    const monthMap = new Map<string, number>();
    for (const doc of recentDocs) {
      const key = new Date(doc.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }
    const byMonth = Array.from(monthMap.entries()).map(([month, count]) => ({ month, count }));

    return { totalCount, totalSize, byCategory, byMimeType, byMonth };
  }

  /**
   * Returns all documents for a user filtered by category.
   * Pass null / 'Sin categoría' to retrieve uncategorized documents.
   */
  async findByCategory(userId: string, category: string) {
    const isUncategorized = category === 'Sin categoría' || category === 'null';
    return this.prisma.document.findMany({
      where: {
        userId,
        category: isUncategorized ? null : category,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
