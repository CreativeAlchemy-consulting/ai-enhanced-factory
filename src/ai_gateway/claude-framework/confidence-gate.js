const StructuredLogger = require('./logger');

class ConfidenceGate {
  constructor(loggerInstance = null) {
    this.logger = loggerInstance || new StructuredLogger();
    this.uncertaintyKeywords = [
      "i'm not sure",
      "need more information", 
      "could you clarify",
      "not certain",
      "might be",
      "perhaps",
      "unclear",
      "ambiguous",
      "cannot determine",
      "insufficient information",
      "unable to",
      "don't know",
      "unsure"
    ];
    
    this.errorCodes = {
      ERR_KEYWORD_UNCERTAINTY: 'Uncertainty keyword detected in response',
      ERR_JSON_PARSE: 'Response is not valid JSON',
      ERR_SCHEMA_VALIDATION: 'Response failed schema validation',
      ERR_EMPTY_RESPONSE: 'Response is empty or null',
      ERR_CONFIDENCE_THRESHOLD: 'Confidence level below threshold'
    };
  }

  generateOperationId() {
    return `mcp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  detectUncertainty(response) {
    if (!response || typeof response !== 'string') {
      return {
        detected: true,
        reason: this.errorCodes.ERR_EMPTY_RESPONSE,
        errorCode: 'ERR_EMPTY_RESPONSE'
      };
    }

    const lowerResponse = response.toLowerCase();
    
    for (const keyword of this.uncertaintyKeywords) {
      if (lowerResponse.includes(keyword)) {
        return {
          detected: true,
          reason: `${this.errorCodes.ERR_KEYWORD_UNCERTAINTY}: "${keyword}"`,
          errorCode: 'ERR_KEYWORD_UNCERTAINTY',
          keyword
        };
      }
    }

    return { detected: false };
  }

  validateJsonResponse(response) {
    try {
      const parsed = JSON.parse(response);
      return { valid: true, data: parsed };
    } catch (error) {
      return {
        valid: false,
        reason: this.errorCodes.ERR_JSON_PARSE,
        errorCode: 'ERR_JSON_PARSE',
        error: error.message
      };
    }
  }

  validateSchema(data, schema) {
    // Basic schema validation - can be extended with Joi/Yup
    if (!schema) return { valid: true };
    
    for (const [key, type] of Object.entries(schema)) {
      if (!(key in data)) {
        return {
          valid: false,
          reason: `Missing required field: ${key}`,
          errorCode: 'ERR_SCHEMA_VALIDATION'
        };
      }
      
      if (typeof data[key] !== type) {
        return {
          valid: false,
          reason: `Invalid type for field ${key}: expected ${type}, got ${typeof data[key]}`,
          errorCode: 'ERR_SCHEMA_VALIDATION'
        };
      }
    }
    
    return { valid: true };
  }

  async evaluateResponse(rawResponse, context = {}, expectedSchema = null, operationId = null) {
    const opId = operationId || this.generateOperationId();
    
    // 1. Check for uncertainty keywords
    const uncertaintyCheck = this.detectUncertainty(rawResponse);
    if (uncertaintyCheck.detected) {
      const logEntry = this.logger.uncertaintyHalt(
        opId,
        uncertaintyCheck.reason,
        rawResponse,
        {
          ...context,
          error_code: uncertaintyCheck.errorCode,
          keyword: uncertaintyCheck.keyword
        },
        context.source || 'Claude_Code'
      );
      
      return {
        status: "UNCERTAINTY_HALT",
        reason: uncertaintyCheck.reason,
        raw_response: rawResponse,
        operation_id: opId,
        error_code: uncertaintyCheck.errorCode
      };
    }

    // 2. If JSON is expected, validate JSON structure
    if (expectedSchema || context.expectJson) {
      const jsonValidation = this.validateJsonResponse(rawResponse);
      if (!jsonValidation.valid) {
        const logEntry = this.logger.uncertaintyHalt(
          opId,
          jsonValidation.reason,
          rawResponse,
          {
            ...context,
            error_code: jsonValidation.errorCode,
            parse_error: jsonValidation.error
          },
          context.source || 'Claude_Code'
        );
        
        return {
          status: "UNCERTAINTY_HALT",
          reason: jsonValidation.reason,
          raw_response: rawResponse,
          operation_id: opId,
          error_code: jsonValidation.errorCode
        };
      }

      // 3. Validate against schema if provided
      if (expectedSchema) {
        const schemaValidation = this.validateSchema(jsonValidation.data, expectedSchema);
        if (!schemaValidation.valid) {
          const logEntry = this.logger.uncertaintyHalt(
            opId,
            schemaValidation.reason,
            rawResponse,
            {
              ...context,
              error_code: schemaValidation.errorCode,
              expected_schema: expectedSchema
            },
            context.source || 'Claude_Code'
          );
          
          return {
            status: "UNCERTAINTY_HALT",
            reason: schemaValidation.reason,
            raw_response: rawResponse,
            operation_id: opId,
            error_code: schemaValidation.errorCode
          };
        }
      }

      // Success with parsed data
      this.logger.success(opId, context, context.source || 'Claude_Code');
      return {
        status: "SUCCESS",
        data: jsonValidation.data,
        operation_id: opId
      };
    }

    // Success with raw response
    this.logger.success(opId, context, context.source || 'Claude_Code');
    return {
      status: "SUCCESS",
      data: rawResponse,
      operation_id: opId
    };
  }

  addUncertaintyKeyword(keyword) {
    if (!this.uncertaintyKeywords.includes(keyword.toLowerCase())) {
      this.uncertaintyKeywords.push(keyword.toLowerCase());
    }
  }

  removeUncertaintyKeyword(keyword) {
    const index = this.uncertaintyKeywords.indexOf(keyword.toLowerCase());
    if (index > -1) {
      this.uncertaintyKeywords.splice(index, 1);
    }
  }

  getStats() {
    const uncertaintyHalts = this.logger.getUncertaintyHalts();
    const totalHalts = uncertaintyHalts.length;
    
    const errorCodeCounts = uncertaintyHalts.reduce((acc, halt) => {
      const errorCode = halt.context?.error_code || 'UNKNOWN';
      acc[errorCode] = (acc[errorCode] || 0) + 1;
      return acc;
    }, {});

    return {
      total_uncertainty_halts: totalHalts,
      error_code_distribution: errorCodeCounts,
      configured_keywords: this.uncertaintyKeywords.length
    };
  }
}

module.exports = ConfidenceGate;