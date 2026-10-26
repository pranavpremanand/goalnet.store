"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuArrowUpRight as ArrowUpRight, LuImagePlus as ImagePlus, LuPlus as Plus, LuX as X } from "react-icons/lu";
import { featuredProducts, formatRupees, type Product } from "@/data/products";

const sizes = ["XS", "S", "M", "L", "XL"];

export function AdminProducts() {
  const [products, setProducts] = useState(featuredProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [images, setImages] = useState<string[]>([]);

  function submitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const product: Product = {
      id: `preview-${Date.now()}`,
      name: String(form.get("name")),
      category: String(form.get("category")),
      price: Number(form.get("price-md")) || 2500,
      image: images[0] ?? "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=85",
      imageAlt: `Preview image for ${String(form.get("name"))}`,
      color: "Blue",
    };
    setProducts((current) => [product, ...current]);
    setFormOpen(false);
    setImages([]);
    setNotice(`${product.name} was added to this preview.`);
    event.currentTarget.reset();
  }

  function selectImages(files: FileList | null) {
    if (!files) return;
    setImages(Array.from(files).slice(0, 3).map((file) => URL.createObjectURL(file)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-muted">Store catalog</p><h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Products</h1><p className="mt-2 text-sm text-muted">Review inventory and keep the collection current.</p></div><button className="inline-flex min-h-11 items-center gap-2 bg-brand px-4 text-xs font-bold uppercase" onClick={() => setFormOpen(!formOpen)} type="button">{formOpen ? <X size={16} /> : <Plus size={16} />}{formOpen ? "Close form" : "Add product"}</button></div>
      {notice && <p aria-live="polite" className="mt-5 border-l-4 border-brand bg-canvas p-3 text-sm">{notice}</p>}
      {formOpen && <form className="mt-6 border border-line p-4 sm:p-6" onSubmit={submitProduct}><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase text-muted">New catalog item</p><h2 className="mt-1 font-display text-2xl font-semibold">Add product</h2></div><button aria-label="Close add product form" onClick={() => setFormOpen(false)} type="button"><X size={19} /></button></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-semibold">Product name<input className="mt-2 w-full border border-line p-3 text-sm" name="name" placeholder="e.g. National team home jersey" required /></label><label className="text-xs font-semibold">Category<select className="mt-2 w-full border border-line bg-white p-3 text-sm" name="category"><option>National jerseys</option><option>Club jerseys</option><option>Retro classics</option><option>Special editions</option></select></label><label className="text-xs font-semibold md:col-span-2">Description<textarea className="mt-2 min-h-24 w-full border border-line p-3 text-sm" name="description" placeholder="Product description" /></label></div><div className="mt-6 overflow-x-auto"><h3 className="mb-2 text-xs font-bold uppercase">Available sizes and price</h3><table className="w-full min-w-[540px] border-collapse text-left text-xs"><thead className="bg-canvas"><tr><th className="p-3">Size</th><th className="p-3">Quantity</th><th className="p-3">Price (₹)</th></tr></thead><tbody>{sizes.map((size) => <tr className="border-b border-line" key={size}><td className="p-2 font-semibold">{size}</td><td className="p-2"><input aria-label={`${size} quantity`} className="w-full border border-line p-2" min="0" name={`qty-${size.toLowerCase()}`} type="number" defaultValue="5" /></td><td className="p-2"><input aria-label={`${size} price`} className="w-full border border-line p-2" min="0" name={`price-${size.toLowerCase()}`} type="number" defaultValue="2500" /></td></tr>)}</tbody></table></div><div className="mt-5"><label className="flex min-h-20 cursor-pointer items-center gap-3 border border-dashed border-line px-4"><ImagePlus size={20} /><span><span className="block text-xs font-bold uppercase">Product images</span><span className="text-xs text-muted">PNG or JPG · up to 3 images</span></span><input accept="image/png,image/jpeg" className="sr-only" multiple onChange={(event) => selectImages(event.target.files)} type="file" /></label>{images.length > 0 && <div className="mt-3 flex gap-3">{images.map((image) => <div className="relative size-16 overflow-hidden bg-canvas" key={image}><Image alt="Selected product preview" className="object-cover" fill sizes="64px" src={image} /><button aria-label="Remove preview image" className="absolute right-0 top-0 grid size-5 place-items-center bg-ink text-white" onClick={() => setImages((current) => current.filter((item) => item !== image))} type="button"><X size={12} /></button></div>)}</div>}</div><div className="mt-5 flex gap-3"><button className="bg-brand px-6 py-3 text-xs font-bold uppercase" type="submit">Save product</button><button className="border border-line px-6 py-3 text-xs font-bold uppercase" onClick={() => setFormOpen(false)} type="button">Cancel</button></div></form>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article className="group border border-line" key={product.id}>
            <div className="relative aspect-[16/10] overflow-hidden bg-canvas">
              <Image alt={product.imageAlt} className="object-cover transition duration-500 group-hover:scale-[1.03]" fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" src={product.image} unoptimized={product.image.startsWith("blob:")} />
              <span className="absolute left-3 top-3 bg-white px-2 py-1 text-[10px] font-bold uppercase">In stock</span>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase text-muted">{product.category}</p><h2 className="mt-1 font-display text-xl font-semibold">{product.name}</h2></div><p className="text-sm font-bold">{formatRupees(product.price)}</p></div>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <p className="text-xs text-muted">Sizes XS–XL</p>
                {product.id.startsWith("preview-") ? <span className="text-[10px] font-bold uppercase text-muted">Preview record</span> : <Link className="inline-flex items-center gap-1 text-xs font-bold uppercase underline" href={`/admin/product/${product.id}`}>Edit product <ArrowUpRight size={14} /></Link>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}