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
    { name: 'Ethio Telecom', slug: 'ethio-telecom', type: 'CLIENT', description: 'Leading telecommunications provider in Ethiopia', website: 'https://www.ethiotelecom.et' },
    { name: 'Dashen Bank', slug: 'dashen-bank', type: 'CLIENT', description: 'One of the largest private banks in Ethiopia', website: 'https://www.dashenbanksc.com' },
    { name: 'Ethiopian Airlines', slug: 'ethiopian-airlines', type: 'CLIENT', description: 'The flag carrier of Ethiopia and Africa\'s largest airline', website: 'https://www.ethiopianairlines.com' },
    { name: 'Awash Bank', slug: 'awash-bank', type: 'PARTNER', description: 'Leading private commercial bank established in 1994', website: 'https://www.awashbank.com' },
    { name: 'Kifiya Financial Technology', slug: 'kifiya-fintech', type: 'PARTNER', description: 'Financial technology company providing digital payment solutions', website: 'https://www.kifiya.com' },
  ];

  const orgMap = new Map();
  for (const org of organizations) {
    const existing = await prisma.organization.findUnique({ where: { slug: org.slug } });
    if (existing) {
      orgMap.set(org.slug, existing);
      console.log('  EXISTS:', org.name);
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
    { title: 'Telecom Customer Portal', slug: 'telecom-customer-portal', description: 'Self-service customer portal for Ethio Telecom with bill payment, usage tracking, and support ticketing.', categorySlug: 'website-development', clientSlug: 'ethio-telecom', imgColor: 'E65100' },
    { title: 'Dashen Mobile Banking App', slug: 'dashen-mobile-banking', description: 'Complete mobile banking experience with account management, transfers, bill payments, and Amole integration.', categorySlug: 'mobile-app-development', clientSlug: 'dashen-bank', imgColor: '1565C0' },
    { title: 'Ethiopian Airlines Booking Engine', slug: 'airlines-booking-engine', description: 'Next-generation flight booking platform with multi-city search, seat selection, and ShebaMiles integration.', categorySlug: 'website-development', clientSlug: 'ethiopian-airlines', imgColor: '6A1B9A' },
    { title: 'Awash Digital Wallet', slug: 'awash-digital-wallet', description: 'Mobile wallet app for Awash Bank customers with QR payments, airtime purchase, and peer-to-peer transfers.', categorySlug: 'mobile-app-development', clientSlug: 'awash-bank', imgColor: '2E7D32' },
    { title: 'Kifiya Payment Gateway Integration', slug: 'kifiya-payment-gateway', description: 'API-based payment gateway integration connecting Kifiya with major Ethiopian banks and mobile money providers.', categorySlug: 'it-consulting', clientSlug: 'kifiya-fintech', imgColor: '00838F' },
    { title: 'Ethio Telecom Cloud Migration', slug: 'ethio-telecom-cloud-migration', description: 'Large-scale cloud infrastructure migration from on-premise data centers to hybrid cloud architecture.', categorySlug: 'cloud-infrastructure', clientSlug: 'ethio-telecom', imgColor: '37474F' },
    { title: 'Dashen Bank SEO Campaign', slug: 'dashen-seo-campaign', description: 'Comprehensive SEO and digital marketing campaign to increase online visibility for Dashen Bank products.', categorySlug: 'digital-marketing', clientSlug: 'dashen-bank', imgColor: 'EF6C00' },
    { title: 'Airlines Crew Management App', slug: 'airlines-crew-app', description: 'Internal mobile app for Ethiopian Airlines crew scheduling, roster management, and flight briefings.', categorySlug: 'mobile-app-development', clientSlug: 'ethiopian-airlines', imgColor: '7B1FA2' },
    { title: 'Awash Bank Corporate Portal', slug: 'awash-corporate-portal', description: 'Corporate banking portal with bulk payments, payroll processing, trade finance, and forex management.', categorySlug: 'website-development', clientSlug: 'awash-bank', imgColor: '388E3C' },
    { title: 'Kifiya DevOps Pipeline Setup', slug: 'kifiya-devops-pipeline', description: 'End-to-end CI/CD pipeline setup with automated testing, containerization, and monitoring for Kifiya products.', categorySlug: 'cloud-infrastructure', clientSlug: 'kifiya-fintech', imgColor: '546E7A' },
  ];

  for (const proj of projects) {
    const existing = await prisma.project.findUnique({ where: { slug: proj.slug } });
    if (existing) {
      console.log('  EXISTS:', proj.title);
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
    const encoded = encodeURIComponent(proj.title);
    await prisma.projectImage.create({
      data: {
        imageUrl: `https://placehold.co/600x400/${proj.imgColor}/white?text=${encoded}`,
        projectId: project.id,
      },
    });
    console.log('  CREATED:', proj.title);
  }

  console.log('\n--- Seed Complete ---');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
