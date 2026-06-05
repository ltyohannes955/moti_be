const dotenv = require('dotenv');
dotenv.config();

const { PrismaClient } = require('../generated/prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });
  await prisma.$connect();

  console.log('--- Seeding Super Admin ---');
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@moti.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456';
  const existingAdmin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (existingAdmin) {
    console.log('SUPER_ADMIN already exists:', existingAdmin.email);
  } else {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name: 'Super Admin', password: hashed, role: 'SUPER_ADMIN' },
    });
    console.log('SUPER_ADMIN created:', user.email);
  }

  console.log('\n--- Seeding Product Categories ---');
  const categories = [
    { name: 'Digital Banking Solutions', slug: 'digital-banking-solutions', description: 'Core banking, mobile wallets, and agent banking platforms for Ethiopian financial institutions' },
    { name: 'ERP Solutions', slug: 'erp-solutions', description: 'Enterprise resource planning tailored for Ethiopian businesses with local tax compliance' },
    { name: 'CRM Solutions', slug: 'crm-solutions', description: 'Customer relationship management with Amharic and English interface support' },
    { name: 'Payment Gateway Solutions', slug: 'payment-gateway-solutions', description: 'Unified payment integrations for Telebirr, CBE Birr, Amole and card payments' },
    { name: 'Mobile & USSD Banking', slug: 'mobile-ussd-banking', description: 'Banking access via feature phones and smartphones for financial inclusion' },
    { name: 'Data Analytics & BI', slug: 'data-analytics-bi', description: 'Business intelligence dashboards, fraud detection, and regulatory reporting' },
  ];

  const catMap = new Map();
  for (const cat of categories) {
    const existing = await prisma.productCategory.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      catMap.set(cat.slug, existing);
      console.log('  EXISTS:', cat.name);
    } else {
      const created = await prisma.productCategory.create({ data: cat });
      catMap.set(cat.slug, created);
      console.log('  CREATED:', cat.name);
    }
  }

  console.log('\n--- Seeding Products ---');
  const products = [
    { name: 'Amole Wallet Suite', slug: 'amole-wallet-suite', description: 'Digital wallet platform with bill payments, airtime top-up, merchant payments, and peer-to-peer transfers.', categorySlug: 'digital-banking-solutions', imgColor: '1B5E20' },
    { name: 'CBE Birr Integration Hub', slug: 'cbe-birr-integration-hub', description: 'Seamless API integration layer for CBE Birr mobile money with real-time transaction processing.', categorySlug: 'digital-banking-solutions', imgColor: '2E7D32' },
    { name: 'Agent Banking Platform', slug: 'agent-banking-platform', description: 'Rural agent banking network management with liquidity monitoring and commission tracking.', categorySlug: 'digital-banking-solutions', imgColor: '388E3C' },
    { name: 'EthioERP Enterprise', slug: 'ethioerp-enterprise', description: 'Full ERP suite with Amharic localization, Ethiopian tax compliance, and multi-currency support.', categorySlug: 'erp-solutions', imgColor: '1565C0' },
    { name: 'Supply Chain Manager', slug: 'supply-chain-manager', description: 'End-to-end inventory, procurement, and distribution tracking with Ethiopian logistics integration.', categorySlug: 'erp-solutions', imgColor: '1976D2' },
    { name: 'HR & Payroll Pro', slug: 'hr-payroll-pro', description: 'Ethiopian tax table compliant payroll with pension, provident fund, and cost-sharing calculations.', categorySlug: 'erp-solutions', imgColor: '1E88E5' },
    { name: 'Customer 360 Platform', slug: 'customer-360-platform', description: 'Unified customer view across all channels with bilingual Amharic/English support.', categorySlug: 'crm-solutions', imgColor: '6A1B9A' },
    { name: 'Sales Force Automation', slug: 'sales-force-automation', description: 'Lead tracking, pipeline management, and field agent mobile app for remote areas.', categorySlug: 'crm-solutions', imgColor: '7B1FA2' },
    { name: 'EthioPay Gateway', slug: 'ethiopay-gateway', description: 'Unified payment API supporting Telebirr, CBE Birr, Amole, Visa, and Mastercard.', categorySlug: 'payment-gateway-solutions', imgColor: 'E65100' },
    { name: 'POS Terminal Suite', slug: 'pos-terminal-suite', description: 'Mobile POS with QR code payments, NFC tap-to-pay, and offline transaction support.', categorySlug: 'payment-gateway-solutions', imgColor: 'EF6C00' },
    { name: 'USSD Banking Platform', slug: 'ussd-banking-platform', description: 'Feature phone banking via *808# style USSD menus with Amharic voice prompts.', categorySlug: 'mobile-ussd-banking', imgColor: '00838F' },
    { name: 'Mobile Banking App', slug: 'mobile-banking-app', description: 'Native iOS and Android app with biometric authentication, offline mode, and location-based services.', categorySlug: 'mobile-ussd-banking', imgColor: '0097A7' },
    { name: 'InsightHub Dashboard', slug: 'insighthub-dashboard', description: 'Real-time financial analytics, regulatory compliance reports, and customizable KPI dashboards.', categorySlug: 'data-analytics-bi', imgColor: '37474F' },
    { name: 'Fraud Detection Engine', slug: 'fraud-detection-engine', description: 'ML-powered transaction monitoring for Ethiopian banking with real-time alerting.', categorySlug: 'data-analytics-bi', imgColor: '455A64' },
    { name: 'Regulatory Reporting Suite', slug: 'regulatory-reporting-suite', description: 'Automated NBE (National Bank of Ethiopia) compliance reporting and audit trail management.', categorySlug: 'data-analytics-bi', imgColor: '546E7A' },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (existing) {
      console.log('  EXISTS:', prod.name);
      continue;
    }
    const category = catMap.get(prod.categorySlug);
    const product = await prisma.product.create({
      data: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        categoryId: category.id,
        status: 'ACTIVE',
      },
    });
    const encoded = encodeURIComponent(prod.name);
    await prisma.productImage.create({
      data: {
        imageUrl: `https://placehold.co/600x400/${prod.imgColor}/white?text=${encoded}`,
        productId: product.id,
      },
    });
    console.log('  CREATED:', prod.name);
  }

  console.log('\n--- Seeding Organizations ---');
  const organizations = [
    { name: 'Ethio Telecom', slug: 'ethio-telecom', type: 'CLIENT', description: 'Leading telecommunications provider in Ethiopia', website: 'https://www.ethiotelecom.et', logo: 'https://placehold.co/200x80/E65100/white?text=Ethio+Telecom' },
    { name: 'Dashen Bank', slug: 'dashen-bank', type: 'CLIENT', description: 'One of the largest private banks in Ethiopia', website: 'https://www.dashenbanksc.com', logo: 'https://placehold.co/200x80/1565C0/white?text=Dashen+Bank' },
    { name: 'Ethiopian Airlines', slug: 'ethiopian-airlines', type: 'CLIENT', description: 'The flag carrier of Ethiopia and Africa\'s largest airline', website: 'https://www.ethiopianairlines.com', logo: 'https://placehold.co/200x80/6A1B9A/white?text=ET+Airlines' },
    { name: 'Awash Bank', slug: 'awash-bank', type: 'PARTNER', description: 'Leading private commercial bank established in 1994', website: 'https://www.awashbank.com', logo: 'https://placehold.co/200x80/2E7D32/white?text=Awash+Bank' },
    { name: 'Kifiya Financial Technology', slug: 'kifiya-fintech', type: 'PARTNER', description: 'Financial technology company providing digital payment solutions', website: 'https://www.kifiya.com', logo: 'https://placehold.co/200x80/00838F/white?text=Kifiya' },
  ];

  const orgMap = new Map();
  for (const org of organizations) {
    const existing = await prisma.organization.findUnique({ where: { slug: org.slug } });
    if (existing) {
      if (!existing.logo) {
        await prisma.organization.update({
          where: { slug: org.slug },
          data: { logo: org.logo },
        });
        console.log('  LOGO ADDED:', org.name);
      } else {
        console.log('  EXISTS:', org.name);
      }
      orgMap.set(org.slug, existing);
    } else {
      const created = await prisma.organization.create({ data: org });
      orgMap.set(org.slug, created);
      console.log('  CREATED:', org.name);
    }
  }

  console.log('\n--- Seeding Project Categories ---');
  const projectCategories = [
    { name: 'Website Development', slug: 'website-development', description: 'Custom websites, portals, and web applications for Ethiopian enterprises' },
    { name: 'Mobile App Development', slug: 'mobile-app-development', description: 'Native iOS and Android applications with offline-first architecture' },
    { name: 'Digital Marketing', slug: 'digital-marketing', description: 'SEO, social media campaigns, and digital branding strategies' },
    { name: 'IT Consulting', slug: 'it-consulting', description: 'Digital transformation strategy, infrastructure assessment, and technology advisory' },
    { name: 'Cloud & Infrastructure', slug: 'cloud-infrastructure', description: 'Cloud migration, DevOps setup, and managed hosting for Ethiopian businesses' },
  ];

  const projCatMap = new Map();
  for (const cat of projectCategories) {
    const existing = await prisma.projectCategory.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      projCatMap.set(cat.slug, existing);
      console.log('  EXISTS:', cat.name);
    } else {
      const created = await prisma.projectCategory.create({ data: cat });
      projCatMap.set(cat.slug, created);
      console.log('  CREATED:', cat.name);
    }
  }

  console.log('\n--- Seeding Projects ---');
  const projects = [
    { title: 'Telecom Customer Portal', slug: 'telecom-customer-portal', description: 'Self-service customer portal for Ethio Telecom with bill payment, usage tracking, and support ticketing.', categorySlug: 'website-development', clientSlug: 'ethio-telecom', images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop'] },
    { title: 'Dashen Mobile Banking App', slug: 'dashen-mobile-banking', description: 'Complete mobile banking experience with account management, transfers, bill payments, and Amole integration.', categorySlug: 'mobile-app-development', clientSlug: 'dashen-bank', images: ['https://images.unsplash.com/photo-1616077168079-7ab467b0800b?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&h=400&fit=crop'] },
    { title: 'Ethiopian Airlines Booking Engine', slug: 'airlines-booking-engine', description: 'Next-generation flight booking platform with multi-city search, seat selection, and ShebaMiles integration.', categorySlug: 'website-development', clientSlug: 'ethiopian-airlines', images: ['https://images.unsplash.com/photo-1436491865332-7a61a109bb05?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1488646953014-85cb804e2392?w=600&h=400&fit=crop'] },
    { title: 'Awash Digital Wallet', slug: 'awash-digital-wallet', description: 'Mobile wallet app for Awash Bank customers with QR payments, airtime purchase, and peer-to-peer transfers.', categorySlug: 'mobile-app-development', clientSlug: 'awash-bank', images: ['https://images.unsplash.com/photo-1559526324-4b87b5ae9155?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop'] },
    { title: 'Kifiya Payment Gateway Integration', slug: 'kifiya-payment-gateway', description: 'API-based payment gateway integration connecting Kifiya with major Ethiopian banks and mobile money providers.', categorySlug: 'it-consulting', clientSlug: 'kifiya-fintech', images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop'] },
    { title: 'Ethio Telecom Cloud Migration', slug: 'ethio-telecom-cloud-migration', description: 'Large-scale cloud infrastructure migration from on-premise data centers to hybrid cloud architecture.', categorySlug: 'cloud-infrastructure', clientSlug: 'ethio-telecom', images: ['https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop'] },
    { title: 'Dashen Bank SEO Campaign', slug: 'dashen-seo-campaign', description: 'Comprehensive SEO and digital marketing campaign to increase online visibility for Dashen Bank products.', categorySlug: 'digital-marketing', clientSlug: 'dashen-bank', images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&h=400&fit=crop'] },
    { title: 'Airlines Crew Management App', slug: 'airlines-crew-app', description: 'Internal mobile app for Ethiopian Airlines crew scheduling, roster management, and flight briefings.', categorySlug: 'mobile-app-development', clientSlug: 'ethiopian-airlines', images: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=600&h=400&fit=crop'] },
    { title: 'Awash Bank Corporate Portal', slug: 'awash-corporate-portal', description: 'Corporate banking portal with bulk payments, payroll processing, trade finance, and forex management.', categorySlug: 'website-development', clientSlug: 'awash-bank', images: ['https://images.unsplash.com/photo-1486406143026-8e377759f681?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop'] },
    { title: 'Kifiya DevOps Pipeline Setup', slug: 'kifiya-devops-pipeline', description: 'End-to-end CI/CD pipeline setup with automated testing, containerization, and monitoring for Kifiya products.', categorySlug: 'cloud-infrastructure', clientSlug: 'kifiya-fintech', images: ['https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&h=400&fit=crop', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop'] },
  ];

  for (const proj of projects) {
    const existing = await prisma.project.findUnique({ where: { slug: proj.slug } });
    if (existing) {
      const currentImages = await prisma.projectImage.findMany({ where: { projectId: existing.id } });
      const hasPlaceholders = currentImages.some((img) => img.imageUrl.includes('placehold.co'));
      if (hasPlaceholders) {
        await prisma.projectImage.deleteMany({ where: { projectId: existing.id } });
        await Promise.all(
          proj.images.map((url) =>
            prisma.projectImage.create({ data: { imageUrl: url, projectId: existing.id } }),
          ),
        );
        console.log('  IMAGES REPLACED:', proj.title);
      } else {
        console.log('  EXISTS:', proj.title);
      }
      continue;
    }
    const category = projCatMap.get(proj.categorySlug);
    const client = orgMap.get(proj.clientSlug);
    const project = await prisma.project.create({
      data: {
        title: proj.title,
        slug: proj.slug,
        description: proj.description,
        categoryId: category.id,
        clientId: client.id,
        status: 'ACTIVE',
      },
    });
    await Promise.all(
      proj.images.map((url) =>
        prisma.projectImage.create({ data: { imageUrl: url, projectId: project.id } }),
      ),
    );
    console.log('  CREATED:', proj.title);
  }

  console.log('\n--- Seeding Blog Categories ---');
  const blogCategories = [
    { name: 'Fintech', slug: 'fintech', description: 'Financial technology innovations shaping Ethiopia\'s banking landscape' },
    { name: 'Digital Banking', slug: 'digital-banking', description: 'Mobile banking, agent banking, and digital financial services' },
    { name: 'Startup Ecosystem', slug: 'startup-ecosystem', description: 'Ethiopian startup news, funding rounds, and ecosystem growth' },
    { name: 'Mobile Money', slug: 'mobile-money', description: 'Telebirr, CBE Birr, and the evolution of mobile wallets in Ethiopia' },
    { name: 'Tech Policy', slug: 'tech-policy', description: 'Regulatory updates, NBE directives, and digital policy in Ethiopia' },
  ];

  const blogCatMap = new Map();
  for (const cat of blogCategories) {
    const existing = await prisma.blogCategory.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      blogCatMap.set(cat.slug, existing);
      console.log('  EXISTS:', cat.name);
    } else {
      const created = await prisma.blogCategory.create({ data: cat });
      blogCatMap.set(cat.slug, created);
      console.log('  CREATED:', cat.name);
    }
  }

  console.log('\n--- Seeding Blog Tags ---');
  const blogTags = [
    { name: 'Telebirr', slug: 'telebirr' },
    { name: 'CBE Birr', slug: 'cbe-birr' },
    { name: 'Digital Ethiopia', slug: 'digital-ethiopia' },
    { name: 'Innovation', slug: 'innovation' },
    { name: 'Mobile Banking', slug: 'mobile-banking' },
    { name: 'Financial Inclusion', slug: 'financial-inclusion' },
    { name: 'API', slug: 'api' },
    { name: 'Cyber Security', slug: 'cyber-security' },
    { name: 'Cloud Computing', slug: 'cloud-computing' },
    { name: 'AI/ML', slug: 'ai-ml' },
  ];

  const tagMap = new Map();
  for (const tag of blogTags) {
    const existing = await prisma.blogTag.findUnique({ where: { slug: tag.slug } });
    if (existing) {
      tagMap.set(tag.slug, existing);
      console.log('  EXISTS:', tag.name);
    } else {
      const created = await prisma.blogTag.create({ data: tag });
      tagMap.set(tag.slug, created);
      console.log('  CREATED:', tag.name);
    }
  }

  console.log('\n--- Seeding Blog Posts ---');
  const blogPosts = [
    { title: 'How Telebirr is Transforming Digital Payments in Ethiopia', excerpt: 'A deep dive into Ethio Telecom\'s mobile money platform and its impact on financial inclusion across the country.', content: 'Since its launch, Telebirr has revolutionized how Ethiopians handle money. With millions of active users, the platform enables bill payments, merchant transactions, and peer-to-peer transfers without requiring a traditional bank account. This article explores the technology behind Telebirr, its integration with banks, and what the future holds for mobile money in Ethiopia.', type: 'BLOG', categorySlugs: ['fintech', 'mobile-money'], tagSlugs: ['telebirr', 'digital-ethiopia', 'mobile-banking'], imgColor: '1B5E20' },
    { title: 'CBE Birr vs Telebirr: Ethiopia\'s Mobile Money Showdown', excerpt: 'Comparing the two largest mobile money platforms in Ethiopia — features, reach, and user experience.', content: 'With the National Bank of Ethiopia opening up mobile money licensing, competition is heating up. CBE Birr, backed by the Commercial Bank of Ethiopia, and Telebirr, powered by Ethio Telecom, are the two dominant players. We compare their APIs, agent networks, transaction limits, and interoperability plans to help developers choose the right integration partner.', type: 'BLOG', categorySlugs: ['mobile-money', 'digital-banking'], tagSlugs: ['cbe-birr', 'telebirr', 'financial-inclusion'], imgColor: '1565C0' },
    { title: 'Building Scalable Fintech APIs for the Ethiopian Market', excerpt: 'Best practices for designing APIs that handle intermittent connectivity, Amharic text, and local payment methods.', content: 'Developing for the Ethiopian market presents unique challenges: inconsistent internet connectivity, USSD fallback requirements, Amharic character support, and integration with local payment providers. This guide covers RESTful API design patterns, offline-first architecture, local hosting considerations, and compliance with NBE regulations for fintech products.', type: 'BLOG', categorySlugs: ['fintech', 'tech-policy'], tagSlugs: ['api', 'innovation', 'digital-ethiopia'], imgColor: 'E65100' },
    { title: 'The Rise of Ethiopian Tech Startups in 2024', excerpt: 'A roundup of the most promising startups, funding rounds, and incubator programs emerging from Ethiopia.', content: 'Ethiopia\'s startup ecosystem is experiencing unprecedented growth. With the government\'s digital transformation strategy, new VC funds, and increasing internet penetration, entrepreneurs are launching ventures in agritech, healthtech, edtech, and fintech. We profile 10 startups to watch, the challenges they face, and the opportunities ahead for the Ethiopian tech scene.', type: 'NEWS', categorySlugs: ['startup-ecosystem'], tagSlugs: ['innovation', 'digital-ethiopia'], imgColor: '6A1B9A' },
    { title: 'Cloud Computing Adoption in Ethiopian Financial Institutions', excerpt: 'How banks and fintechs are migrating from on-premise to cloud infrastructure while navigating regulatory requirements.', content: 'Ethiopian banks have traditionally relied on on-premise data centers, but the shift to cloud is accelerating. With Ethio Telecom\'s improved bandwidth, AWS\'s growing presence in Africa, and the NBE\'s cloud computing guidelines, financial institutions are now evaluating hybrid and multi-cloud strategies. We explore the benefits, risks, and compliance considerations for cloud adoption in Ethiopia.', type: 'BLOG', categorySlugs: ['digital-banking', 'tech-policy'], tagSlugs: ['cloud-computing', 'innovation', 'cyber-security'], imgColor: '00838F' },
    { title: 'AI and Machine Learning Applications in Ethiopian Agriculture', excerpt: 'From crop disease detection to supply chain optimization — how AI is transforming Ethiopia\'s largest sector.', content: 'Agriculture employs over 70% of Ethiopia\'s workforce and contributes 35% of GDP. AI/ML technologies are now being applied to satellite imagery analysis for crop monitoring, mobile-based plant disease diagnosis, and predictive analytics for market prices. We examine case studies from local agritech startups and international partnerships bringing AI to Ethiopian farmers.', type: 'NEWS', categorySlugs: ['startup-ecosystem'], tagSlugs: ['ai-ml', 'innovation', 'digital-ethiopia'], imgColor: '2E7D32' },
    { title: 'Ethiopia Launches National Digital ID System for All Citizens', excerpt: 'The government rolls out a biometric digital ID program aimed at covering 70 million citizens within three years.', content: 'The National Bank of Ethiopia, in partnership with the Ministry of Innovation and Technology, has officially launched the national digital ID system (Fayda). The program will issue biometric IDs to all citizens, enabling seamless access to banking, healthcare, government services, and mobile money. The first phase targets 20 million enrolments by the end of the year, with interoperability standards requiring all financial institutions to accept Fayda verification by Q2 2026.', type: 'NEWS', categorySlugs: ['fintech', 'tech-policy'], tagSlugs: ['digital-ethiopia', 'innovation', 'cyber-security'], imgColor: '0D47A1' },
    { title: 'Ethio Telecom Reports Record 45M Mobile Subscribers', excerpt: 'State-owned telecom giant crosses major milestone as data usage surges 60% year over year.', content: 'Ethio Telecom announced record growth in its Q2 earnings report, reaching 45 million mobile subscribers nationwide. Data consumption surged 60% compared to the same period last year, driven by the expansion of 4G coverage to 850 cities and towns. The company also reported that Telebirr now has 38 million registered users, processing over 1.5 billion ETB in daily transactions. CEO Frehiwot Tamiru cited infrastructure investments and spectrum expansion as key drivers of the growth.', type: 'NEWS', categorySlugs: ['mobile-money', 'digital-banking'], tagSlugs: ['telebirr', 'digital-ethiopia', 'mobile-banking'], imgColor: 'E65100' },
    { title: 'Safaricom Ethiopia Launches M-Pesa in 15 New Cities', excerpt: 'The mobile money service expands to cover 30 cities nationwide, challenging Telebirr\'s market dominance.', content: 'Safaricom Ethiopia has expanded its M-Pesa mobile money service to 15 additional cities, bringing the total coverage to 30 cities across the country. The expansion includes major regional capitals such as Bahir Dar, Hawassa, Dire Dawa, and Mekelle. M-Pesa Ethiopia now boasts 5 million active users and plans to introduce savings and loan products by the end of the year. The move intensifies competition with Ethio Telecom\'s Telebirr, which currently leads the market with 38 million users.', type: 'NEWS', categorySlugs: ['mobile-money', 'fintech'], tagSlugs: ['mobile-banking', 'financial-inclusion', 'digital-ethiopia'], imgColor: '1565C0' },
    { title: 'New Cyber Security Law Passed to Protect Digital Financial Services', excerpt: 'Ethiopia\'s parliament approves comprehensive cyber security legislation targeting fintech and mobile money platforms.', content: 'The Ethiopian parliament has unanimously passed the Cyber Security Proclamation, a comprehensive law aimed at protecting the country\'s rapidly growing digital financial ecosystem. The law mandates minimum security standards for all financial technology platforms, requires breach notification within 24 hours, and establishes a national cyber security center to coordinate threat response. Fintech companies have 12 months to comply with the new regulations, which include mandatory penetration testing, data encryption requirements, and customer data protection provisions.', type: 'NEWS', categorySlugs: ['tech-policy', 'digital-banking'], tagSlugs: ['cyber-security', 'digital-ethiopia', 'innovation'], imgColor: '4A148C' },
    { title: 'Ethiopian Banks Report 35% Increase in Digital Transactions', excerpt: 'Digital banking adoption accelerates as traditional bank branches see declining foot traffic.', content: 'A joint report from the National Bank of Ethiopia and the Ethiopian Banking Association reveals that digital banking transactions grew 35% in the past fiscal year, reaching 2.3 trillion ETB in total value. The number of active mobile banking users increased to 12 million, while internet banking users grew to 4.5 million. Branches, however, reported a 15% decline in over-the-counter transactions. The report attributes the shift to improved smartphone penetration, better network coverage, and the convenience of mobile money interoperability between banks and telcos.', type: 'NEWS', categorySlugs: ['digital-banking', 'fintech'], tagSlugs: ['mobile-banking', 'api', 'innovation'], imgColor: '00695C' },

    // --- Additional BLOG posts for pagination ---
    { title: 'Building Microservices with NestJS and Prisma', excerpt: 'A practical guide to building scalable microservices using NestJS, Prisma, and PostgreSQL.', content: 'NestJS provides a solid foundation for building enterprise-grade microservices. Combined with Prisma as the ORM layer and PostgreSQL for persistence, developers can create maintainable and scalable backend systems. This guide walks through setting up a NestJS monorepo, configuring Prisma with multiple datasources, implementing inter-service communication with RabbitMQ, and deploying with Docker Compose.', type: 'BLOG', categorySlugs: ['fintech'], tagSlugs: ['api', 'cloud-computing', 'innovation'], imgColor: '37474F' },
    { title: 'Why TypeScript is a Game Changer for Ethiopian Developers', excerpt: 'How TypeScript is helping Ethiopian developers build more reliable software.', content: 'TypeScript adoption is growing rapidly among Ethiopian developers, from fintech startups to enterprise banks. The language catches errors at compile time, provides better IDE support, and makes codebases more maintainable as teams grow. This article explores the TypeScript ecosystem, popular frameworks like React and NestJS, and local success stories from companies that have adopted it.', type: 'BLOG', categorySlugs: ['startup-ecosystem'], tagSlugs: ['innovation', 'digital-ethiopia'], imgColor: '3178C6' },
    { title: 'The Future of Digital Payments in Ethiopia', excerpt: 'An analysis of trends shaping the future of digital payments in Ethiopia through 2030.', content: 'Ethiopia\'s digital payments landscape is evolving rapidly. With Telebirr and M-Pesa competing for mobile money dominance, traditional banks launching digital wallets, and the National Bank pushing interoperability standards, the ecosystem is becoming more connected than ever. This article examines key trends: open banking APIs, QR code standardization, cross-border payment integration with the Pan-African Payment and Settlement System, and the role of AI in fraud detection.', type: 'BLOG', categorySlugs: ['fintech', 'digital-banking'], tagSlugs: ['mobile-banking', 'api', 'financial-inclusion'], imgColor: '0D47A1' },
    { title: 'How to Optimize PostgreSQL Performance for Fintech Apps', excerpt: 'Database tuning tips for high-transaction fintech applications.', content: 'Fintech applications demand high database performance for transaction processing, account balance queries, and real-time reporting. This post covers PostgreSQL optimization techniques including index strategies for high-write workloads, connection pooling with PgBouncer, partitioning large tables by time, query optimization with EXPLAIN ANALYZE, and caching layers with Redis. Real-world benchmarks from Ethiopian fintech deployments are included.', type: 'BLOG', categorySlugs: ['fintech'], tagSlugs: ['api', 'cloud-computing', 'innovation'], imgColor: '336791' },
    { title: 'Designing Mobile Apps for Low-Bandwidth Environments', excerpt: 'Best practices for building apps that work well on Ethiopia\'s mobile networks.', content: 'While Ethiopia\'s internet infrastructure is improving, many users still experience slow and intermittent connectivity. This article covers offline-first architecture patterns, local data storage with SQLite/WatermelonDB, optimistic UI updates, efficient data synchronization strategies, and compression techniques. Case studies from apps successfully deployed in rural Ethiopia demonstrate these principles in practice.', type: 'BLOG', categorySlugs: ['startup-ecosystem', 'mobile-money'], tagSlugs: ['innovation', 'mobile-banking', 'digital-ethiopia'], imgColor: '00695C' },
    { title: 'Understanding Ethiopia\'s New Data Protection Regulations', excerpt: 'A comprehensive overview of the new data protection law and its impact on tech companies.', content: 'Ethiopia\'s recently passed data protection law introduces new requirements for companies handling personal data. This includes mandatory data breach notification, consent requirements for data processing, cross-border data transfer restrictions, and hefty fines for non-compliance. Tech companies operating in Ethiopia need to understand these regulations to avoid penalties and build user trust. This guide breaks down the key provisions and provides a compliance roadmap.', type: 'BLOG', categorySlugs: ['tech-policy'], tagSlugs: ['cyber-security', 'digital-ethiopia'], imgColor: '4A148C' },

    // --- Additional NEWS posts for pagination ---
    { title: 'MOTI Engineering Named Best Fintech Solutions Provider 2026', excerpt: 'The company receives top honors at the Ethiopia Digital Finance Summit for its innovative payment solutions.', content: 'MOTI Engineering has been awarded the "Best Fintech Solutions Provider" at the 2026 Ethiopia Digital Finance Summit. The award recognizes the company\'s work in developing cutting-edge payment infrastructure, digital banking platforms, and mobile money solutions for Ethiopian financial institutions. CEO Biruk Tadesse accepted the award, highlighting the team\'s commitment to driving financial inclusion through technology.', type: 'NEWS', categorySlugs: ['fintech', 'digital-banking'], tagSlugs: ['innovation', 'digital-ethiopia', 'mobile-banking'], imgColor: '1B5E20' },
    { title: 'MOTI Engineering Opens New Office in Addis Ababa', excerpt: 'The expansion supports growing client base and creates 50 new tech jobs.', content: 'MOTI Engineering has opened a new state-of-the-art office in the Bole district of Addis Ababa. The 2,000 square meter facility includes modern workspaces, a dedicated innovation lab, and training centers. The expansion will create 50 new jobs for software engineers, UI/UX designers, and project managers. The company cited increasing demand for digital transformation services from both private and public sector clients as the primary driver for expansion.', type: 'NEWS', categorySlugs: ['startup-ecosystem'], tagSlugs: ['innovation', 'digital-ethiopia'], imgColor: 'E65100' },
    { title: 'National Bank of Ethiopia Approves New Digital Payment Standards', excerpt: 'New interoperability standards require all payment providers to support common QR code format by end of 2026.', content: 'The National Bank of Ethiopia has announced new digital payment interoperability standards that will require all licensed payment providers to support a common QR code format and transaction routing protocol. The standards, developed in consultation with banks, mobile money operators, and fintech companies, aim to create a seamless payment experience where any user can send money to any other user regardless of platform. Compliance is mandatory by December 2026.', type: 'NEWS', categorySlugs: ['tech-policy', 'digital-banking', 'fintech'], tagSlugs: ['digital-ethiopia', 'financial-inclusion', 'mobile-banking'], imgColor: '0D47A1' },
    { title: 'Ethiopian Startup Ecosystem Receives $50M VC Funding Boost', excerpt: 'A new venture capital fund focused on Ethiopian tech startups launches with major international backing.', content: 'A new venture capital fund, Ethiopia Tech Ventures, has launched with $50 million in committed capital from international investors including IFC, several European development finance institutions, and diaspora investors. The fund will focus on early-stage Ethiopian tech startups in fintech, agritech, healthtech, and edtech sectors. This represents one of the largest VC commitments to Ethiopia\'s startup ecosystem and signals growing international confidence in the country\'s tech talent.', type: 'NEWS', categorySlugs: ['startup-ecosystem', 'fintech'], tagSlugs: ['innovation', 'digital-ethiopia'], imgColor: '2E7D32' },
    { title: 'Ethiopia and Kenya Sign Cross-Border Mobile Money Agreement', excerpt: 'The agreement enables instant money transfers between Telebirr and M-Pesa users in both countries.', content: 'Ethiopia and Kenya have signed a landmark agreement enabling cross-border mobile money transfers between Ethio Telecom\'s Telebirr and Safaricom\'s M-Pesa. The agreement, facilitated by the African Continental Free Trade Area, will allow users in both countries to send and receive money instantly using their mobile wallets. This is expected to boost trade, support diaspora remittances, and strengthen economic integration between East Africa\'s two largest economies.', type: 'NEWS', categorySlugs: ['mobile-money', 'fintech'], tagSlugs: ['telebirr', 'financial-inclusion', 'mobile-banking'], imgColor: '1565C0' },
    { title: 'Ethio Telecom Launches 5G Trial in Addis Ababa', excerpt: 'The pilot program covers select neighborhoods with ultra-fast mobile internet speeds.', content: 'Ethio Telecom has launched a 5G network trial in select neighborhoods of Addis Ababa, offering speeds up to 1 Gbps. The trial covers Bole, Kazanchis, and the Mexico Square areas, with plans to expand to 10 additional cities by 2027. The 5G network is expected to enable new use cases including IoT applications, smart city services, and enhanced mobile broadband. The company is working with Huawei and Ericsson on the infrastructure deployment.', type: 'NEWS', categorySlugs: ['tech-policy'], tagSlugs: ['digital-ethiopia', 'innovation', 'cloud-computing'], imgColor: '00838F' },
  ];

  for (const post of blogPosts) {
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 80);
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    if (existing) {
      console.log('  EXISTS:', post.title);
      continue;
    }
    const categoryIds = post.categorySlugs.map((s) => blogCatMap.get(s).id);
    const tagIds = post.tagSlugs.map((s) => tagMap.get(s).id);
    const encoded = encodeURIComponent(post.title.substring(0, 30));
    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug,
        excerpt: post.excerpt,
        content: post.content,
        status: 'ACTIVE',
        type: post.type ?? 'BLOG',
        imageUrl: `https://placehold.co/600x400/${post.imgColor}/white?text=${encoded}`,
        categories: { create: categoryIds.map((id) => ({ categoryId: id })) },
        tags: { create: tagIds.map((id) => ({ tagId: id })) },
      },
    });
    console.log('  CREATED:', post.title);
  }

  console.log('\n--- Seeding Departments ---');
  const departments = [
    { name: 'Software Engineering', slug: 'software-engineering', description: 'Core software development and architecture team' },
    { name: 'Product Management', slug: 'product-management', description: 'Product strategy, roadmapping, and customer discovery' },
    { name: 'Sales & Marketing', slug: 'sales-marketing', description: 'Business development, digital marketing, and sales operations' },
    { name: 'Customer Support', slug: 'customer-support', description: 'Technical support, client onboarding, and customer success' },
    { name: 'Finance & Operations', slug: 'finance-operations', description: 'Finance, HR, legal, and internal operations' },
  ];

  const deptMap = new Map();
  for (const dept of departments) {
    const existing = await prisma.department.findUnique({ where: { slug: dept.slug } });
    if (existing) {
      deptMap.set(dept.slug, existing);
      console.log('  EXISTS:', dept.name);
    } else {
      const created = await prisma.department.create({ data: dept });
      deptMap.set(dept.slug, created);
      console.log('  CREATED:', dept.name);
    }
  }

  console.log('\n--- Seeding Team Members ---');
  const teamMembers = [
    { name: 'Dawit Tesfaye', position: 'Senior Backend Developer', bio: 'Full-stack engineer with 8 years experience building fintech platforms. Previously at Dashen Bank.', order: 1 },
    { name: 'Selamawit Girma', position: 'Frontend Developer', bio: 'React and TypeScript specialist focused on accessible, responsive web applications for Ethiopian users.', order: 2 },
    { name: 'Mulugeta Alemu', position: 'Mobile Developer (Flutter)', bio: 'Flutter expert building cross-platform mobile banking apps with offline-first architecture.', order: 3 },
    { name: 'Tigist Abera', position: 'DevOps Engineer', bio: 'Cloud infrastructure specialist managing CI/CD pipelines and AWS deployments.', order: 4 },
    { name: 'Biruk Tadesse', position: 'Product Manager', bio: 'Drives product strategy for digital banking solutions with deep knowledge of Ethiopian financial sector.', order: 1 },
    { name: 'Rahel Endale', position: 'UI/UX Designer', bio: 'Creates intuitive bilingual interfaces (Amharic/English) for digital banking and ERP products.', order: 2 },
    { name: 'Yohannes Kebede', position: 'Sales Director', bio: '15 years of enterprise sales experience, connecting Ethiopian banks and telecoms with technology solutions.', order: 1 },
    { name: 'Mekdes Worku', position: 'Digital Marketing Manager', bio: 'SEO and social media strategist driving brand visibility for Ethiopian tech products.', order: 2 },
    { name: 'Natnael Bekele', position: 'Customer Support Lead', bio: 'Manages 24/7 support operations ensuring client satisfaction and rapid issue resolution.', order: 1 },
    { name: 'Hanna Tekle', position: 'Technical Support Specialist', bio: 'Handles API integration support and client onboarding for banking and fintech clients.', order: 2 },
    { name: 'Ermias Assefa', position: 'Finance Manager', bio: 'Oversees financial operations, budgeting, and compliance for the organization.', order: 1 },
    { name: 'Betelhem Tadesse', position: 'HR Coordinator', bio: 'Manages recruitment, onboarding, and employee engagement programs.', order: 2 },
  ];

  const departmentAssignments = [
    'software-engineering', 'software-engineering', 'software-engineering', 'software-engineering',
    'product-management', 'product-management',
    'sales-marketing', 'sales-marketing',
    'customer-support', 'customer-support',
    'finance-operations', 'finance-operations',
  ];

  for (let i = 0; i < teamMembers.length; i++) {
    const member = teamMembers[i];
    const dept = deptMap.get(departmentAssignments[i]);
    const slug = member.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await prisma.teamMember.findFirst({
      where: { name: member.name, departmentId: dept.id },
    });
    if (existing) {
      console.log('  EXISTS:', member.name, '-', member.position);
    } else {
      const encoded = encodeURIComponent(member.name);
      await prisma.teamMember.create({
        data: {
          name: member.name,
          position: member.position,
          departmentId: dept.id,
          bio: member.bio,
          order: member.order,
          status: 'ACTIVE',
          imageUrl: `https://placehold.co/300x300/1B5E20/white?text=${encoded}`,
        },
      });
      console.log('  CREATED:', member.name, '-', member.position);
    }
  }

  console.log('\n--- Seeding Careers ---');
  const careers = [
    { title: 'Senior NestJS Backend Developer', type: 'FULL_TIME', description: 'Design and build scalable backend services using NestJS, Prisma, and PostgreSQL for our fintech products.', requirements: '5+ years backend development, NestJS expertise, PostgreSQL, TypeScript, RESTful API design', location: 'Addis Ababa, Ethiopia', salary: 'Competitive' },
    { title: 'Frontend Developer (React)', type: 'FULL_TIME', description: 'Build responsive web applications for digital banking platforms using React, TypeScript, and Tailwind CSS.', requirements: '3+ years React, TypeScript, state management, responsive design', location: 'Addis Ababa, Ethiopia', salary: 'Competitive' },
    { title: 'DevOps Engineer', type: 'CONTRACT', description: 'Set up and maintain CI/CD pipelines, cloud infrastructure, and monitoring for our SaaS platform.', requirements: '3+ years DevOps, AWS, Docker, Kubernetes, Terraform', location: 'Remote', salary: 'Negotiable' },
    { title: 'Product Manager', type: 'FULL_TIME', description: 'Drive product strategy for our digital banking solutions, working closely with Ethiopian banks and fintechs.', requirements: '5+ years product management, fintech experience preferred, data-driven mindset', location: 'Addis Ababa, Ethiopia', salary: 'Competitive' },
    { title: 'Customer Support Specialist', type: 'FULL_TIME', description: 'Provide technical support and onboarding for our banking and fintech clients across Ethiopia.', requirements: '2+ years technical support, excellent communication in Amharic and English, IT background', location: 'Addis Ababa, Ethiopia', salary: 'Negotiable' },
    { title: 'Mobile Developer (Flutter)', type: 'REMOTE', description: 'Build cross-platform mobile banking apps using Flutter with offline-first architecture for Ethiopian users.', requirements: '3+ years Flutter/Dart, state management, offline-first patterns, mobile security', location: 'Remote', salary: 'Competitive' },
    { title: 'QA Automation Engineer', type: 'PART_TIME', description: 'Design and implement automated test suites for our banking APIs and web applications.', requirements: '3+ years QA, Selenium/Cypress, API testing, CI/CD integration', location: 'Addis Ababa, Ethiopia', salary: 'Negotiable' },
  ];

  const careerMap = new Map();
  for (let i = 0; i < careers.length; i++) {
    const career = careers[i];
    const slug = career.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await prisma.career.findUnique({ where: { slug } });
    if (existing) {
      careerMap.set(slug, existing);
      console.log('  EXISTS:', career.title);
    } else {
      const deptSlugs = ['software-engineering', 'software-engineering', 'software-engineering', 'product-management', 'customer-support', 'software-engineering', 'software-engineering'];
      const dept = deptMap.get(deptSlugs[i]);
      const created = await prisma.career.create({
        data: {
          title: career.title, slug, type: career.type, departmentId: dept.id,
          description: career.description, requirements: career.requirements,
          location: career.location, salary: career.salary, status: 'ACTIVE',
        },
      });
      careerMap.set(slug, created);
      console.log('  CREATED:', career.title);
    }
  }

  console.log('\n--- Seeding Applications ---');
  const applications = [
    { fullName: 'Abebe Kebede', email: 'abebe.k@gmail.com', phoneNumber: '+251911234567', coverLetter: 'I have 6 years of NestJS experience building fintech platforms at Kifiya and Dashen Bank. I am excited about the opportunity to contribute to your digital banking products.', careerSlug: 'senior-nestjs-backend-developer' },
    { fullName: 'Sara Tadesse', email: 'sara.t@outlook.com', phoneNumber: '+251923456789', coverLetter: 'With a strong background in React and TypeScript, I have built several enterprise dashboards and customer-facing applications. I am passionate about creating great user experiences for Ethiopian users.', careerSlug: 'frontend-developer-react' },
    { fullName: 'Daniel Yohannes', email: 'daniel.y@gmail.com', coverLetter: 'As a DevOps engineer with experience at Ethio Telecom, I specialize in cloud migration and CI/CD pipeline optimization. I am looking for challenging remote opportunities.', careerSlug: 'devops-engineer' },
    { fullName: 'Meron Haile', email: 'meron.haile@email.com', phoneNumber: '+251934567890', coverLetter: 'Having worked as a product manager for mobile banking products, I have deep understanding of the Ethiopian financial sector and user needs.', careerSlug: 'product-manager' },
    { fullName: 'Bereket Assefa', email: 'beki.a@yahoo.com', coverLetter: 'I have 3 years of Flutter experience and have built two mobile banking apps currently in production. I am excited about remote opportunities building apps for Ethiopian users.', careerSlug: 'mobile-developer-flutter' },
  ];

  for (const app of applications) {
    const career = careerMap.get(app.careerSlug);
    if (!career) continue;
    const existing = await prisma.application.findFirst({
      where: { email: app.email, careerId: career.id },
    });
    if (existing) {
      console.log('  EXISTS:', app.fullName, '-', career.title);
      continue;
    }
    await prisma.application.create({
      data: {
        fullName: app.fullName, email: app.email, phoneNumber: app.phoneNumber,
        coverLetter: app.coverLetter, careerId: career.id,
        cvUrl: `https://placehold.co/100x140/37474F/white?text=${encodeURIComponent(app.fullName.replace(' ', '+'))}`,
        status: 'NEW',
      },
    });
    console.log('  CREATED:', app.fullName, '-', career.title);
  }

  console.log('\n--- Seeding Contact Messages ---');
  const contactMessages = [
    { fullName: 'Tsegaye Wolde', email: 'tsegaye@company.et', phoneNumber: '+251955112233', companyName: 'Dashen Bank', subject: 'PRODUCT_QUOTE', message: 'We are interested in your Digital Banking Solutions and would like to request a detailed quote and product demo for our bank.' },
    { fullName: 'Hiwot Getachew', email: 'hiwot.g@gmail.com', subject: 'PARTNERSHIP', message: 'I represent a fintech startup in Addis Ababa and we would like to explore partnership opportunities with your organization for a mobile wallet integration.' },
    { fullName: 'Yonas Tadesse', email: 'yonas@ethiotelecom.et', phoneNumber: '+251966778899', companyName: 'Ethio Telecom', subject: 'TECHNICAL_SUPPORT', message: 'We are experiencing integration issues with the Telebirr API and need urgent technical support to resolve transaction failures on our platform.' },
    { fullName: 'Mahlet Bekele', email: 'mahlet.b@gmail.com', subject: 'CAREER_OPPORTUNITY', message: 'I have been following your company\'s work in digital banking and would love to learn about current job openings for backend developers with NestJS experience.' },
    { fullName: 'Yared Mekonnen', email: 'yared.m@exportco.et', companyName: 'Ethiopian Coffee Exports PLC', subject: 'COFFEE_EXPORT', message: 'We are a coffee export company looking for digital solutions to manage our supply chain and international client relationships. Would love to discuss.' },
    { fullName: 'Bethlehem Adane', email: 'bethy.a@outlook.com', phoneNumber: '+251944556677', subject: 'GENERAL_INQUIRY', message: 'I recently learned about your company and would like more information about your products and services for small business digital transformation.' },
  ];

  for (const msg of contactMessages) {
    const existing = await prisma.contactMessage.findFirst({
      where: { email: msg.email, subject: msg.subject },
    });
    if (existing) {
      console.log('  EXISTS:', msg.fullName, '-', msg.subject);
      continue;
    }
    await prisma.contactMessage.create({ data: msg });
    console.log('  CREATED:', msg.fullName, '-', msg.subject);
  }

  console.log('\n--- Seeding Testimonials ---');
  const testimonials = [
    { name: 'Dr. Yinager Dessie', company: 'National Bank of Ethiopia', message: 'Moti Technologies has been instrumental in modernizing our digital banking infrastructure. Their solutions are robust, secure, and tailored for the Ethiopian market.', rating: 5 },
    { name: 'Asfaw Alemu', company: 'Dashen Bank', message: 'The ERP and mobile banking platforms delivered by Moti exceeded our expectations. Customer adoption has been remarkable and transaction volumes have tripled.', rating: 5 },
    { name: 'Frehiwot Tamiru', company: 'Ethio Telecom', message: 'Working with Moti on our digital payment integrations was seamless. Their team understands the local ecosystem and delivers on time.', rating: 4 },
    { name: 'Henok Abebe', company: 'Kifiya Financial Technology', message: 'Moti\'s API gateway solution transformed how we connect with banks and mobile money providers. Highly recommended for fintech partnerships.', rating: 5 },
    { name: 'Meseret Tadesse', company: 'Awash Bank', message: 'The cloud migration was handled professionally with zero downtime. Our infrastructure costs have decreased by 40% since the migration.', rating: 4 },
    { name: 'Tewodros Belay', company: 'Ethiopian Airlines', message: 'The booking engine revamp was a game changer for our digital strategy. Moti delivered a world-class product that handles millions of queries monthly.', rating: 5 },
  ];

  for (const t of testimonials) {
    const existing = await prisma.testimonial.findFirst({
      where: { name: t.name, company: t.company },
    });
    if (existing) {
      console.log('  EXISTS:', t.name, '-', t.company);
      continue;
    }
    await prisma.testimonial.create({ data: { ...t, status: 'ACTIVE' } });
    console.log('  CREATED:', t.name, '-', t.company);
  }

  console.log('\n--- Seeding Coffee Types ---');
  const coffeeTypes = [
    { name: 'Yirgacheffe Premium', origin: 'Yirgacheffe, Gedeo Zone', grade: 'Grade 1', description: 'Bright acidity with floral and citrus notes. Washed processing produces a clean, complex cup with jasmine aroma and lemon zest finish.' },
    { name: 'Sidamo Single Origin', origin: 'Sidamo, Southern Nations', grade: 'Grade 2', description: 'Medium-bodied with wine-like acidity. Notes of blueberry, dark chocolate, and spice. Sundried natural processing for rich berry flavors.' },
    { name: 'Harrar Wild', origin: 'Harrar, Eastern Ethiopia', grade: 'Grade 1', description: 'Full-bodied with intense blueberry and mocha notes. Dry-processed under the Ethiopian sun for a bold, fruity cup with low acidity.' },
    { name: 'Limu Washed', origin: 'Limu, Oromia Region', grade: 'Grade 2', description: 'Well-balanced with medium body and winy acidity. Floral aroma with hints of spice and cocoa. Perfect for espresso blends.' },
    { name: 'Jimma Forest', origin: 'Jimma, Oromia Region', grade: 'Grade 3', description: 'Earthy and full-bodied with low acidity. Notes of dark chocolate and tobacco. Excellent base for traditional Ethiopian coffee ceremony blends.' },
    { name: 'Lekempti Bold', origin: 'Lekempti, Wollega', grade: 'Grade 2', description: 'Smooth with medium acidity and fruity undertones. Notes of stone fruit and caramel. Grown at altitudes of 1,500-1,800 meters.' },
    { name: 'Bebeka Estate', origin: 'Bebeka, Bench Maji', grade: 'Grade 1', description: 'One of Ethiopia\'s largest coffee plantations. Light-bodied with delicate floral notes and honey sweetness. Rainforest Alliance certified.' },
    { name: 'Tepi Plantation', origin: 'Tepi, Sheka Zone', grade: 'Grade 2', description: 'Medium-bodied with balanced acidity and clean finish. Notes of milk chocolate and roasted nuts. Shade-grown under native forest canopy.' },
  ];

  for (const ct of coffeeTypes) {
    const slug = ct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await prisma.coffeeType.findUnique({ where: { slug } });
    if (existing) {
      console.log('  EXISTS:', ct.name);
      continue;
    }
    const encoded = encodeURIComponent(ct.name);
    await prisma.coffeeType.create({
      data: {
        name: ct.name, slug, origin: ct.origin, grade: ct.grade,
        description: ct.description, status: 'ACTIVE',
        imageUrl: `https://placehold.co/600x400/4E342E/white?text=${encoded}`,
      },
    });
    console.log('  CREATED:', ct.name);
  }

  console.log('\n--- Seeding Gallery Categories ---');
  const galleryCategories = [
    { name: 'Events', slug: 'events', description: 'Photos from company events, conferences, and meetups' },
    { name: 'Office Life', slug: 'office-life', description: 'Behind-the-scenes from our offices in Addis Ababa' },
    { name: 'Conferences', slug: 'conferences', description: 'Industry conferences and tech summits across Ethiopia' },
    { name: 'Projects', slug: 'projects', description: 'Project showcases, product launches, and team celebrations' },
    { name: 'Team Activities', slug: 'team-activities', description: 'Team building, outings, and social activities' },
    { name: 'Product Photography', slug: 'product-photography', description: 'Professional product shots and solution mockups' },
    { name: 'Training & Workshops', slug: 'training-workshops', description: 'Client training sessions and internal workshops' },
    { name: 'Awards & Recognition', slug: 'awards-recognition', description: 'Industry awards, certifications, and team achievements' },
    { name: 'Office Infrastructure', slug: 'office-infrastructure', description: 'Server rooms, networking gear, and office tech setup' },
    { name: 'Community Outreach', slug: 'community-outreach', description: 'CSR activities, university visits, and community programs' },
    { name: 'Client Visits', slug: 'client-visits', description: 'On-site visits to client offices and project sites' },
    { name: 'Cultural Celebrations', slug: 'cultural-celebrations', description: 'Ethiopian holiday celebrations and cultural events at the office' },
    { name: 'Design & Prototypes', slug: 'design-prototypes', description: 'UI/UX mockups, wireframes, and design prototypes' },
    { name: 'Behind the Scenes', slug: 'behind-the-scenes', description: 'Development process, standups, and candid office moments' },
    { name: 'Travel & Site Visits', slug: 'travel-site-visits', description: 'Travel photos from project sites and field deployments across Ethiopia' },
  ];

  const galleryCatMap = new Map();
  for (const cat of galleryCategories) {
    const existing = await prisma.galleryCategory.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      galleryCatMap.set(cat.slug, existing);
      console.log('  EXISTS:', cat.name);
    } else {
      const created = await prisma.galleryCategory.create({ data: cat });
      galleryCatMap.set(cat.slug, created);
      console.log('  CREATED:', cat.name);
    }
  }

  console.log('\n--- Seeding Gallery Images ---');
  const galleryImages = [
    { title: 'Annual Tech Conference 2026 Keynote', categorySlug: 'events', description: 'CEO delivering keynote at the Annual Tech Conference in Addis Ababa', imgUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop' },
    { title: 'Team Hackathon Night', categorySlug: 'events', description: 'Developers collaborating during the 48-hour internal hackathon', imgUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop' },
    { title: 'Partner Meetup 2026', categorySlug: 'events', description: 'Annual partner meetup with clients and industry leaders', imgUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop' },
    { title: 'Addis Office Main Lobby', categorySlug: 'office-life', description: 'Modern office lobby at our Bole headquarters', imgUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop' },
    { title: 'Open Workspace Area', categorySlug: 'office-life', description: 'Collaborative open workspace used by engineering teams', imgUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop' },
    { title: 'Meeting Room with Ethiopian Art', categorySlug: 'office-life', description: 'Meeting room decorated with traditional Ethiopian art', imgUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop' },
    { title: 'Ethiopia Digital Finance Summit 2026', categorySlug: 'conferences', description: 'Moti Engineering exhibiting at the Digital Finance Summit', imgUrl: 'https://images.unsplash.com/photo-1560523159-4a9692d222ef?w=800&h=600&fit=crop' },
    { title: 'East Africa Tech Expo Panel', categorySlug: 'conferences', description: 'Panel discussion on fintech innovation in East Africa', imgUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=600&fit=crop' },
    { title: 'Product Launch Dashboard Reveal', categorySlug: 'projects', description: 'Team celebrating the launch of the new analytics dashboard', imgUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop' },
    { title: 'Project Kickoff Whiteboard Session', categorySlug: 'projects', description: 'Whiteboard brainstorming for a new banking client project', imgUrl: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=800&h=600&fit=crop' },
    { title: 'Team Building at Entoto Park', categorySlug: 'team-activities', description: 'Annual team building day trip to Entoto Natural Park', imgUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop' },
    { title: 'Friday Lunch Together', categorySlug: 'team-activities', description: 'Weekly team lunch celebrating Ethiopian cuisine', imgUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop' },
  ];

  for (const img of galleryImages) {
    const slug = img.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 60);
    const existing = await prisma.galleryImage.findFirst({
      where: { slug, categoryId: galleryCatMap.get(img.categorySlug).id },
    });
    if (existing) {
      console.log('  EXISTS:', img.title);
      continue;
    }
    const category = galleryCatMap.get(img.categorySlug);
    await prisma.galleryImage.create({
      data: {
        title: img.title,
        slug: `${slug}-${Date.now()}`,
        imageUrl: img.imgUrl,
        description: img.description,
        categoryId: category.id,
        status: 'ACTIVE',
      },
    });
    console.log('  CREATED:', img.title);
  }

  console.log('\n--- Seed Complete ---');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
