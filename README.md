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
  "type": "my-new-tool",
  "label": "My New Tool",
  "category": "transform",
  "icon": "filter",
  "color": "green",
  "description": "Brief description of what this tool does",
  "defaultInputs": [],
  "defaultOutputs": [
    {
      "id": "result",
      "name": "result",
      "type": "array",
      "description": "Output data description"
    }
  ],
  "configSchema": [
    {
      "key": "myParameter",
      "type": "text",
      "label": "My Parameter",
      "placeholder": "Enter value...",
      "defaultValue": ""
    }
  ],
  "defaultConfig": {
    "myParameter": ""
  }
}
```

**Key Fields:**
- **type**: Unique identifier (kebab-case)
- **category**: `discovery` | `analysis` | `transform` | `output` | `integration`
- **icon**: Icon name (see constants for available icons)
- **color**: Color name (amber, purple, blue, green, etc.)
- **type** (I/O): `string` | `number` | `boolean` | `object` | `array`
- **type** (config): `text` | `number` | `select` | `boolean` | `json` | `textarea`

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

- **Missing required fields**: `type`, `label`, `category`, `icon`, `color`, `defaultInputs`, `defaultOutputs`, `configSchema`, `defaultConfig`
- **Invalid category**: Must be one of: `discovery`, `analysis`, `transform`, `output`, `integration`
- **Invalid I/O types**: Must be one of: `string`, `number`, `boolean`, `object`, `array`
- **Invalid config types**: Must be one of: `text`, `number`, `select`, `boolean`, `json`, `textarea`
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
