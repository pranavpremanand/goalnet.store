"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuArrowLeft as ArrowLeft, LuCheck as Check, LuTrash2 as Trash2 } from "react-icons/lu";
import type { Product } from "@/data/products";

const sizes = ["XS", "S", "M", "L", "XL"];

export function AdminProductDetail({ product }: { product: Product }) {
  const [notice, setNotice] = useState("");
  const [deleted, setDeleted] = useState(false);
  const [preview, setPreview] = useState("");
  const image = product.image;

  if (deleted) return <div className="grid min-h-[55vh] place-items-center text-center"><div><p className="font-display text-3xl font-semibold">Product removed from preview.</p><Link className="mt-4 inline-flex border-b border-ink pb-1 text-sm font-bold" href="/admin/products">Back to products</Link></div></div>;

  return <div className="mx-auto max-w-4xl"><Link className="inline-flex items-center gap-2 text-xs font-bold uppercase text-muted" href="/admin/products"><ArrowLeft size={15} /> Products</Link><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-muted">Catalog / {product.id}</p><h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Edit product</h1></div><span className="bg-canvas px-3 py-2 text-[10px] font-bold uppercase text-muted">Local preview</span></div>{notice && <p aria-live="polite" className="mt-5 flex items-center gap-2 bg-canvas p-3 text-sm"><Check size={16} />{notice}</p>}<form className="mt-6 space-y-6 border border-line p-4 sm:p-7" onSubmit={(event) => { event.preventDefault(); setNotice("Product changes saved in this preview."); }}><div className="grid gap-5 md:grid-cols-[200px_1fr]"><div><div className="relative aspect-square overflow-hidden bg-canvas"><Image alt={product.imageAlt} className="object-cover" fill sizes="200px" src={preview || image} /></div><label className="mt-2 block cursor-pointer border border-line p-3 text-center text-[10px] font-bold uppercase">Replace image<input accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setPreview(URL.createObjectURL(file)); }} type="file" /></label></div><div className="space-y-4"><label className="block text-xs font-semibold">Product name<input className="mt-2 w-full border border-line p-3 text-sm" defaultValue={product.name} /></label><label className="block text-xs font-semibold">Description<textarea className="mt-2 min-h-28 w-full border border-line p-3 text-sm" defaultValue="A fan-first fit made with breathable sports fabric and considered matchday details." /></label><label className="block text-xs font-semibold">Category<select className="mt-2 w-full border border-line bg-white p-3 text-sm" defaultValue={product.category}><option>National jerseys</option><option>Club jerseys</option><option>Retro classics</option><option>Special editions</option></select></label></div></div><div className="overflow-x-auto"><h2 className="mb-2 text-xs font-bold uppercase">Size inventory</h2><table className="w-full min-w-[500px] text-left text-xs"><thead className="bg-canvas"><tr><th className="p-3">Size</th><th className="p-3">Quantity</th><th className="p-3">Price (₹)</th></tr></thead><tbody>{sizes.map((size, index) => <tr className="border-b border-line" key={size}><td className="p-2 font-semibold">{size}</td><td className="p-2"><input aria-label={`${size} stock`} className="w-full border border-line p-2" defaultValue={index * 3 + 7} type="number" /></td><td className="p-2"><input aria-label={`${size} price`} className="w-full border border-line p-2" defaultValue={product.price} type="number" /></td></tr>)}</tbody></table></div><div className="flex flex-wrap justify-between gap-3 border-t border-line pt-5"><button className="inline-flex items-center gap-2 border border-red-200 px-4 py-3 text-xs font-bold uppercase text-red-700" onClick={() => setDeleted(true)} type="button"><Trash2 size={14} /> Delete product</button><button className="bg-brand px-6 py-3 text-xs font-bold uppercase" type="submit">Save changes</button></div></form></div>;
}

