"use client";

import type { ReactNode } from "react";
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function SortableTable({
  items,
  onReorder,
  disabled = false,
  children,
}: {
  items: string[];
  onReorder: (items: string[]) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id || disabled) return;
    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    onReorder(reordered);
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

export function SortableTableRow({
  id,
  disabled = false,
  className = "",
  children,
}: {
  id: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled });

  return (
    <tr
      {...attributes}
      {...listeners}
      aria-roledescription="sortable row"
      className={`${className} cursor-grab outline-none transition-colors active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink ${isDragging ? "relative z-10 bg-paper opacity-90 shadow-lg" : ""}`}
      ref={setNodeRef}
      role="row"
      style={{
        touchAction: "none",
        transform: CSS.Transform.toString(transform),
        transition: transition ?? "transform 220ms cubic-bezier(0.2, 0, 0, 1)",
      }}
    >
      {children}
    </tr>
  );
}
