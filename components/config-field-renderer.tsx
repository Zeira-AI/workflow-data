'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Upload, X, File as FileIcon, Image as ImageIcon, FileText, FileSpreadsheet, FileCode, Dna } from 'lucide-react'
import type { ConfigField } from '../types'

// ============================================
// Config Field Renderer
// ============================================

interface ConfigFieldRendererProps {
  field: ConfigField
  value: unknown
  onChange: (value: unknown) => void
}

export function ConfigFieldRenderer({ field, value, onChange }: ConfigFieldRendererProps) {
  const id = `config-${field.key}`
  const [isDragging, setIsDragging] = useState(false)

  const getFileIcon = (file: File) => {
    const fileName = file.name.toLowerCase()
    const fileType = file.type.toLowerCase()
    
    // Image files
    if (fileType.startsWith('image/')) return ImageIcon
    
    // Biological/Molecular files (PDB, PDBQT, MOL, SDF, etc.)
    if (fileName.endsWith('.pdb') || fileName.endsWith('.pdbqt') || 
        fileName.endsWith('.mol') || fileName.endsWith('.mol2') ||
        fileName.endsWith('.sdf') || fileName.endsWith('.xyz') ||
        fileName.endsWith('.cif') || fileName.endsWith('.mmcif')) return Dna
    
    // CSV files
    if (fileName.endsWith('.csv') || fileType.includes('csv')) return FileSpreadsheet
    
    // Markdown files
    if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) return FileCode
    
    // PDF files
    if (fileName.endsWith('.pdf') || fileType.includes('pdf')) return FileText
    
    // Word documents
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || 
        fileType.includes('msword') || fileType.includes('wordprocessingml')) return FileText
    
    // Default file icon
    return FileIcon
  }

  const getFileIconColor = (file: File) => {
    const fileName = file.name.toLowerCase()
    const fileType = file.type.toLowerCase()
    
    // Image files - blue
    if (fileType.startsWith('image/')) return 'bg-blue-100 text-blue-600'
    
    // Biological/Molecular files - cyan/teal
    if (fileName.endsWith('.pdb') || fileName.endsWith('.pdbqt') || 
        fileName.endsWith('.mol') || fileName.endsWith('.mol2') ||
        fileName.endsWith('.sdf') || fileName.endsWith('.xyz') ||
        fileName.endsWith('.cif') || fileName.endsWith('.mmcif')) return 'bg-cyan-100 text-cyan-600'
    
    // CSV files - green
    if (fileName.endsWith('.csv') || fileType.includes('csv')) return 'bg-green-100 text-green-600'
    
    // Markdown files - purple
    if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) return 'bg-purple-100 text-purple-600'
    
    // PDF files - red
    if (fileName.endsWith('.pdf') || fileType.includes('pdf')) return 'bg-red-100 text-red-600'
    
    // Word documents - blue
    if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || 
        fileType.includes('msword') || fileType.includes('wordprocessingml')) return 'bg-blue-100 text-blue-600'
    
    // Default - gray
    return 'bg-slate-100 text-slate-600'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  switch (field.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className="text-sm">
            {field.label}
          </Label>
          <Input
            id={id}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      )

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className="text-sm">
            {field.label}
          </Label>
          <Input
            id={id}
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder={field.placeholder}
          />
        </div>
      )

    case 'textarea':
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className="text-sm">
            {field.label}
          </Label>
          <Textarea
            id={id}
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={4}
          />
        </div>
      )

    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className="text-sm">
            {field.label}
          </Label>
          <Select value={(value as string) || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'boolean':
      return (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-sm">
            {field.label}
          </Label>
          <Switch
            id={id}
            checked={(value as boolean) || false}
            onCheckedChange={onChange}
          />
        </div>
      )

    case 'json':
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className="text-sm">
            {field.label}
          </Label>
          <Textarea
            id={id}
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : (value as string) || ''}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value))
              } catch {
                onChange(e.target.value)
              }
            }}
            placeholder={field.placeholder || '{}'}
            rows={6}
            className="font-mono text-sm"
          />
        </div>
      )

    case 'file':
      const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
      }

      const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
      }

      const processFiles = (fileList: FileList) => {
        const filesArray = Array.from(fileList)
        if (field.multiple) {
          const existingFiles = Array.isArray(value) ? value : []
          onChange([...existingFiles, ...filesArray])
        } else {
          onChange(filesArray[0])
        }
      }

      const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files) {
          processFiles(e.dataTransfer.files)
        }
      }

      const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
          processFiles(e.target.files)
        }
      }

      const removeFile = (index: number) => {
        if (Array.isArray(value)) {
          const newFiles = [...value]
          newFiles.splice(index, 1)
          onChange(newFiles.length > 0 ? newFiles : undefined)
        } else {
          onChange(undefined)
        }
      }

      return (
        <div className="space-y-3">
          <Label className="text-sm">{field.label}</Label>
          
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-4 text-center
              transition-colors cursor-pointer
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-slate-300 hover:border-slate-400'
              }
            `}
          >
            <input
              type="file"
              multiple={field.multiple}
              accept={field.accept}
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm text-slate-700">
                  Drop files here or click to upload
                </p>
                {field.accept && (
                  <p className="text-xs text-slate-500 mt-1">
                    {field.accept}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* File List */}
          {(value instanceof File || (Array.isArray(value) && value.length > 0)) && (
            <div className="space-y-2">
              {Array.isArray(value) ? (
                value.map((file: File, index: number) => {
                  const Icon = getFileIcon(file)
                  const colorClass = getFileIconColor(file)
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })
              ) : value instanceof File ? (
                <div className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-white">
                  <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${getFileIconColor(value)}`}>
                    {(() => {
                      const Icon = getFileIcon(value)
                      return <Icon className="w-4 h-4" />
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{value.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(value.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(0)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )

    default:
      return null
  }
}

