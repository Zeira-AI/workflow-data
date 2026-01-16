import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const VALID_CLIENTS = ['dsm-f', 'ferrero'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const client = request.headers.get('X-Client') || 'dsm-f';

    // Validate client
    if (!VALID_CLIENTS.includes(client)) {
      return NextResponse.json(
        { error: 'Invalid client' },
        { status: 400 }
      );
    }

    // Ensure filename ends with .json
    if (!filename.endsWith('.json')) {
      return NextResponse.json(
        { error: 'Only JSON files are allowed' },
        { status: 400 }
      );
    }

    // Try client-specific path first, fallback to generic
    const clientPath = path.join(process.cwd(), 'public', 'nodes', client, filename);
    const genericPath = path.join(process.cwd(), 'public', 'nodes', filename);

    let data: string;
    let source: string;

    try {
      // Try client-specific file first
      data = await readFile(clientPath, 'utf-8');
      source = `${client}/${filename}`;
    } catch (clientError) {
      // Fallback to generic file
      try {
        data = await readFile(genericPath, 'utf-8');
        source = `generic/${filename}`;
        console.log(`[Fallback] nodes/${client}/${filename} -> nodes/${filename}`);
      } catch (genericError) {
        console.error('Node file not found in both locations:', { clientPath, genericPath });
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        );
      }
    }

    const jsonData = JSON.parse(data);

    return NextResponse.json(jsonData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Client',
        'X-Node-Source': source,
      },
    });
  } catch (error) {
    console.error('Error reading node file:', error);
    return NextResponse.json(
      { error: 'File not found or invalid JSON' },
      { status: 404 }
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
