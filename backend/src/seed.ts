import bcrypt from "bcryptjs";
import { one, run } from "./db.js";

export function seedIfEmpty() {
  // Admin user (for inventory CRUD)
  const usersCount = one<{ cnt: number }>("SELECT COUNT(*) as cnt FROM users");
  if ((usersCount?.cnt ?? 0) === 0) {
    const adminHash = bcrypt.hashSync("admin12345", 10);
    run("INSERT INTO users(login, password_hash, role) VALUES (?, ?, 'ADMIN')", ["admin", adminHash]);
  }

  // Seed catalog only if empty
  const c = one<{ cnt: number }>("SELECT COUNT(*) as cnt FROM categories");
  const p = one<{ cnt: number }>("SELECT COUNT(*) as cnt FROM products");
  if ((c?.cnt ?? 0) > 0 || (p?.cnt ?? 0) > 0) return;

  const categories = [
    { name: "Whey Protein", type: "Protein", color: "#ef4444", isActive: 1, description: "Whey isolates and blends for recovery." },
    { name: "Creatine", type: "Performance", color: "#f97316", isActive: 1, description: "Strength & power support (monohydrate, etc.)." },
    { name: "Pre-Workout", type: "Energy", color: "#a855f7", isActive: 1, description: "Focus + pump formulas for training sessions." },
    { name: "Vitamins", type: "Health", color: "#22c55e", isActive: 1, description: "Daily essentials for active lifestyle." },
    { name: "Amino Acids", type: "Recovery", color: "#eab308", isActive: 1, description: "BCAA / EAA for training support." },
    { name: "Accessories", type: "Gear", color: "#64748b", isActive: 1, description: "Shakers and small gym gear." },
    { name: "Health", type: "Wellness", color: "#0ea5e9", isActive: 1, description: "Omega-3, joint support and more." },
    { name: "Gainers", type: "Mass", color: "#14b8a6", isActive: 1, description: "High-calorie blends to support bulking." },
    { name: "Hidden", type: "System", color: "#334155", isActive: 0, description: "Not visible on public page." },
  ];

  for (const x of categories) {
    run(
      "INSERT INTO categories(name, type, description, color, is_active) VALUES (?, ?, ?, ?, ?)",
      [x.name, x.type, x.description, x.color, x.isActive]
    );
  }

  const catId = (name: string) =>
    one<{ id: number }>("SELECT id FROM categories WHERE name = ?", [name])!.id;

  // NOTE: image_url points to LOCAL SVG files inside frontend/public/ironfuel/*
  // so images work even without external internet access.
  const products = [
    {
      name: "IronFuel Whey 2kg (Vanilla)",
      price_cents: 7499,
      description: "25g protein/serving. Mixes smooth. Great post-workout.",
      category: "Whey Protein",
      stock: 18,
      image_url: "/ironfuel/whey.svg",
    },
    {
      name: "Creatine Monohydrate 500g",
      price_cents: 3999,
      description: "Micronized creatine. 5g daily. Supports strength & power.",
      category: "Creatine",
      stock: 30,
      image_url: "/ironfuel/creatine.svg",
    },
    {
      name: "Pre-Workout Focus+ (30 servings)",
      price_cents: 4599,
      description: "Caffeine + citrulline. Energy, focus and pump.",
      category: "Pre-Workout",
      stock: 12,
      image_url: "/ironfuel/preworkout.svg",
    },
    {
      name: "Multivitamin Daily (60 caps)",
      price_cents: 2299,
      description: "Core vitamins/minerals for active lifestyle.",
      category: "Vitamins",
      stock: 40,
      image_url: "/ironfuel/multivitamin.svg",
    },
    {
      name: "Omega-3 Triple Strength (90 softgels)",
      price_cents: 2799,
      description: "EPA/DHA support for heart, joints and recovery.",
      category: "Health",
      stock: 22,
      image_url: "/ironfuel/omega3.svg",
    },
    {
      name: "BCAA 2:1:1 (30 servings, Lemon)",
      price_cents: 2499,
      description: "Classic 2:1:1 BCAA blend. Great during training.",
      category: "Amino Acids",
      stock: 26,
      image_url: "/ironfuel/bcaa.svg",
    },
    {
      name: "Shaker Bottle 700ml (BPA-free)",
      price_cents: 999,
      description: "Leak-proof shaker with steel mixing ball.",
      category: "Accessories",
      stock: 60,
      image_url: "/ironfuel/shaker.svg",
    },
    {
      name: "Mass Gainer 3kg (Chocolate)",
      price_cents: 8999,
      description: "High-calorie blend to support bulking and weight gain.",
      category: "Gainers",
      stock: 9,
      image_url: "/ironfuel/massgainer.svg",
    },
  ];

  for (const it of products) {
    run(
      "INSERT INTO products(name, price_cents, description, category_id, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [it.name, it.price_cents, it.description, catId(it.category), it.stock, it.image_url]
    );
  }

  console.log("💪 Seeded IronFuel demo catalog (local images). Admin: admin / admin12345");
}
