import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalProducts, totalProjects, totalBlogPosts, totalTestimonials,
      totalCoffeeTypes, totalUsers, newContactMessages, newApplications,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.project.count(),
      this.prisma.blogPost.count(),
      this.prisma.testimonial.count(),
      this.prisma.coffeeType.count(),
      this.prisma.user.count(),
      this.prisma.contactMessage.count({ where: { status: 'NEW' } }),
      this.prisma.application.count({ where: { status: 'NEW' } }),
    ]);

    return {
      totalProducts, totalProjects, totalBlogPosts, totalTestimonials,
      totalCoffeeTypes, totalUsers, newContactMessages, newApplications,
    };
  }

  async search(q: string) {
    if (!q || q.length < 2) return { products: [], projects: [], blogPosts: [] };

    const [products, projects, blogPosts] = await Promise.all([
      this.prisma.product.findMany({
        where: { name: { contains: q, mode: 'insensitive' } },
        include: { category: true, images: true },
        take: 5,
      }),
      this.prisma.project.findMany({
        where: { title: { contains: q, mode: 'insensitive' } },
        include: { category: true, client: true, images: true },
        take: 5,
      }),
      this.prisma.blogPost.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { categories: { include: { category: true } }, tags: { include: { tag: true } } },
        take: 5,
      }),
    ]);

    return { products, projects, blogPosts };
  }
}
