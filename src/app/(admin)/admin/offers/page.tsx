import { AdminOffers } from "@/components/pages/admin/AdminOffers";
import { requireAdminPage } from "@/server/auth/current-user";
import * as categoryService from "@/server/services/category.service";
import * as offerService from "@/server/services/offer.service";
import * as productService from "@/server/services/product.service";

export const metadata = { title: "Offers & Discounts | GoalNet Admin" };

export default async function Page() {
  await requireAdminPage();
  const [offers, categories, products] = await Promise.all([
    offerService.listOffers(),
    categoryService.listCategories(),
    productService.listProducts({ page: 1, limit: 1000, q: "", category: "", status: "active" }),
  ]);
  return <AdminOffers categories={categories} offers={offers} products={products.items} />;
}
