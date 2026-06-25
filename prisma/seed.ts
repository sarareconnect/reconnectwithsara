import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SUPER_ADMIN_EMAIL ?? "admin@sara.app").toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD ?? "ChangeThisStrongPassword!1";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, name: "Super Admin" },
    create: {
      email,
      name: "Super Admin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log(`✔ Super admin ready: ${admin.email}`);
  console.log("  Sign in with the credentials from your environment variables.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
