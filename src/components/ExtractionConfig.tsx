import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Code, FileText, Download, ChevronDown, ChevronRight, CreditCard } from 'lucide-react';

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
      case 'bank_statement':
        presetFields = [
          { id: '1', name: 'bank_name', description: 'Name of the bank or financial institution', type: 'text' },
          { id: '2', name: 'account_holder_name', description: 'Name of the account holder', type: 'text' },
          { id: '3', name: 'account_number', description: 'Bank account number (last 4 digits or masked)', type: 'text' },
          { id: '4', name: 'account_type', description: 'Type of account (checking, savings, etc.)', type: 'text' },
          { id: '5', name: 'statement_period_start', description: 'Statement period start date', type: 'date' },
          { id: '6', name: 'statement_period_end', description: 'Statement period end date', type: 'date' },
          { id: '7', name: 'opening_balance', description: 'Opening balance at start of period', type: 'number' },
          { id: '8', name: 'closing_balance', description: 'Closing balance at end of period', type: 'number' },
          { id: '9', name: 'total_deposits', description: 'Total amount of deposits during period', type: 'number' },
          { id: '10', name: 'total_withdrawals', description: 'Total amount of withdrawals during period', type: 'number' },
          { id: '11', name: 'total_fees', description: 'Total fees charged during period', type: 'number' },
          { id: '12', name: 'interest_earned', description: 'Interest earned during period', type: 'number' },
          { 
            id: '13', 
            name: 'transactions', 
            description: 'All transactions during the statement period', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'date', description: 'Transaction date', type: 'date' },
              { id: '2', name: 'description', description: 'Transaction description', type: 'text' },
              { id: '3', name: 'amount', description: 'Transaction amount (positive for deposits, negative for withdrawals)', type: 'number' },
              { id: '4', name: 'balance', description: 'Account balance after transaction', type: 'number' },
              { id: '5', name: 'transaction_type', description: 'Type of transaction (deposit, withdrawal, fee, etc.)', type: 'text' },
              { id: '6', name: 'reference_number', description: 'Transaction reference or check number', type: 'text' }
            ]
          },
          { 
            id: '14', 
            name: 'fees_breakdown', 
            description: 'Breakdown of fees charged', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'fee_type', description: 'Type of fee (maintenance, overdraft, etc.)', type: 'text' },
              { id: '2', name: 'amount', description: 'Fee amount', type: 'number' },
              { id: '3', name: 'date', description: 'Date fee was charged', type: 'date' },
              { id: '4', name: 'description', description: 'Fee description', type: 'text' }
            ]
          },
          { 
            id: '15', 
            name: 'direct_deposits', 
            description: 'Direct deposits received', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'date', description: 'Deposit date', type: 'date' },
              { id: '2', name: 'amount', description: 'Deposit amount', type: 'number' },
              { id: '3', name: 'source', description: 'Source of deposit (employer, government, etc.)', type: 'text' },
              { id: '4', name: 'description', description: 'Deposit description', type: 'text' }
            ]
          },
          { 
            id: '16', 
            name: 'checks_written', 
            description: 'Checks written during period', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'check_number', description: 'Check number', type: 'text' },
              { id: '2', name: 'date', description: 'Date check cleared', type: 'date' },
              { id: '3', name: 'amount', description: 'Check amount', type: 'number' },
              { id: '4', name: 'payee', description: 'Check payee', type: 'text' }
            ]
          },
          { 
            id: '17', 
            name: 'electronic_transfers', 
            description: 'Electronic transfers (ACH, wire transfers, etc.)', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'date', description: 'Transfer date', type: 'date' },
              { id: '2', name: 'amount', description: 'Transfer amount', type: 'number' },
              { id: '3', name: 'type', description: 'Transfer type (ACH, wire, etc.)', type: 'text' },
              { id: '4', name: 'description', description: 'Transfer description', type: 'text' },
              { id: '5', name: 'reference', description: 'Transfer reference number', type: 'text' }
            ]
          },
          { id: '18', name: 'minimum_balance', description: 'Minimum balance during statement period', type: 'number' },
          { id: '19', name: 'maximum_balance', description: 'Maximum balance during statement period', type: 'number' },
          { id: '20', name: 'average_daily_balance', description: 'Average daily balance for the period', type: 'number' },
          { id: '21', name: 'overdraft_occurrences', description: 'Number of overdraft occurrences', type: 'number' },
          { id: '22', name: 'statement_date', description: 'Date the statement was generated', type: 'date' }
        ];
        break;
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
      case 'family_certificate':
        presetFields = [
          { id: '1', name: 'document_number', description: 'Official document number or certificate ID', type: 'text' },
          { id: '2', name: 'address', description: 'Family residence address', type: 'text' },
          { id: '3', name: 'head_of_household_name', description: 'Name of the head of household', type: 'text' },
          { id: '4', name: 'issue_date', description: 'Date when the certificate was issued', type: 'date' },
          { id: '5', name: 'issuing_authority', description: 'Government office or authority that issued the certificate', type: 'text' },
          { id: '6', name: 'village_district', description: 'Village or district (Kelurahan/Desa)', type: 'text' },
          { id: '7', name: 'sub_district', description: 'Sub-district (Kecamatan)', type: 'text' },
          { id: '8', name: 'city_regency', description: 'City or regency (Kota/Kabupaten)', type: 'text' },
          { id: '9', name: 'province', description: 'Province name', type: 'text' },
          { id: '10', name: 'postal_code', description: 'Postal code of the address', type: 'text' },
          { 
            id: '11', 
            name: 'family_members', 
            description: 'Complete list of all family members with detailed personal information', 
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'member_name', description: 'Full name of family member', type: 'text' },
              { id: '2', name: 'nik', description: 'NIK (Nomor Induk Kependudukan) or National Identification Number', type: 'text' },
              { id: '3', name: 'gender', description: 'Gender (Male/Female or Laki-laki/Perempuan)', type: 'text' },
              { id: '4', name: 'birth_date', description: 'Date of birth', type: 'date' },
              { id: '5', name: 'birth_place', description: 'Place of birth (city/regency)', type: 'text' },
              { id: '6', name: 'religion', description: 'Religious affiliation', type: 'text' },
              { id: '7', name: 'last_education', description: 'Highest level of education completed', type: 'text' },
              { id: '8', name: 'job_occupation', description: 'Current job or occupation', type: 'text' },
              { id: '9', name: 'marriage_status', description: 'Marital status (Single, Married, Divorced, Widowed)', type: 'text' },
              { id: '10', name: 'relationship_status', description: 'Relationship to head of household (Head, Spouse, Child, etc.)', type: 'text' },
              { id: '11', name: 'citizenship', description: 'Citizenship status (Indonesian citizen, Foreign citizen, etc.)', type: 'text' },
              { id: '12', name: 'passport_number', description: 'Passport number if applicable', type: 'text' },
              { id: '13', name: 'kitas_kitap_number', description: 'KITAS or KITAP number for foreign residents', type: 'text' },
              { id: '14', name: 'fathers_name', description: 'Full name of father', type: 'text' },
              { id: '15', name: 'mothers_name', description: 'Full name of mother', type: 'text' }
            ]
          },
          { id: '12', name: 'total_family_members', description: 'Total number of family members listed', type: 'number' },
          { id: '13', name: 'certificate_validity', description: 'Validity period or expiration information', type: 'text' },
          { id: '14', name: 'official_stamp_seal', description: 'Information about official stamps or seals present', type: 'text' },
          { id: '15', name: 'authorized_signature', description: 'Name and title of the authorizing official', type: 'text' }
        ];
        break;
      case 'ktp_id_card':
        presetFields = [
          { id: '1', name: 'ktp_issuing_province', description: 'Province that issued the KTP', type: 'text' },
          { id: '2', name: 'ktp_issuing_city_regency', description: 'City or regency that issued the KTP', type: 'text' },
          { id: '3', name: 'nik', description: 'NIK (Nomor Induk Kependudukan) - 16 digit identification number', type: 'text' },
          { id: '4', name: 'full_name', description: 'Complete full name as written on KTP', type: 'text' },
          { id: '5', name: 'gender', description: 'Gender (LAKI-LAKI/PEREMPUAN)', type: 'text' },
          { id: '6', name: 'blood_type', description: 'Blood type (A, B, AB, O with Rh factor)', type: 'text' },
          { id: '7', name: 'birth_date', description: 'Date of birth', type: 'date' },
          { id: '8', name: 'birth_place', description: 'Place of birth (city/regency)', type: 'text' },
          { id: '9', name: 'address', description: 'Complete address including RT/RW', type: 'text' },
          { id: '10', name: 'religion', description: 'Religious affiliation', type: 'text' },
          { id: '11', name: 'marriage_status', description: 'Marital status (BELUM KAWIN/KAWIN/CERAI HIDUP/CERAI MATI)', type: 'text' },
          { id: '12', name: 'job_occupation', description: 'Job or occupation', type: 'text' },
          { id: '13', name: 'citizenship', description: 'Citizenship status (WNI/WNA)', type: 'text' },
          { id: '14', name: 'valid_until', description: 'KTP validity expiration date', type: 'date' },
          { id: '15', name: 'issued_date', description: 'Date when KTP was issued', type: 'date' },
          { id: '16', name: 'issued_city_regency', description: 'City or regency where KTP was issued', type: 'text' }
        ];
        break;
      case 'npwp_tax_card':
        presetFields = [
          { id: '1', name: 'tax_card_number', description: 'NPWP number (formatted with dots and dashes)', type: 'text' },
          { id: '2', name: 'tax_card_number_16_digit', description: '16-digit NPWP number without formatting. If no 16-digit NPWP number present, return null', type: 'text' },
          { id: '3', name: 'full_name', description: 'Complete full name as registered for tax', type: 'text' },
          { id: '4', name: 'nik', description: 'NIK (Nomor Induk Kependudukan) - identification number', type: 'text' },
          { id: '5', name: 'address', description: 'Complete registered address', type: 'text' },
          { id: '6', name: 'issuing_tax_office_kpp', description: 'KPP (Kantor Pelayanan Pajak) - Tax office that issued the card', type: 'text' },
          { id: '7', name: 'issued_date', description: 'Date when NPWP was issued', type: 'date' },
          // { id: '8', name: 'official_stamp_seal', description: 'Information about official stamps or seals present', type: 'text' },
          // { id: '8', name: 'qrcode', description: 'Extract information about the QR Code present', type: 'text' }
        ];
        break;
      case 'payslip':
        presetFields = [
          { id: '1', name: 'employee_name', description: 'Full name of the employee', type: 'text' },
          { id: '2', name: 'employee_id', description: 'Employee ID or number', type: 'text' },
          { id: '3', name: 'company_name', description: 'Name of the company or employer', type: 'text' },
          { id: '4', name: 'pay_period_start', description: 'Pay period start date', type: 'date' },
          { id: '5', name: 'pay_period_end', description: 'Pay period end date', type: 'date' },
          { id: '6', name: 'payment_date', description: 'Date of payment', type: 'date' },
          { id: '7', name: 'basic_salary', description: 'Basic salary amount', type: 'number' },
          { id: '8', name: 'allowance', description: 'Total allowances', type: 'number' },
          { id: '9', name: 'incentive', description: 'Incentive or bonus amount', type: 'number' },
          { id: '10', name: 'tax', description: 'Tax deduction amount', type: 'number' },
          { id: '11', name: 'government_health', description: 'Government health insurance deduction', type: 'number' },
          { id: '12', name: 'government_pension', description: 'Government pension deduction', type: 'number' },
          { id: '13', name: 'take_home_pay', description: 'Net take-home pay after all deductions', type: 'number' },
          { id: '14', name: 'gross_pay', description: 'Gross pay before deductions', type: 'number' },
          { id: '15', name: 'total_deductions', description: 'Total amount of all deductions', type: 'number' },
          { id: '16', name: 'department', description: 'Department or division', type: 'text' },
          { id: '17', name: 'position', description: 'Job position or title', type: 'text' },
          {
            id: '18',
            name: 'earnings_breakdown',
            description: 'Detailed breakdown of all earnings components',
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'description', description: 'Description of earning type', type: 'text' },
              { id: '2', name: 'amount', description: 'Amount of this earning', type: 'number' }
            ]
          },
          {
            id: '19',
            name: 'deductions_breakdown',
            description: 'Detailed breakdown of all deduction components',
            type: 'array_object',
            objectSchema: [
              { id: '1', name: 'description', description: 'Description of deduction type', type: 'text' },
              { id: '2', name: 'amount', description: 'Amount of this deduction', type: 'number' }
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
        Define specific fields you want to extract from your documents. The AI will return structured JSON data with confidence levels.
        Use "Array of Objects" for complex data like transactions, line items, or detailed records.
      </p>

      {/* Presets */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Quick Presets:</label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'bank_statement', label: 'Bank Statement', icon: CreditCard },
            { key: 'invoice', label: 'Invoice', icon: FileText },
            { key: 'resume', label: 'Resume', icon: FileText },
            { key: 'contract', label: 'Contract', icon: FileText },
            { key: 'family_certificate', label: 'Family Certificate', icon: FileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-md hover:bg-gray-200 transition-colors ${
                key === 'bank_statement' 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </button>
          ))}
          {[
            { key: 'ktp_id_card', label: 'KTP (ID Card)', icon: FileText },
            { key: 'npwp_tax_card', label: 'NPWP (Tax Card)', icon: FileText },
            { key: 'payslip', label: 'Payslip', icon: FileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => loadPreset(key)}
              className="flex items-center space-x-1 px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
        {/* Bank Statement Description */}
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
          <strong>Bank Statement:</strong> Comprehensive extraction including account details, balances, transactions, fees, deposits, checks, and transfers with confidence scoring for financial analysis.
          <br />
          <strong>Family Certificate:</strong> Complete family record extraction including document details, head of household, and detailed family member information with personal, civil, and identification data.
          <br />
          <strong>KTP (ID Card):</strong> Complete Indonesian identification card extraction including personal details, address, civil status, and document validity information.
          <br />
          <strong>NPWP (Tax Card):</strong> Indonesian tax identification card extraction including tax numbers, personal information, and issuing office details.
          <br />
          <strong>Payslip:</strong> Employee payroll extraction including take-home pay, basic salary, tax, government health and pension, incentives, allowances, and detailed earnings/deductions breakdown.
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