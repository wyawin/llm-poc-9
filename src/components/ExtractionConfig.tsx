import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Code, FileText, Download, ChevronDown, ChevronRight } from 'lucide-react';

interface ExtractionField {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'array_object';
  objectSchema?: ObjectField[];
}

interface ObjectField {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'date' | 'boolean';
}

interface ExtractionConfigProps {
  onConfigChange: (config: ExtractionField[]) => void;
  isVisible: boolean;
  onToggle: () => void;
}

export const ExtractionConfig: React.FC<ExtractionConfigProps> = ({
  onConfigChange,
  isVisible,
  onToggle
}) => {
  const [fields, setFields] = useState<ExtractionField[]>([]);

  const [newField, setNewField] = useState({
    name: '',
    description: '',
    type: 'text' as const
  });

  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  // Initialize with default fields and notify parent
  useEffect(() => {
    const defaultFields: ExtractionField[] = [
      { id: '1', name: 'title', description: 'Document title or heading', type: 'text' },
      { id: '2', name: 'summary', description: 'Brief summary of content', type: 'text' },
      { id: '3', name: 'date', description: 'Any dates mentioned', type: 'date' },
      { id: '4', name: 'key_points', description: 'Main points or bullet items', type: 'array' }
    ];
    
    setFields(defaultFields);
    onConfigChange(defaultFields);
  }, [onConfigChange]);

  const addField = () => {
    if (newField.name.trim() && newField.description.trim()) {
      const field: ExtractionField = {
        id: Date.now().toString(),
        name: newField.name.toLowerCase().replace(/\s+/g, '_'),
        description: newField.description,
        type: newField.type,
        objectSchema: newField.type === 'array_object' ? [
          { id: '1', name: 'name', description: 'Item name', type: 'text' },
          { id: '2', name: 'value', description: 'Item value', type: 'text' }
        ] : undefined
      };
      
      const updatedFields = [...fields, field];
      setFields(updatedFields);
      onConfigChange(updatedFields);
      
      setNewField({ name: '', description: '', type: 'text' });
    }
  };

  const removeField = (id: string) => {
    const updatedFields = fields.filter(field => field.id !== id);
    setFields(updatedFields);
    onConfigChange(updatedFields);
  };

  const updateField = (id: string, updates: Partial<ExtractionField>) => {
    const updatedFields = fields.map(field => {
      if (field.id === id) {
        const updated = { ...field, ...updates };
        // If changing to array_object, add default schema
        if (updates.type === 'array_object' && !updated.objectSchema) {
          updated.objectSchema = [
            { id: '1', name: 'name', description: 'Item name', type: 'text' },
            { id: '2', name: 'value', description: 'Item value', type: 'text' }
          ];
        }
        // If changing away from array_object, remove schema
        if (updates.type && updates.type !== 'array_object') {
          updated.objectSchema = undefined;
        }
        return updated;
      }
      return field;
    });
    setFields(updatedFields);
    onConfigChange(updatedFields);
  };

  const addObjectField = (fieldId: string) => {
    const updatedFields = fields.map(field => {
      if (field.id === fieldId && field.objectSchema) {
        const newObjectField: ObjectField = {
          id: Date.now().toString(),
          name: '',
          description: '',
          type: 'text'
        };
        return {
          ...field,
          objectSchema: [...field.objectSchema, newObjectField]
        };
      }
      return field;
    });
    setFields(updatedFields);
    onConfigChange(updatedFields);
  };

  const updateObjectField = (fieldId: string, objectFieldId: string, updates: Partial<ObjectField>) => {
    const updatedFields = fields.map(field => {
      if (field.id === fieldId && field.objectSchema) {
        return {
          ...field,
          objectSchema: field.objectSchema.map(objField =>
            objField.id === objectFieldId ? { ...objField, ...updates } : objField
          )
        };
      }
      return field;
    });
    setFields(updatedFields);
    onConfigChange(updatedFields);
  };

  const removeObjectField = (fieldId: string, objectFieldId: string) => {
    const updatedFields = fields.map(field => {
      if (field.id === fieldId && field.objectSchema) {
        return {
          ...field,
          objectSchema: field.objectSchema.filter(objField => objField.id !== objectFieldId)
        };
      }
      return field;
    });
    setFields(updatedFields);
    onConfigChange(updatedFields);
  };

  const toggleFieldExpansion = (fieldId: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  const loadPreset = (preset: string) => {
    let presetFields: ExtractionField[] = [];
    
    switch (preset) {
      case 'invoice':
        presetFields = [
          { id: '1', name: 'invoice_number', description: 'Invoice number', type: 'text' },
          { id: '2', name: 'date', description: 'Invoice date', type: 'date' },
          { id: '3', name: 'vendor', description: 'Vendor or company name', type: 'text' },
          { id: '4', name: 'total_amount', description: 'Total amount', type: 'number' },
          { 
            id: '5', 
            name: 'line_items', 
            description: 'Invoice line items with details', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'description', description: 'Item description', type: 'text' },
              { id: '2', name: 'quantity', description: 'Quantity', type: 'number' },
              { id: '3', name: 'unit_price', description: 'Unit price', type: 'number' },
              { id: '4', name: 'total', description: 'Line total', type: 'number' }
            ]
          }
        ];
        break;
      case 'resume':
        presetFields = [
          { id: '1', name: 'name', description: 'Full name', type: 'text' },
          { id: '2', name: 'email', description: 'Email address', type: 'text' },
          { id: '3', name: 'phone', description: 'Phone number', type: 'text' },
          { id: '4', name: 'skills', description: 'List of skills', type: 'array' },
          { 
            id: '5', 
            name: 'work_experience', 
            description: 'Work experience entries', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'company', description: 'Company name', type: 'text' },
              { id: '2', name: 'position', description: 'Job title', type: 'text' },
              { id: '3', name: 'start_date', description: 'Start date', type: 'date' },
              { id: '4', name: 'end_date', description: 'End date', type: 'date' },
              { id: '5', name: 'description', description: 'Job description', type: 'text' }
            ]
          },
          { 
            id: '6', 
            name: 'education', 
            description: 'Educational background', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'institution', description: 'School/University', type: 'text' },
              { id: '2', name: 'degree', description: 'Degree/Certificate', type: 'text' },
              { id: '3', name: 'graduation_date', description: 'Graduation date', type: 'date' }
            ]
          }
        ];
        break;
      case 'contract':
        presetFields = [
          { id: '1', name: 'contract_title', description: 'Contract title', type: 'text' },
          { id: '2', name: 'effective_date', description: 'Effective date', type: 'date' },
          { id: '3', name: 'expiration_date', description: 'Expiration date', type: 'date' },
          { 
            id: '4', 
            name: 'parties', 
            description: 'Contract parties', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'name', description: 'Party name', type: 'text' },
              { id: '2', name: 'role', description: 'Party role', type: 'text' },
              { id: '3', name: 'address', description: 'Address', type: 'text' }
            ]
          },
          { 
            id: '5', 
            name: 'terms', 
            description: 'Key terms and conditions', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'clause', description: 'Clause title', type: 'text' },
              { id: '2', name: 'description', description: 'Clause description', type: 'text' }
            ]
          }
        ];
        break;
      default:
        return;
    }
    
    setFields(presetFields);
    onConfigChange(presetFields);
  };

  const exportConfig = () => {
    const config = {
      fields: fields,
      created: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extraction-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateExampleValue = (field: ExtractionField) => {
    switch (field.type) {
      case 'array':
        return ['example_value'];
      case 'number':
        return 0;
      case 'boolean':
        return true;
      case 'date':
        return '2024-01-01';
      case 'array_object':
        if (field.objectSchema) {
          const exampleObject = field.objectSchema.reduce((acc, objField) => {
            acc[objField.name] = objField.type === 'number' ? 0 : 
                                objField.type === 'boolean' ? true : 
                                objField.type === 'date' ? '2024-01-01' : 'example';
            return acc;
          }, {} as any);
          return [exampleObject];
        }
        return [{ example: 'value' }];
      default:
        return 'example_value';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        <Settings className="h-4 w-4" />
        <span>Configure Extraction</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Custom Data Extraction</h3>
        </div>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ×
        </button>
      </div>

      <p className="text-sm text-gray-600">
        Define specific fields you want to extract from your documents. The AI will return structured JSON data.
        Use "Array of Objects" for complex data like invoice items, work experience, or contract terms.
      </p>

      {/* Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Quick Presets:</label>
        <div className="flex flex-wrap gap-2">
          {['invoice', 'resume', 'contract'].map(preset => (
            <button
              key={preset}
              onClick={() => loadPreset(preset)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors capitalize"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Current Fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Extraction Fields:</label>
          <button
            onClick={exportConfig}
            className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            <Download className="h-3 w-3" />
            <span>Export</span>
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {fields.map(field => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => updateField(field.id, { name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Field name"
                  />
                  <input
                    type="text"
                    value={field.description}
                    onChange={(e) => updateField(field.id, { description: e.target.value })}
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Description"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                    className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                    <option value="array">Array</option>
                    <option value="array_object">Array of Objects</option>
                  </select>
                </div>
                
                {field.type === 'array_object' && (
                  <button
                    onClick={() => toggleFieldExpansion(field.id)}
                    className="p-1 text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    {expandedFields.has(field.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => removeField(field.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Object Schema Editor */}
              {field.type === 'array_object' && expandedFields.has(field.id) && field.objectSchema && (
                <div className="mt-3 pl-4 border-l-2 border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-purple-700">Object Properties:</span>
                    <button
                      onClick={() => addObjectField(field.id)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Property</span>
                    </button>
                  </div>
                  
                  {field.objectSchema.map(objField => (
                    <div key={objField.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={objField.name}
                        onChange={(e) => updateObjectField(field.id, objField.id, { name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 flex-1"
                        placeholder="Property name"
                      />
                      <input
                        type="text"
                        value={objField.description}
                        onChange={(e) => updateObjectField(field.id, objField.id, { description: e.target.value })}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 flex-1"
                        placeholder="Description"
                      />
                      <select
                        value={objField.type}
                        onChange={(e) => updateObjectField(field.id, objField.id, { type: e.target.value as any })}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="boolean">Boolean</option>
                      </select>
                      <button
                        onClick={() => removeObjectField(field.id, objField.id)}
                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New Field */}
      <div className="space-y-3 border-t pt-4">
        <label className="text-sm font-medium text-gray-700">Add New Field:</label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="text"
            value={newField.name}
            onChange={(e) => setNewField({ ...newField, name: e.target.value })}
            className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Field name"
          />
          <input
            type="text"
            value={newField.description}
            onChange={(e) => setNewField({ ...newField, description: e.target.value })}
            className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Description"
          />
          <select
            value={newField.type}
            onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
            className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="text">Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="boolean">Boolean</option>
            <option value="array">Array</option>
            <option value="array_object">Array of Objects</option>
          </select>
        </div>
        <button
          onClick={addField}
          disabled={!newField.name.trim() || !newField.description.trim()}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          <span>Add Field</span>
        </button>
      </div>

      {/* JSON Preview */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Expected JSON Structure:</label>
        <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto max-h-64">
          <pre>{JSON.stringify(
            fields.reduce((acc, field) => {
              acc[field.name] = generateExampleValue(field);
              return acc;
            }, {} as any), 
            null, 
            2
          )}</pre>
        </div>
      </div>
    </div>
  );
};