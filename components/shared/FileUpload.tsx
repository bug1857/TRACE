'use client';

import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  placeholder?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = '.csv,.xml',
  placeholder = 'Drop OCEL 2.0 CSV or XML here, or click to select'
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      // Basic type validation
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (accept.split(',').includes(fileExtension)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerSelect}
      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[160px] select-none ${
        isDragActive
          ? 'drop-zone-active bg-[var(--accent)]'
          : 'border-[var(--border)] bg-[var(--card)] hover:bg-[#ECEAE4]'
      }`}
      style={{ transition: "transform 0.2s ease", transform: isDragActive ? "scale(1.015)" : "scale(1)" }}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      <div className="mb-3 text-[var(--muted-foreground)]">
        <Upload className="w-8 h-8 mx-auto" strokeWidth={1.5} />
      </div>

      <p className="text-[13px] font-sans font-medium text-[var(--foreground)]">
        {placeholder}
      </p>
      
      <p className="text-[11px] text-[var(--muted-foreground)] font-sans mt-1">
        Accepted file types: {accept.toUpperCase()}
      </p>
    </div>
  );
}
