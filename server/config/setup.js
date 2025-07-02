export const config = {
    port: process.env.PORT || 3001,
    geminiApiKey: process.env.GEMINI_API_KEY || 'your-gemini-api-key-here',
    nodeEnv: process.env.NODE_ENV || 'development',
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
    uploadDir: 'uploads',
    tempDir: 'temp',
    
    // Google Cloud Project Configuration for Vertex AI
    googleCloudProject: process.env.GOOGLE_PROJECT_ID || 'your-project-name',
    googleCloudLocation: process.env.GOOGLE_CLOUD_LOCATION || 'global',
    
    // Service Account Configuration
    serviceAccountKeyPath: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || null,
    serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY || null, // JSON string
    
    // Gemini Model Configuration - Available models as of 2024
    // Valid models: gemini-2.5-flash-preview-05-20, gemini-2.5-flash-preview-04-17, gemini-1.5-flash, gemini-1.5-pro, gemini-1.5-flash-8b
    geminiExtractionModel: process.env.GEMINI_EXTRACTION_MODEL || 'gemini-2.5-flash-preview-05-20',
    geminiAnalysisModel: process.env.GEMINI_ANALYSIS_MODEL || 'gemini-2.5-flash-preview-05-20',
    
    // Available Gemini models for reference
    availableModels: [
      'gemini-2.5-flash-preview-05-20', // Latest preview model
      'gemini-2.5-flash-preview-04-17', // Previous preview model
      'gemini-1.5-flash',               // Fast, cost-effective
      'gemini-1.5-pro',                 // High quality reasoning
      'gemini-1.5-flash-8b'             // Ultra cost-effective
    ]
  };