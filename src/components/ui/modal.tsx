"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              {title}
            </h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4 h-8 w-8 rounded-full p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-slate-600 dark:text-slate-300">
          {children}
        </div>
      </div>
    </div>
  );
}
