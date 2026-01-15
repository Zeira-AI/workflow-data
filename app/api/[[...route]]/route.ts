import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { readFile, readdir } from 'fs/promises'
import path from 'path'

// Create Hono app
const app = new Hono().basePath('/api')

// CORS middleware
app.use('*', async (c, next) => {
    await next()
    c.header('Access-Control-Allow-Origin', '*')
    c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
    c.header('Access-Control-Allow-Headers', 'Content-Type, X-Client')
})

// GET /api/data - List all CSV files for a client
app.get('/data', async (c) => {
    try {
        const client = c.req.header('X-Client') || 'dsm-f'

        // Validate client
        const validClients = ['dsm-f', 'ferrero']
        if (!validClients.includes(client)) {
            return c.json({ error: 'Invalid client' }, 400)
        }

        const dataDir = path.join(process.cwd(), 'public', 'data', client)
        const files = await readdir(dataDir)

        const csvFiles = files.filter(file => file.endsWith('.csv'))

        return c.json({ client, files: csvFiles })
    } catch (error) {
        console.error('Error reading directory:', error)
        return c.json({ error: 'Failed to read directory' }, 500)
    }
})

// GET /api/data/:filename - Get a specific CSV file for a client
app.get('/data/:filename', async (c) => {
    try {
        const filename = c.req.param('filename')
        const client = c.req.header('X-Client') || 'dsm-f'

        // Validate client
        const validClients = ['dsm-f', 'ferrero']
        if (!validClients.includes(client)) {
            return c.json({ error: 'Invalid client' }, 400)
        }

        // Ensure filename ends with .csv
        if (!filename.endsWith('.csv')) {
            return c.json({ error: 'Only CSV files are allowed' }, 400)
        }

        // Try client-specific path first, fallback to generic
        const clientPath = path.join(process.cwd(), 'public', 'data', client, filename)
        const genericPath = path.join(process.cwd(), 'public', 'data', filename)

        let data: string
        let source: string

        try {
            // Try client-specific file first
            data = await readFile(clientPath, 'utf-8')
            source = `${client}/${filename}`
        } catch (clientError) {
            // Fallback to generic file
            try {
                data = await readFile(genericPath, 'utf-8')
                source = `generic/${filename}`
                console.log(`[Fallback] ${client}/${filename} -> generic/${filename}`)
            } catch (genericError) {
                console.error('File not found in both locations:', { clientPath, genericPath })
                return c.json({ error: 'File not found' }, 404)
            }
        }

        // Return CSV with source info in header
        return c.text(data, 200, {
            'Content-Type': 'text/csv',
            'X-Data-Source': source,
        })
    } catch (error) {
        console.error('Error reading file:', error)
        return c.json({ error: 'Internal server error' }, 500)
    }
})

// Handle OPTIONS for CORS
app.options('*', (c) => c.body(null, 204))

// Export for Next.js
export const GET = handle(app)
export const OPTIONS = handle(app)
