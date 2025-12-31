"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { ConfigFieldRenderer } from "@/components/config-field-renderer";
import type { ConfigField } from "@/types";

// Default example schema
const DEFAULT_SCHEMA = [
  {
    key: "email",
    type: "text",
    label: "Email",
    placeholder: "abc@gmail.com",
  },
  {
    key: "singleFile",
    type: "file",
    label: "Upload Single Document",
    accept: ".pdf,.doc,.docx,.txt,.csv",
  },
  {
    key: "multipleFiles",
    type: "file",
    label: "Upload Multiple Files",
    multiple: true,
  },
  {
    key: "images",
    type: "file",
    label: "Upload Images",
    multiple: true,
    accept: "image/*",
  },
  {
    key: "processingMode",
    type: "select",
    label: "Processing Mode",
    options: [
      {
        value: "text",
        label: "Text Extraction",
      },
      {
        value: "ocr",
        label: "OCR (Image to Text)",
      },
      {
        value: "metadata",
        label: "Metadata Only",
      },
    ],
    defaultValue: "text",
  },
  {
    key: "extractTables",
    type: "boolean",
    label: "Extract Tables",
  },
  {
    key: "language",
    type: "text",
    label: "Language Code",
    placeholder: "e.g., en, fr, es",
  },
  {
    key: "options",
    type: "json",
    label: "Advanced Options",
    placeholder: '{ "maxPages": 100 }',
  },
];

export default function FormBuilderPage() {
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(DEFAULT_SCHEMA, null, 2)
  );
  const [schema, setSchema] = useState<ConfigField[]>(
    () => DEFAULT_SCHEMA as ConfigField[]
  );
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [parseError, setParseError] = useState<string | null>(null);

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        setSchema(parsed);
        setParseError(null);
      } else {
        setParseError("Schema must be an array");
      }
    } catch (error) {
      setParseError((error as Error).message);
    }
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold text-slate-900">Form Builder</h1>
        <p className="text-sm text-slate-600 mt-1">
          Edit the JSON schema on the left to see the form update in real-time
        </p>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - JSON Editor */}
        <div className="w-1/2 border-r border-slate-200 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">
              Schema (JSON)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Define your form fields using the ConfigField interface
            </p>
          </div>
          <div className="flex-1 overflow-auto">
            <CodeMirror
              value={jsonInput}
              height="100%"
              extensions={[json()]}
              onChange={handleJsonChange}
              className="h-full"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: true,
                dropCursor: true,
                indentOnInput: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                highlightSelectionMatches: true,
              }}
            />
          </div>
          {parseError && (
            <div className="px-6 py-3 bg-red-50 border-t border-red-200">
              <p className="text-sm text-red-600 font-medium">Parse Error:</p>
              <p className="text-xs text-red-500 mt-1">{parseError}</p>
            </div>
          )}
        </div>

        {/* Right Panel - Form Preview */}
        <div className="w-1/2 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">
              Form Preview
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Live preview of the generated form
            </p>
          </div>
          <div className="flex-1 overflow-auto p-6 bg-slate-50">
            <div className="max-w-2xl mx-auto bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
              {schema.length > 0 ? (
                <div className="space-y-4">
                  {schema.map((field) => (
                    <ConfigFieldRenderer
                      key={field.key}
                      field={field}
                      value={formValues[field.key]}
                      onChange={(value) => handleConfigChange(field.key, value)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">
                    No fields defined. Add fields to your schema to see them
                    here.
                  </p>
                </div>
              )}
            </div>

            {/* Form Values Display */}
            {Object.keys(formValues).length > 0 && (
              <div className="max-w-2xl mx-auto mt-6 bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Form Values
                </h3>
                <pre className="text-xs bg-slate-50 p-4 rounded border border-slate-200 overflow-auto">
                  {JSON.stringify(
                    formValues,
                    (key, value) => {
                      // Handle File objects in JSON stringify
                      if (value instanceof File) {
                        return `File: ${value.name} (${value.size} bytes)`;
                      }
                      if (
                        Array.isArray(value) &&
                        value.length > 0 &&
                        value[0] instanceof File
                      ) {
                        return value.map(
                          (f: File) => `File: ${f.name} (${f.size} bytes)`
                        );
                      }
                      return value;
                    },
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
