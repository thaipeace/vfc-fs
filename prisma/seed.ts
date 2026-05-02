import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
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
