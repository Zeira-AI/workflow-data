import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

import { VALID_CLIENTS } from '../../constants';

export async function GET(request: NextRequest) {
  try {
    const client = request.headers.get('X-Client') || 'dsm-f';

    // Validate client
    if (!VALID_CLIENTS.includes(client)) {
      return NextResponse.json(
        { error: 'Invalid client' },
        { status: 400 }
      );
    }

    const genericNodesDir = path.join(process.cwd(), 'public', 'nodes');
    const clientNodesDir = path.join(process.cwd(), 'public', 'nodes', client);

    // Get all generic node files
    const genericFiles = await readdir(genericNodesDir);
    const genericJsonFiles = genericFiles.filter(
      file => file.endsWith('.json') && !file.startsWith('_')
    );

    // Check which files have client-specific overrides
    let clientFiles: string[] = [];
    try {
      const clientDirStat = await stat(clientNodesDir);
      if (clientDirStat.isDirectory()) {
        const files = await readdir(clientNodesDir);
        clientFiles = files.filter(file => file.endsWith('.json'));
      }
    } catch {
      // Client directory doesn't exist, that's fine
    }

    // Build response with source info
    const filesWithSource = genericJsonFiles.map(file => ({
      filename: file,
      source: clientFiles.includes(file) ? client : 'generic',
    }));

    return NextResponse.json(
      {
        client,
        files: filesWithSource,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Client',
        },
      }
    );
  } catch (error) {
    console.error('Error reading nodes directory:', error);
    return NextResponse.json(
      { error: 'Failed to read directory' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Client',
    },
  });
}
