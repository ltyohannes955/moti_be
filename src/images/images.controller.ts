import { Controller, Get, Param, ParseIntPipe, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller()
export class ImagesController {
  constructor(private prisma: PrismaService) {}

  @Public()
  @Get('product-images/:id')
  async productImage(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const img = await this.prisma.productImage.findUnique({ where: { id } });
    if (!img) throw new NotFoundException();
    this.sendImage(img.imageUrl, res);
  }

  @Public()
  @Get('project-images/:id')
  async projectImage(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const img = await this.prisma.projectImage.findUnique({ where: { id } });
    if (!img) throw new NotFoundException();
    this.sendImage(img.imageUrl, res);
  }

  @Public()
  @Get('team/:id/image')
  async teamImage(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const member = await this.prisma.teamMember.findUnique({ where: { id } });
    if (!member?.imageUrl) throw new NotFoundException();
    this.sendImage(member.imageUrl, res);
  }

  @Public()
  @Get('clients/:id/logo')
  async clientLogo(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org?.logo) throw new NotFoundException();
    this.sendImage(org.logo, res);
  }

  @Public()
  @Get('gallery-images/:id')
  async galleryImage(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const img = await this.prisma.galleryImage.findUnique({ where: { id } });
    if (!img?.imageUrl) throw new NotFoundException();
    this.sendImage(img.imageUrl, res);
  }

  private sendImage(dataUri: string, res: Response) {
    const matches = dataUri.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) throw new BadRequestException('Invalid image data');
    const buffer = Buffer.from(matches[2], 'base64');
    res.set('Content-Type', matches[1]);
    res.set('Content-Length', String(buffer.length));
    res.send(buffer);
  }
}
