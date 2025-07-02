import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiConfig {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  getModel() {
    return this.model;
  }

  getSupportedMimeTypes() {
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

  isFileSupported(mimeType) {
    return this.getSupportedMimeTypes().includes(mimeType);
  }
}

export default new GeminiConfig();