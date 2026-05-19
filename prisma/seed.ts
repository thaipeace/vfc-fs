import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Seed Crops ---
  const cropList = [
    "01.Cây Lúa 95-100",
    "02.Cây Lúa Nhật DS1",
    "03.Cây Lúa Nếp",
    "04.Cây cà phê",
    "05.Cây Sầu Riêng",
    "06.Cây Sầu riêng tơ",
    "07.Cây Xoài",
    "08.Cây Xoài ĐL",
    "09.Cây Rau ăn lá",
    "10.Cây Rau ăn củ",
    "11.Cây Rau ăn trái",
    "12.Cây Cà chua",
    "13.Cây dưa hấu",
    "14.Cây hoa cúc",
    "Cây Bắp cải",
    "Cây Cam",
    "Cây Chanh",
    "Cây Chuối",
    "Cây có múi",
    "Cây Đậu",
    "Cây Dâu tây",
    "Cây Điều",
    "Cây Dứa",
    "Cây hành",
    "Cây Hồ Tiêu",
    "Cây khoai tây",
    "Cây Mận",
    "Cây Nhãn",
    "Cây Nho",
    "Cây ớt",
    "Cây Quýt",
    "Cây Táo",
    "Cây Thanh long",
    "Cây Vải"
  ];

  // Clean existing crops if necessary or just upsert
  // The user wants these specific ones, so we might want to clear old ones to match the list exactly
  // await prisma.crop.deleteMany({}); 

  for (const item of cropList) {
    let name = item;
    let sortOrder = 999;
    
    const match = item.match(/^(\d+)\.(.+)$/);
    if (match) {
      sortOrder = parseInt(match[1]);
      name = match[2];
    }

    const cropCode = name.toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '_');

    await prisma.crop.upsert({
      where: { cropCode },
      update: { name, sortOrder },
      create: {
        cropCode,
        name,
        sortOrder,
        isActive: true,
      },
    });
  }

  console.log('Seeded crops successfully');

  // --- Seed Product Details from CSV ---
  const csvFilePath = path.join(process.cwd(), 'document', 'Product details.csv');
  if (fs.existsSync(csvFilePath)) {
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as any[];

    console.log(`Found ${records.length} records in CSV for products.`);

    for (const record of records) {
      const name = record['Name'];
      const plantCrops = record['Plant crops'];
      const type = record['Type'];
      const ingredients = record['Ingredients'];
      const targetDiseases = record['Target Diseases/Nutrient'];
      const usageInstruction = record['Usage Instruction'];
      const description = record['Description'];

      if (!name) continue;

      let product = await prisma.product.findFirst({
        where: { name: { contains: name, mode: 'insensitive' } },
      });

      if (!product) {
        console.log(`Product "${name}" not found, creating skeleton product...`);
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let finalSlug = slug;
        let counter = 1;
        while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
          finalSlug = `${slug}-${counter}`;
          counter++;
        }

        product = await prisma.product.create({
          data: {
            name,
            sku: `SKU-${finalSlug.toUpperCase()}`,
            slug: finalSlug,
            price: 0,
            isActive: true,
          },
        });
      }

      await prisma.productDetail.upsert({
        where: { productId: product.id },
        update: {
          name,
          plantCrops,
          type,
          ingredients,
          targetDiseases,
          usageInstruction,
          description,
        },
        create: {
          productId: product.id,
          name,
          plantCrops,
          type,
          ingredients,
          targetDiseases,
          usageInstruction,
          description,
        },
      });
    }
    console.log('Seeded product details successfully');
  } else {
    console.warn(`CSV file not found at ${csvFilePath}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
