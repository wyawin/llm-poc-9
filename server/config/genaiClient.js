// import { GoogleAuth } from 'google-auth-library';
import { GoogleGenAI } from '@google/genai';
import { config } from './setup.js';
// import fs from 'fs';

// // Initialize Google Cloud authentication
// async function initializeAuth() {
//   try {
//     let auth;
    
//     // Define required scopes for Google GenAI
//     const requiredScopes = [
//       'https://www.googleapis.com/auth/cloud-platform',
//       'https://www.googleapis.com/auth/generative-language',
//       'https://www.googleapis.com/auth/aiplatform'
//     ];
    
//     if (config.serviceAccountKeyPath && fs.existsSync(config.serviceAccountKeyPath)) {
//       // Method 1: Use service account key file
//       console.log('🔐 Using service account key file for authentication');
//       auth = new GoogleAuth({
//         keyFile: config.serviceAccountKeyPath,
//         scopes: requiredScopes
//       });
//     } else if (config.serviceAccountKey) {
//       // Method 2: Use service account key from environment variable
//       console.log('🔐 Using service account key from environment variable');
//       const credentials = typeof config.serviceAccountKey === 'string' 
//         ? JSON.parse(config.serviceAccountKey) 
//         : config.serviceAccountKey;
      
//       auth = new GoogleAuth({
//         credentials: credentials,
//         scopes: requiredScopes
//       });
//     } else {
//       // Method 3: Use Application Default Credentials
//       console.log('🔐 Using Application Default Credentials');
//       auth = new GoogleAuth({
//         scopes: requiredScopes
//       });
//     }

//     // Get access token to verify authentication
//     const authClient = await auth.getClient();
    
//     console.log('✅ Authentication initialized with Google GenAI scopes:');
//     console.log('   - https://www.googleapis.com/auth/cloud-platform');
//     console.log('   - https://www.googleapis.com/auth/generative-language');
//     console.log('   - https://www.googleapis.com/auth/aiplatform');
    
//     return { auth, authClient };
//   } catch (error) {
//     console.error('❌ Authentication initialization failed:', error);
//     throw new Error(`Authentication failed: ${error.message}`);
//   }
// }

// Create GenAI client with Vertex AI configuration
async function createGenAIClient() {
  try {
    // const { authClient } = await initializeAuth();
    
    const genAI = new GoogleGenAI({
      project: config.googleCloudProject,
      location: config.googleCloudLocation,
      // googleAuth: authClient,
      // vertex: true
      vertexai: true
    });

    console.log('✅ GenAI client initialized successfully with Vertex AI');
    return genAI;
  } catch (error) {
    console.error('❌ GenAI client initialization failed:', error);
    throw new Error(`GenAI client initialization failed: ${error.message}`);
  }
}

// Initialize GenAI with error handling and validation
async function initializeGenAI() {
  try {
    // Validate required configuration
    if (!config.googleCloudProject || config.googleCloudProject === 'your-project-name') {
      throw new Error('GOOGLE_CLOUD_PROJECT must be configured with your actual project ID');
    }

    if (!config.googleCloudLocation) {
      throw new Error('GOOGLE_CLOUD_LOCATION must be configured');
    }

    // Validate model availability
    if (!config.availableModels.includes(config.geminiExtractionModel)) {
      console.warn(`⚠️  WARNING: Extraction model "${config.geminiExtractionModel}" may not be available!`);
      console.warn(`   Available models: ${config.availableModels.join(', ')}`);
    }

    if (!config.availableModels.includes(config.geminiAnalysisModel)) {
      console.warn(`⚠️  WARNING: Analysis model "${config.geminiAnalysisModel}" may not be available!`);
      console.warn(`   Available models: ${config.availableModels.join(', ')}`);
    }

    const genAI = await createGenAIClient();
    
    console.log('🚀 GenAI initialization completed successfully');
    console.log(`📊 Project: ${config.googleCloudProject}`);
    console.log(`📍 Location: ${config.googleCloudLocation}`);
    console.log(`🔍 Extraction Model: ${config.geminiExtractionModel}`);
    console.log(`🧠 Analysis Model: ${config.geminiAnalysisModel}`);
    
    return genAI;
  } catch (error) {
    console.error('❌ GenAI initialization failed:', error);
    throw error;
  }
}

export { 
  // initializeAuth,
  createGenAIClient, 
  initializeGenAI,
};