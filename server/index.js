import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initializeGenAI } from './config/genaiClient.js';
import { config } from './config/setup.js';
// Initialize GenAI client

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const genAI = await initializeGenAI();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
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
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  }
});

// Helper function to convert file to Gemini format
async function fileToGenerativePart(filePath, mimeType) {
  const fileData = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: fileData.toString('base64'),
      mimeType: mimeType,
    },
  };
}

function logUsage(result) {
  console.log('=========== llm usage ==========');
  const logpayload  = {
    candidatesTokenCount: result?.usageMetadata?.candidatesTokenCount || '-',
    promptTokenCount: result?.usageMetadata?.promptTokenCount || '-',
    thoughtsTokenCount: result?.usageMetadata?.thoughtsTokenCount || '-',
    totalTokenCount: result?.usageMetadata?.totalTokenCount || '-',
  } ;
  console.log(logpayload);
}

async function generateWithRetry(client, params, maxRetries = 3, delayMs = 1000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const result = await client.models.generateContent(params);
      logUsage(result);
      return result; // Success, return result
    } catch (err) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, err.message);

      if (attempt >= maxRetries) {
        throw new Error(`All ${maxRetries} attempts failed: ${err.message}`);
      }

      // Optional: simple delay between retries
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
}

// Helper function to extract text from the new response structure
function extractTextFromResponse(response) {
  try {
    // Try new structure with candidates array
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      
      // Try content.parts structure
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text;
      }
      
      // Try direct text property on candidate
      if (candidate.text) {
        return candidate.text;
      }
    }
    
    // Fallback to old structure
    if (response.text) {
      return response.text;
    }
    
    // If none of the above work, log the structure for debugging
    console.error('❌ Could not extract text from response. Response structure:', JSON.stringify(response, null, 2));
    throw new Error('Could not extract text from response - unexpected structure');
    
  } catch (error) {
    console.error('❌ Error extracting text from response:', error);
    console.error('Response object:', JSON.stringify(response, null, 2));
    throw error;
  }
}

// Helper function to generate object schema description
function generateObjectSchemaDescription(objectSchema) {
  return objectSchema.map(field => {
    const typeHint = field.type === 'number' ? ' (number)' : 
                    field.type === 'boolean' ? ' (true/false)' : 
                    field.type === 'date' ? ' (YYYY-MM-DD format)' : 
                    ' (text)';
    
    return `    - "${field.name}": ${field.description}${typeHint}`;
  }).join('\n');
}

// Helper function to generate custom extraction prompt with confidence levels
function generateCustomPrompt(customFields) {
  const fieldDescriptions = customFields.map(field => {
    let typeHint = '';
    let description = field.description;
    
    switch (field.type) {
      case 'array':
        typeHint = ' (return as array of strings)';
        break;
      case 'number':
        typeHint = ' (return as number)';
        break;
      case 'boolean':
        typeHint = ' (return as true/false)';
        break;
      case 'date':
        typeHint = ' (return in YYYY-MM-DD format)';
        break;
      case 'array_object':
        if (field.objectSchema && field.objectSchema.length > 0) {
          typeHint = ' (return as array of objects with the following structure)';
          description += ':\n' + generateObjectSchemaDescription(field.objectSchema);
        } else {
          typeHint = ' (return as array of objects)';
        }
        break;
      default:
        typeHint = ' (return as text)';
    }
    
    return `"${field.name}": ${description}${typeHint}`;
  }).join('\n\n');

  return `
    Please extract specific data from this document and return it as a valid JSON object with confidence levels.
    
    Extract the following fields:
    ${fieldDescriptions}
    
    CRITICAL REQUIREMENTS:
    1. Return a JSON object with TWO main sections: "data" and "confidence"
    2. The "data" section contains the extracted values
    3. The "confidence" section contains confidence levels (0-100) for each field
    4. Estimate a realistic confidence levels based on the following factors:
       - Text clarity or ambiguity (e.g., numbers are partially missing, characters are unclear)
       - Common patterns (e.g., date format, currency format)
       - Field positioning or labeling consistency
    5. For tabular data, estimate the confidence levels for each row and each field (cell) 
    6. Confidence levels should reflect how certain you are about each extracted value:
       - 90-100: Very confident, data clearly present and unambiguous
       - 70-89: Confident, data present but may have minor ambiguity
       - 50-69: Moderately confident, data inferred or partially clear
       - 30-49: Low confidence, data unclear or heavily inferred
       - 0-29: Very low confidence, data missing or highly uncertain
    
    Data Extraction Rules:
    - If a field cannot be found, use null as the value and set confidence to 0
    - For array fields, return an empty array [] if no data is found
    - For boolean fields, return true/false based on the content
    - For date fields, use YYYY-MM-DD format
    - For number fields, return actual numbers, not strings
    - For array_object fields, return an array of objects with the specified structure
    - Each object in array_object should also have confidence levels for its properties
    
    Confidence Assessment Guidelines:
    - Base confidence on clarity, explicitness, and context of the information
    - Consider document quality, text clarity, and data completeness
    - Be honest about uncertainty - it's better to report low confidence than guess
    - For array_object fields, provide confidence for each object's properties
    
    Response Format:
    {
      "data": {
        "field1": "extracted_value",
        "field2": ["array", "values"],
        "field3": [
          {
            "property1": "value1",
            "property2": "value2"
          }
        ]
      },
      "confidence": {
        "field1": 85,
        "field2": 92,
        "field3": [
          {
            "property1": 78,
            "property2": 90
          }
        ]
      }
    }
    
    IMPORTANT: 
    - Return ONLY the JSON object, no explanatory text
    - Ensure the JSON is properly formatted and parseable
    - Confidence levels must be integers between 0-100
    - Confidence levels for tabular data, Do not assume same confidence across rows or columns. Assess each cell individually
    - Every data field must have a corresponding confidence level
    - For array_object fields, confidence structure must match data structure
  `;
}

// Helper function to validate confidence structure
function validateConfidenceStructure(data, confidence) {
  const errors = [];
  
  function validateRecursive(dataObj, confidenceObj, path = '') {
    for (const key in dataObj) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in confidenceObj)) {
        errors.push(`Missing confidence for field: ${currentPath}`);
        continue;
      }
      
      const dataValue = dataObj[key];
      const confidenceValue = confidenceObj[key];
      
      if (Array.isArray(dataValue)) {
        if (dataValue.length > 0 && typeof dataValue[0] === 'object' && dataValue[0] !== null) {
          // Array of objects
          if (!Array.isArray(confidenceValue)) {
            errors.push(`Confidence for ${currentPath} should be an array of objects`);
          } else {
            dataValue.forEach((item, index) => {
              if (confidenceValue[index]) {
                validateRecursive(item, confidenceValue[index], `${currentPath}[${index}]`);
              } else {
                errors.push(`Missing confidence for ${currentPath}[${index}]`);
              }
            });
          }
        } else {
          // Simple array
          if (typeof confidenceValue !== 'number' || confidenceValue < 0 || confidenceValue > 100) {
            errors.push(`Invalid confidence value for ${currentPath}: must be 0-100`);
          }
        }
      } else if (typeof dataValue === 'object' && dataValue !== null) {
        // Nested object
        if (typeof confidenceValue !== 'object' || Array.isArray(confidenceValue)) {
          errors.push(`Confidence for ${currentPath} should be an object`);
        } else {
          validateRecursive(dataValue, confidenceValue, currentPath);
        }
      } else {
        // Simple value
        if (typeof confidenceValue !== 'number' || confidenceValue < 0 || confidenceValue > 100) {
          errors.push(`Invalid confidence value for ${currentPath}: must be 0-100`);
        }
      }
    }
  }
  
  validateRecursive(data, confidence);
  return errors;
}

// Helper function to parse JSON from AI response
function parseJsonFromResponse(response) {
  try {
    // Try to parse the response directly
    return JSON.parse(response);
  } catch (error) {
    // If direct parsing fails, try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        console.error('Failed to parse extracted JSON:', innerError);
        return null;
      }
    }
    console.error('No JSON found in response:', response);
    return null;
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Document extraction server is running',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

app.get('/api/supported-types', (req, res) => {
  const supportedTypes = [
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
  
  res.json({ supportedTypes });
});

app.post('/api/extract', upload.single('document'), async (req, res) => {
  try {
    // if (!process.env.GEMINI_API_KEY) {
    //   return res.status(500).json({
    //     error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.'
    //   });
    // }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded. Please select a document to process.'
      });
    }
    console.log(req.body);
    const { extractionType , customFields } = req.body;
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    try {
      const fileData = await fileToGenerativePart(filePath, mimeType);
      
      let prompt;
      let isCustomExtraction = false;
      if (extractionType === 'custom' && customFields) {
        const fields = JSON.parse(customFields);
        prompt = generateCustomPrompt(fields);
        isCustomExtraction = true;
      } else if (extractionType === 'extract') {
        prompt = `
          Please extract and organize all text content from this document. 
          Provide a clean, well-structured output that maintains the original formatting and hierarchy.
          If there are tables, lists, or structured data, preserve that structure in your response.
          Focus on accuracy and readability.
          
          Additionally, provide an overall confidence level (0-100) for the extraction quality based on:
          - Document clarity and readability
          - Text quality and completeness
          - Structural preservation accuracy
          
          Format your response as:
          CONFIDENCE: [level]
          
          EXTRACTED CONTENT:
          [your extracted content here]
        `;
      } else {
        prompt = `
          Please analyze this document and provide:
          1. A brief summary of the content
          2. Key topics or themes identified
          3. Document type/category
          4. Any important data points or insights
          5. The extracted text content
          
          Format your response in a clear, organized manner with proper headings and structure.
          
          Additionally, provide an overall confidence level (0-100) for the analysis quality based on:
          - Document clarity and completeness
          - Analysis accuracy and depth
          - Content comprehension level
          
          Start your response with:
          CONFIDENCE: [level]
          
          ANALYSIS:
          [your analysis here]
        `;
      }

      // const result = await model.generateContent([prompt, fileData]);
      const params = {
        model: config.geminiExtractionModel,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              fileData
            ]
          }
        ],
        generationConfig: config.geminiExtractionModel,
        config: {
          thinkingConfig: {
            thinkingBudget: 1024,
          },
        },
      };
      const result = await generateWithRetry(genAI, params, 3, 1000); // 3 retries, 1s delay
      
      // const response = await result.response;
      const response = extractTextFromResponse(result);
      // const extractedContent = response.text();

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      const responseData = {
        success: true,
        content: response,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: mimeType,
        extractionType: extractionType
      };

      // If this was a custom extraction, try to parse JSON
      if (isCustomExtraction) {
        const jsonData = parseJsonFromResponse(response);
        if (jsonData && jsonData.data && jsonData.confidence) {
          // Validate confidence structure
          const validationErrors = validateConfidenceStructure(jsonData.data, jsonData.confidence);
          
          if (validationErrors.length === 0) {
            responseData.jsonData = jsonData.data;
            responseData.confidence = jsonData.confidence;
            responseData.hasConfidence = true;
          } else {
            console.warn('Confidence validation errors:', validationErrors);
            responseData.jsonData = jsonData.data || jsonData;
            responseData.confidence = jsonData.confidence;
            responseData.hasConfidence = true;
            responseData.confidenceWarnings = validationErrors;
          }
        } else {
          // Fallback: try to parse as simple JSON without confidence
          const simpleJson = parseJsonFromResponse(extractedContent);
          if (simpleJson) {
            responseData.jsonData = simpleJson;
            responseData.hasConfidence = false;
            responseData.jsonParseError = 'AI did not provide confidence levels';
          } else {
            responseData.jsonParseError = 'Failed to parse JSON from AI response';
            responseData.hasConfidence = false;
          }
        }
      } else {
        // For non-custom extractions, try to extract confidence score
        const confidenceMatch = extractedContent.match(/CONFIDENCE:\s*(\d+)/i);
        if (confidenceMatch) {
          responseData.overallConfidence = parseInt(confidenceMatch[1]);
          responseData.hasConfidence = true;
          // Remove confidence line from content
          responseData.content = extractedContent.replace(/CONFIDENCE:\s*\d+\s*/i, '').trim();
        }
      }
      console.log(responseData);
      res.json(responseData);
    } catch (geminiError) {
      // Clean up uploaded file on error
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      console.error('Gemini API Error:', geminiError);
      res.status(500).json({
        error: 'Failed to process document with Gemini AI. Please try again.',
        details: geminiError.message
      });
    }

  } catch (error) {
    console.error('Server Error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File size too large. Please select a file smaller than 10MB.'
        });
      }
      return res.status(400).json({
        error: 'File upload error: ' + error.message
      });
    }
    
    res.status(500).json({
      error: 'Internal server error. Please try again.',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled Error:', error);
  res.status(500).json({
    error: 'Something went wrong!',
    details: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Document extraction server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Gemini API configured: ${!!process.env.GEMINI_API_KEY}`);
});