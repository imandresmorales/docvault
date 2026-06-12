import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

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
}
