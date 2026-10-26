"use client";

import { useState } from "react";
import { LuCheck as Check, LuPencil as Pencil, LuPlus as Plus, LuTrash2 as Trash2, LuX as X } from "react-icons/lu";

const initialCategories = ["National jerseys", "Club jerseys", "Retro classics", "Special editions"];

export function AdminCategories() {
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  function addCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newCategory.trim()) return;
    setCategories((current) => [...current, newCategory.trim()]);
    setNewCategory("");
    setNotice("Category added to this preview.");
  }

  function saveEdit(index: number) {
    if (editValue.trim()) setCategories((current) => current.map((category, currentIndex) => currentIndex === index ? editValue.trim() : category));
    setEditingIndex(null);
    setNotice("Category updated in this preview.");
  }

  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-muted">Catalog settings</p><h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Categories</h1><p className="mt-2 text-sm text-muted">Organize the jerseys fans come looking for.</p></div><span className="bg-canvas px-3 py-2 text-[10px] font-bold uppercase text-muted">{categories.length} categories</span></div>{notice && <p aria-live="polite" className="mt-5 flex items-center gap-2 bg-canvas p-3 text-sm"><Check size={15} />{notice}</p>}<form className="mt-6 flex flex-col gap-3 border border-line p-4 sm:flex-row sm:items-end sm:p-5" onSubmit={addCategory}><label className="flex-1 text-xs font-semibold">New category<input className="mt-2 w-full border border-line p-3 text-sm" onChange={(event) => setNewCategory(event.target.value)} placeholder="Enter category name" value={newCategory} /></label><button className="inline-flex min-h-11 items-center justify-center gap-2 bg-brand px-5 text-xs font-bold uppercase" type="submit"><Plus size={15} /> Add category</button></form><div className="mt-6 overflow-x-auto border border-line"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-canvas text-[10px] font-bold uppercase text-muted"><tr><th className="px-4 py-3">No.</th><th className="px-4 py-3">Category name</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{categories.map((category, index) => <tr className="border-t border-line" key={`${category}-${index}`}><td className="px-4 py-4 text-muted">{String(index + 1).padStart(2, "0")}</td><td className="px-4 py-4">{editingIndex === index ? <input aria-label="Edit category name" className="w-full max-w-sm border border-line px-3 py-2" onChange={(event) => setEditValue(event.target.value)} value={editValue} /> : <span className="font-semibold">{category}</span>}</td><td className="px-4 py-3"><div className="flex justify-end gap-2">{editingIndex === index ? <><button aria-label="Save category" className="grid size-9 place-items-center bg-brand" onClick={() => saveEdit(index)} type="button"><Check size={16} /></button><button aria-label="Cancel edit" className="grid size-9 place-items-center border border-line" onClick={() => setEditingIndex(null)} type="button"><X size={16} /></button></> : <button aria-label={`Edit ${category}`} className="grid size-9 place-items-center border border-line" onClick={() => { setEditingIndex(index); setEditValue(category); }} type="button"><Pencil size={15} /></button>}<button aria-label={`Delete ${category}`} className="grid size-9 place-items-center border border-line text-red-700" onClick={() => setConfirmIndex(index)} type="button"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>{confirmIndex !== null && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"><section aria-modal="true" className="w-full max-w-sm bg-paper p-6" role="dialog"><p className="text-xs font-bold uppercase text-muted">Please confirm</p><h2 className="mt-2 font-display text-2xl font-semibold">Delete this category?</h2><p className="mt-2 text-sm text-muted">“{categories[confirmIndex]}” will be removed from this preview.</p><div className="mt-5 flex gap-3"><button className="bg-[#830000] px-4 py-3 text-xs font-bold uppercase text-white" onClick={() => { setCategories((current) => current.filter((_, index) => index !== confirmIndex)); setConfirmIndex(null); setNotice("Category removed from this preview."); }} type="button">Delete</button><button className="border border-line px-4 py-3 text-xs font-bold uppercase" onClick={() => setConfirmIndex(null)} type="button">Cancel</button></div></section></div>}</div>;
}