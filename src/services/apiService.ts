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

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Unable to connect to server');
    }
  }

  async getSupportedTypes() {
    try {
      const response = await fetch(`${this.baseUrl}/supported-types`);
      const data = await response.json();
      return data.supportedTypes;
    } catch (error) {
      console.error('Failed to get supported types:', error);
      return [
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv',
        'application/rtf',
        'text/html'
      ];
    }
  }

  async extractDocument(
    file: File, 
    extractionType: 'extract' | 'analyze' | 'custom' = 'analyze',
    customFields?: ExtractionField[]
  ) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('extractionType', extractionType);
      
      if (extractionType === 'custom' && customFields) {
        formData.append('customFields', JSON.stringify(customFields));
      }

      const response = await fetch(`${this.baseUrl}/extract`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process document');
      }

      return data;
    } catch (error) {
      console.error('Document extraction failed:', error);
      throw error;
    }
  }
}

export default new ApiService();