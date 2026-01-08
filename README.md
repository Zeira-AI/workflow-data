# Workflow Builder - Tool Definitions

This directory contains JSON-based tool definitions for the workflow builder. Tool definitions are loaded dynamically at runtime, allowing you to add or modify tools without rebuilding the application.

## Directory Structure

```
public/
├── nodes/
│   ├── _schema.json          # JSON Schema for validation
│   ├── _index.json           # Registry of all tools
│   ├── product-search.json   # Tool definitions
│   ├── deformulate.json
│   └── ...
└── mocked-data/
    ├── product-search.csv    # Mocked data for testing
    ├── deformulate.csv
    └── ...
```

## Adding a Tool

### 1. Create Tool Definition JSON

Create a new file in `nodes/` directory (e.g., `nodes/my-new-tool.json`):

```json
{
  "type": "my-new-tool",                // Unique identifier (kebab-case, must match filename)
  "label": "My New Tool",               // Human-readable display name
  "category": "transform",              // Category for organizing in UI (any string)
  "icon": "filter",                     // Icon key from constants
  "color": "green",                     // Color key (amber, purple, blue, green, etc.)
  "description": "Brief description",   // Optional: description of the tool's purpose
  "defaultInputs": [],                  // Placeholder, always empty array for now
  "defaultOutputs": [                   // Output ports
    {
      "id": "result",                   // Unique port identifier
      "name": "Result",                 // Display name
      "type": "array",                  // Data type: string | number | boolean | object | array
      "description": "Output description",
      "tooltip": "Tooltip text (supports **markdown**)"  // Optional: hover tooltip
    }
  ],
  "configSchema": [                     // Configuration fields for the tool
    {
      "key": "instructions",            // Markdown for inline help/instructions
      "type": "markdown",
      "label": "This tool processes data based on:\n\n- **Speed**: Fast or accurate mode\n- **Input**: File or manual entry",
      "color": "info"                   // Optional: info | success | warning | error | default | none
    },
    {
      "key": "myParameter",             // Field key (used in config object)
      "type": "text",                   // Field type: text | number | select | boolean | json | textarea | file | markdown
      "label": "My Parameter",          // Display label
      "placeholder": "Enter value...",  // Optional: placeholder text
      "defaultValue": "",               // Optional: default value
      "tooltip": "Help text shown on hover (supports **markdown**)"  // Optional
    },
    {
      "key": "mode",
      "type": "select",                 // Dropdown selection
      "label": "Mode",
      "options": [                      // Required for select type
        { "value": "fast", "label": "Fast" },
        { "value": "accurate", "label": "Accurate" }
      ],
      "defaultValue": "fast",
      "tooltip": "Select processing mode:\n- **Fast**: Quick results\n- **Accurate**: Higher precision"
    },
    {
      "key": "threshold",
      "type": "number",
      "label": "Threshold",
      "placeholder": "Enter value (0-100)",
      "defaultValue": 70,
      "showWhen": [                     // Conditional visibility (AND logic between conditions)
        { "field": "mode", "in": ["accurate"] }  // Show only when mode is "accurate"
      ]
    },
    {
      "key": "uploadFile",
      "type": "file",                   // File upload input
      "label": "Upload File",
      "accept": ".csv,.json",           // Optional: accepted file types
      "multiple": false,                // Optional: allow multiple files
      "tooltip": "Upload a **CSV** or **JSON** file for processing"
    },
    {
      "key": "advancedOption",
      "type": "boolean",
      "label": "Enable Advanced Processing",
      "defaultValue": false,
      "advanced": true                  // Groups field in collapsible "Advanced Settings" section
    }
  ]
}
```

### 2. Register in Index

Add your tool type to the `tools` array in `nodes/_index.json`:

```json
{
  "version": "1.0.0",
  "schemaVersion": "1.0.0",
  "description": "Registry of all available workflow builder tools",
  "tools": [
    "product-search",
    "deformulate",
    "data-source",
    "filter",
    "my-new-tool"
  ]
}
```

**Note:** Simply add your tool's `type` to the array. The filename must be `{type}.json`.

### 3. Create Mocked Data (Optional)

For testing, create a CSV file in `mocked-data/` directory (e.g., `mocked-data/my-new-tool.csv`):

```csv
id,name,value,status
1,Item One,100,active
2,Item Two,200,inactive
3,Item Three,150,active
```

**CSV Naming Convention:** Must match the tool's `type` field (e.g., `my-new-tool.csv` for type `my-new-tool`).

### 4. Refresh the Application

The new tool will appear in the Tools sidebar automatically after refreshing the page. No rebuild required!

## Updating an Existing Tool

### 1. Edit the JSON File

Modify the tool definition file directly in `nodes/`:

```json
{
  "type": "product-search",
  "label": "Product Search (Updated)",
  "description": "Updated description",
  ...
}
```

### 2. Update Index (if type changed)

If you changed the `type` field, update the corresponding entry in the `modules` array in `nodes/_index.json`.

### 3. Update Mocked Data (if outputs changed)

If you modified the `defaultOutputs` structure, update the corresponding CSV file to match:

```csv
newField,existingField,anotherField
value1,value2,value3
```

### 4. Refresh the Application

Changes will be reflected immediately upon refresh.

## Validation

All tool definitions are automatically validated against the JSON Schema (`_schema.json`) when the application loads using the [Ajv](https://ajv.js.org/) validator. **Invalid tools are silently excluded from the Tools sidebar** to prevent breaking the application.

### Validation Process:

1. JSON Schema is loaded from `nodes/_schema.json`
2. Each tool definition is validated against the schema
3. Invalid tools are logged to the browser console with specific error messages
4. Valid tools are loaded and appear in the sidebar
5. The application continues to work with only valid tools

### Console Output Examples:

**Valid tool:**
```
✓ Loaded tool: "product-search"
✓ Successfully loaded all 4 tools
```

**Invalid tool:**
```
❌ Tool definition validation failed for "my-broken-tool":
   - /label: must have required property 'label'
   - /category: must be equal to one of the allowed values
   - /defaultOutputs/0: must have required property 'type'
⚠️  Skipping invalid tool: "my-broken-tool"
⚠️  Loaded 3/4 tools (1 invalid tool skipped)
```

### Common Validation Errors:

- **Missing required fields**: `type`, `label`, `category`, `icon`, `color`, `defaultInputs`, `defaultOutputs`, `configSchema`
- **Invalid I/O types**: Must be one of: `string`, `number`, `boolean`, `object`, `array`
- **Invalid config types**: Must be one of: `text`, `number`, `select`, `boolean`, `json`, `textarea`, `file`, `markdown`
- **Type mismatch**: The `type` field must match the filename (e.g., `my-tool.json` should have `"type": "my-tool"`)
- **Missing I/O fields**: Each input/output must have `id`, `name`, and `type`
- **Missing config fields**: Each config field must have `key`, `type`, and `label`

### Debugging Invalid Tools:

1. Open browser DevTools console (F12)
2. Look for red error messages with ❌ symbol
3. Fix the issues listed in the error messages
4. Refresh the page to see if the tool loads

## Config Field Types

| Type | Description | Example |
|------|-------------|---------|
| `text` | Single-line text input | Name, URL, email |
| `textarea` | Multi-line text input | Query, description, notes |
| `number` | Numeric input | Count, limit, threshold |
| `select` | Dropdown selection | Requires `options` array |
| `boolean` | Checkbox | Enable/disable flags |
| `json` | JSON editor | Complex structured data |
| `file` | File upload input | Documents, images, data files |
| `markdown` | Inline help/instructions | Info cards, usage hints |

## Multi-Type Fields

Use an array of types to let users switch between input modes:

```json
{
  "key": "ingredientList",
  "type": ["text", "file"],
  "label": "Ingredient List",
  "placeholder": "Enter or upload ingredients...",
  "suggestedField": ["smiles", "name"],
  "accept": ".txt,.csv,.smi"
}
```

This renders a switcher allowing users to choose between:
- **Text mode**: Manual input with field mapping support
- **File mode**: File upload with drag-and-drop

**Notes:**
- Properties like `accept`, `placeholder`, `suggestedField` apply to their respective types
- Switching modes clears incompatible values (e.g., text ↔ file)

## File Field Example

```json
{
  "key": "uploadedFile",
  "type": "file",
  "label": "Upload Document",
  "accept": ".pdf,.doc,.docx",
  "multiple": false
}
```

**File field properties:**
- **accept**: Accepted file types (e.g., `image/*`, `.pdf,.doc`, `application/json`)
- **multiple**: Allow multiple file selection (`true` or `false`)

## Markdown Field Example

Use markdown fields to display inline help, instructions, or information cards:

```json
{
  "key": "instructions",
  "type": "markdown",
  "label": "This tool filters compounds based on:\n\n- **Relevance**: Match to target criteria\n- **Novelty**: Uniqueness score\n- **Safety**: Toxicity predictions",
  "color": "info"
}
```

**Markdown field properties:**
- **label**: The markdown content to display (supports standard markdown syntax)
- **color**: Card theme color (`info`, `success`, `warning`, `error`, `default`, `none`)

## Conditional Visibility (showWhen)

Use `showWhen` to show/hide fields based on other field values:

```json
{
  "key": "threshold",
  "type": "number",
  "label": "Confidence Threshold",
  "showWhen": [
    { "field": "mode", "in": ["accurate", "custom"] }
  ]
}
```

**showWhen rules:**
- Array of conditions with AND logic between conditions
- Each condition's `in` array uses OR logic
- `field`: The key of the field to check
- `in`: Array of values - field value must match one of these

**Multi-condition example (AND logic):**
```json
{
  "key": "toxicity_detail",
  "type": "textarea",
  "label": "Toxicity Notes",
  "showWhen": [
    { "field": "model", "in": ["chem_prop"] },
    { "field": "endpoint", "in": ["toxicity"] }
  ]
}
```
This field shows only when `model` is "chem_prop" AND `endpoint` is "toxicity".

## Advanced Settings

Use `advanced: true` to group fields in a collapsible "Advanced Settings" section:

```json
{
  "key": "batchSize",
  "type": "number",
  "label": "Batch Size",
  "defaultValue": 32,
  "advanced": true
}
```

## Tooltips

Add hover tooltips to any field (supports markdown):

```json
{
  "key": "query",
  "type": "textarea",
  "label": "Search Query",
  "tooltip": "Enter search terms. You can search by:\n- **Function**: e.g., \"moisturizing\"\n- **Application**: e.g., \"hair care\"\n- **INCI name**: e.g., \"Niacinamide\""
}
```

Tooltips can also be added to output ports:

```json
{
  "id": "supplier_url",
  "name": "Supplier URL",
  "type": "string",
  "tooltip": "Supplier ingredient page URL"
}
```

## Select Field Example

```json
{
  "key": "operator",
  "type": "select",
  "label": "Operator",
  "options": [
    { "value": "equals", "label": "Equals" },
    { "value": "contains", "label": "Contains" },
    { "value": "greater_than", "label": "Greater Than" }
  ],
  "defaultValue": "equals"
}
```

## Tips

- **Keep type names unique** across all tool definitions
- **Use consistent naming**: kebab-case for `type`, Title Case for `label`
- **Filename must match type**: `my-new-tool.json` for type `my-new-tool`
- **Match CSV columns** to output field `id` values for proper data binding
- **Test with mocked data** before implementing actual execution logic
- **Validate your JSON** using an online validator or IDE extension
- **Reference existing tools** (like `product-search.json`) as templates
