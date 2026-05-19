import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { prisma } from '../src/lib/prisma';


async function main() {
  const csvFilePath = path.join(process.cwd(), 'document', 'Products.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

  // Parse CSV
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`Found ${records.length} records in Products.csv`);

  let updatedCount = 0;

  for (const record of records) {
    const name = record['Product'];
    const priceStr = record['Price'];

    if (!name || !priceStr) continue;

    // Convert price string format (e.g., "1.263.889" -> 1263889)
    const priceValue = parseFloat(priceStr.replace(/\./g, ''));

    if (isNaN(priceValue)) {
      console.log(`Skipping invalid price for ${name}: ${priceStr}`);
      continue;
    }

    // Find the product by name (case-insensitive)
    const product = await prisma.product.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { price: priceValue },
      });
      console.log(`Updated price for ${product.name}: ${priceValue}`);
      updatedCount++;
    } else {
      console.log(`Product not found in DB: ${name}`);
    }
  }

  console.log(`\nSuccessfully updated prices for ${updatedCount} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
