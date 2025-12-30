'use client';

import { useEffect, useState } from 'react';

interface FileList {
  files: string[];
}

export default function Home() {
  const [jsonFiles, setJsonFiles] = useState<string[]>([]);
  const [csvFiles, setCsvFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      try {
        // Fetch from public folder - Next.js automatically serves these
        const [jsonIndexRes, csvIndexRes] = await Promise.all([
          fetch('/nodes/_index.json'),
          fetch('/mocked-data/index.json'),
        ]);

        const jsonIndex = await jsonIndexRes.json();
        const csvIndex = await csvIndexRes.json();

        // Build JSON file list from index
        const jsonFilesList = jsonIndex.tools?.map((tool: string) => `${tool}.json`) || [];
        
        setJsonFiles(jsonFilesList);
        setCsvFiles(csvIndex.files || []);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Object Storage Server
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and access JSON and CSV files
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* JSON Files Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-blue-500">📄</span>
              JSON Files
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({jsonFiles.length})
              </span>
            </h2>
            <div className="space-y-2">
              {jsonFiles.length === 0 ? (
                <p className="text-gray-500 text-sm">No JSON files found</p>
              ) : (
                jsonFiles.map((file) => (
                  <a
                    key={file}
                    href={`/nodes/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{file}</span>
                      <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* CSV Files Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-green-500">📊</span>
              CSV Files
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({csvFiles.length})
              </span>
            </h2>
            <div className="space-y-2">
              {csvFiles.length === 0 ? (
                <p className="text-gray-500 text-sm">No CSV files found</p>
              ) : (
                csvFiles.map((file) => (
                  <a
                    key={file}
                    href={`/mocked-data/${file}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{file}</span>
                      <span className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">📚 Direct File Access</h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <div className="text-blue-600 dark:text-blue-400 font-semibold mb-1">
                GET /nodes/_index.json
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                List all JSON tool definitions
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <div className="text-blue-600 dark:text-blue-400 font-semibold mb-1">
                GET /nodes/[filename].json
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Get specific JSON tool definition (e.g., /nodes/product-search.json)
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <div className="text-green-600 dark:text-green-400 font-semibold mb-1">
                GET /mocked-data/index.json
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                List all CSV files
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
              <div className="text-green-600 dark:text-green-400 font-semibold mb-1">
                GET /mocked-data/[filename].csv
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Get specific CSV file (e.g., /mocked-data/product-search.csv)
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Note:</strong> All files are served directly from the <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">/public</code> folder. 
              No API routes needed!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
