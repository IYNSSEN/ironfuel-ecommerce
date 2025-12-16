export type User = { id: number; login: string; role: "USER" | "ADMIN" };

export type Category = {
  id: number;
  name: string;
  type: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
};

export type Product = {
  id: number;
  name: string;
  priceCents: number;
  description: string;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  stock: number;
  imageUrl: string;
  createdAt: string;
};
