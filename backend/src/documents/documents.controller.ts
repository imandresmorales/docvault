import { Controller, Post, Get, Delete, Param, UseGuards, UseInterceptors, UploadedFile, Body, Request, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import * as fs from 'fs';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4() + extname(file.originalname);
        cb(null, uniqueSuffix);
      }
    }),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: any, @Request() req: any) {
    if (!file) {
      throw new BadRequestException('Ningún archivo fue subido');
    }
    return this.documentsService.create(req.user.id, file, body);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.documentsService.findAll(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.findOne(id, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.documentsService.remove(id, req.user.id);
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Request() req: any, @Res() res: Response) {
    const document = await this.documentsService.findOne(id, req.user.id);
    
    if (!fs.existsSync(document.path)) {
      throw new BadRequestException('El archivo físico no existe');
    }

    res.set({
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.originalName}"`,
    });
    
    const fileStream = fs.createReadStream(document.path);
    fileStream.pipe(res);
  }
}
