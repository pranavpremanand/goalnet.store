import { Types } from "mongoose";
import { CART_TTL_MS, MAX_CART_LINE_QUANTITY, MAX_CART_LINES } from "@/lib/cart-constants";
import type { CartProduct } from "@/lib/types/storefront";
import { BadRequestError } from "@/server/errors";
import { isDuplicateKeyError } from "@/server/db/errors";
import { connectToDatabase } from "@/server/db/connect";
import { CartModel, type CartItemAttrs } from "@/server/models/cart.model";
import * as categoryRepository from "@/server/repositories/category.repository";
import * as productRepository from "@/server/repositories/product.repository";
import type { CartLineKey } from "@/lib/validation/cart";

export type CartIdentity = { userId?: string; guestTokenHash: string };
export type CartLineResult = CartProduct & { size: string; quantity: number; available: boolean };
export type CartResult = { items: CartLineResult[] };

function copyCartItem(item: CartItemAttrs): CartItemAttrs {
  return {
    productId: item.productId,
    size: item.size,
    quantity: item.quantity,
    slug: item.slug,
    name: item.name,
    image: item.image,
    imageAlt: item.imageAlt,
    price: item.price,
  };
}

function cartItemKey(item: Pick<CartItemAttrs, "productId" | "size">) {
  return `${item.productId.toString().toLowerCase()}:${item.size.trim()}`;
}

function requestedItemKey(key: CartLineKey) {
  return `${key.productId.toLowerCase()}:${key.size.trim()}`;
}

function ownerFilter(identity: CartIdentity) {
  return identity.userId ? { userId: identity.userId } : { guestTokenHash: identity.guestTokenHash };
}

async function findOrCreateCart(identity: CartIdentity) {
  const filter = ownerFilter(identity);
  let cart = await CartModel.findOne(filter);
  if (cart) return cart;

  try {
    cart = await CartModel.create({
      ...filter,
      items: [],
      expiresAt: new Date(Date.now() + CART_TTL_MS),
    });
    return cart;
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
    cart = await CartModel.findOne(filter);
    if (cart) return cart;
    throw error;
  }
}

async function getOwnedCart(identity: CartIdentity) {
  await connectToDatabase();

  if (!identity.userId) return findOrCreateCart(identity);

  const accountCart = await findOrCreateCart(identity);
  const guestCart = await CartModel.findOne({ guestTokenHash: identity.guestTokenHash });
  if (!guestCart || guestCart._id.equals(accountCart._id)) return accountCart;

  const merged = new Map<string, CartItemAttrs>();
  for (const item of accountCart.items) merged.set(cartItemKey(item), copyCartItem(item));
  for (const item of guestCart.items) {
    const key = cartItemKey(item);
    const current = merged.get(key);
    merged.set(key, {
      ...(current ?? copyCartItem(item)),
      quantity: Math.min(MAX_CART_LINE_QUANTITY, (current?.quantity ?? 0) + item.quantity),
    });
  }

  accountCart.set("items", [...merged.values()]);
  accountCart.expiresAt = new Date(Date.now() + CART_TTL_MS);
  await accountCart.save();
  await CartModel.deleteOne({ _id: guestCart._id });
  return accountCart;
}

async function getActiveProducts(productIds: string[]) {
  const categoryIds = (await categoryRepository.listCategories({ activeOnly: true })).map((category) => category.id);
  return productRepository.listActiveProducts({ categoryIds, ids: productIds, limit: Math.max(productIds.length, MAX_CART_LINES) });
}

function lineSnapshot(product: CartProduct, key: CartLineKey, quantity: number): CartItemAttrs {
  return {
    productId: new Types.ObjectId(key.productId),
    size: key.size,
    quantity,
    slug: product.slug,
    name: product.name,
    image: product.image,
    imageAlt: product.imageAlt,
    price: product.price,
  };
}

async function getCartResult(identity: CartIdentity): Promise<CartResult> {
  const cart = await getOwnedCart(identity);
  const products = await getActiveProducts(cart.items.map((item) => item.productId.toString()));
  const productById = new Map(products.map((product) => [product.id, product]));

  return {
    items: cart.items.map((item) => {
      const product = productById.get(item.productId.toString());
      const variant = product?.variants.find((candidate) => candidate.size === item.size);
      return {
        id: product?.id ?? item.productId.toString(),
        slug: product?.slug ?? item.slug,
        name: product?.name ?? item.name,
        image: product?.images[0]?.url ?? item.image,
        imageAlt: product?.images[0]?.alt || item.imageAlt,
        price: product?.price ?? item.price,
        size: item.size,
        quantity: item.quantity,
        available: Boolean(variant && variant.availabilityStatus !== "unavailable"),
      };
    }),
  };
}

async function findAvailableProduct(key: CartLineKey) {
  const [product] = await getActiveProducts([key.productId]);
  if (!product) throw new BadRequestError("This product is no longer available.");
  const variant = product.variants.find((candidate) => candidate.size === key.size);
  if (!variant || variant.availabilityStatus === "unavailable") {
    throw new BadRequestError(`${product.name} in size ${key.size} is no longer available.`);
  }
  const image = product.images[0];
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    image: image?.url ?? "",
    imageAlt: image?.alt || product.name,
    price: product.price,
  } satisfies CartProduct;
}

export async function getCart(identity: CartIdentity) {
  return getCartResult(identity);
}

export async function addCartItem(identity: CartIdentity, key: CartLineKey) {
  const product = await findAvailableProduct(key);
  const cart = await getOwnedCart(identity);
  const itemKey = requestedItemKey(key);
  const existing = cart.items.find((item) => cartItemKey(item) === itemKey);

  if (!existing && cart.items.length >= MAX_CART_LINES) {
    throw new BadRequestError(`Your bag can contain up to ${MAX_CART_LINES} different items.`);
  }
  if (existing && existing.quantity >= MAX_CART_LINE_QUANTITY) {
    throw new BadRequestError(`You can add up to ${MAX_CART_LINE_QUANTITY} of this item.`);
  }

  const items = cart.items.map(copyCartItem);
  if (existing) {
    const line = items.find((item) => cartItemKey(item) === itemKey);
    if (line) Object.assign(line, lineSnapshot(product, key, line.quantity + 1));
  } else {
    items.push(lineSnapshot(product, key, 1));
  }
  cart.set("items", items);
  cart.expiresAt = new Date(Date.now() + CART_TTL_MS);
  await cart.save();
  return getCartResult(identity);
}

export async function updateCartItem(identity: CartIdentity, key: CartLineKey, quantity: number) {
  const product = await findAvailableProduct(key);
  const cart = await getOwnedCart(identity);
  const itemKey = requestedItemKey(key);
  const items = cart.items.map(copyCartItem);
  const index = items.findIndex((item) => cartItemKey(item) === itemKey);
  if (index < 0) throw new BadRequestError("This item is no longer in your bag.");
  items[index] = lineSnapshot(product, key, quantity);
  cart.set("items", items);
  cart.expiresAt = new Date(Date.now() + CART_TTL_MS);
  await cart.save();
  return getCartResult(identity);
}

export async function removeCartItem(identity: CartIdentity, key: CartLineKey) {
  const cart = await getOwnedCart(identity);
  cart.set("items", cart.items.filter((item) => !(item.productId.toString() === key.productId && item.size === key.size)));
  cart.expiresAt = new Date(Date.now() + CART_TTL_MS);
  await cart.save();
  return getCartResult(identity);
}

export async function clearCart(identity: CartIdentity) {
  const cart = await getOwnedCart(identity);
  cart.set("items", []);
  cart.expiresAt = new Date(Date.now() + CART_TTL_MS);
  await cart.save();
  return { items: [] };
}
