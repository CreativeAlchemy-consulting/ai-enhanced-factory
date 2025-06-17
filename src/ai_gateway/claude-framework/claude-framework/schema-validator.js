class SchemaValidator {
  constructor() {
    this.errorCodes = {
      ERR_MISSING_FIELD: 'Required field is missing',
      ERR_INVALID_TYPE: 'Field has invalid type',
      ERR_INVALID_VALUE: 'Field has invalid value',
      ERR_ARRAY_VALIDATION: 'Array validation failed',
      ERR_OBJECT_VALIDATION: 'Object validation failed',
      ERR_CUSTOM_VALIDATION: 'Custom validation failed'
    };
  }

  validateField(value, fieldSchema, fieldName) {
    const errors = [];

    // Check if field is required
    if (fieldSchema.required && (value === undefined || value === null)) {
      errors.push({
        field: fieldName,
        error_code: 'ERR_MISSING_FIELD',
        message: `Required field '${fieldName}' is missing`
      });
      return errors;
    }

    // Skip further validation if field is not required and not present
    if (value === undefined || value === null) {
      return errors;
    }

    // Type validation
    if (fieldSchema.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== fieldSchema.type) {
        errors.push({
          field: fieldName,
          error_code: 'ERR_INVALID_TYPE',
          message: `Field '${fieldName}' expected type '${fieldSchema.type}', got '${actualType}'`
        });
        return errors; // Don't continue if type is wrong
      }
    }

    // Enum validation
    if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
      errors.push({
        field: fieldName,
        error_code: 'ERR_INVALID_VALUE',
        message: `Field '${fieldName}' must be one of: ${fieldSchema.enum.join(', ')}`
      });
    }

    // String validations
    if (fieldSchema.type === 'string') {
      if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
        errors.push({
          field: fieldName,
          error_code: 'ERR_INVALID_VALUE',
          message: `Field '${fieldName}' must be at least ${fieldSchema.minLength} characters`
        });
      }
      
      if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
        errors.push({
          field: fieldName,
          error_code: 'ERR_INVALID_VALUE',
          message: `Field '${fieldName}' must be at most ${fieldSchema.maxLength} characters`
        });
      }

      if (fieldSchema.pattern && !new RegExp(fieldSchema.pattern).test(value)) {
        errors.push({
          field: fieldName,
          error_code: 'ERR_INVALID_VALUE',
          message: `Field '${fieldName}' does not match required pattern`
        });
      }
    }

    // Number validations
    if (fieldSchema.type === 'number') {
      if (fieldSchema.min !== undefined && value < fieldSchema.min) {
        errors.push({
          field: fieldName,
          error_code: 'ERR_INVALID_VALUE',
          message: `Field '${fieldName}' must be at least ${fieldSchema.min}`
        });
      }
      
      if (fieldSchema.max !== undefined && value > fieldSchema.max) {
        errors.push({
          field: fieldName,
          error_code: 'ERR_INVALID_VALUE',
          message: `Field '${fieldName}' must be at most ${fieldSchema.max}`
        });
      }
    }

    // Array validations
    if (fieldSchema.type === 'array') {
      if (fieldSchema.minItems && value.length < fieldSchema.minItems) {
        errors.push({
          field: fieldName,
          error_code: 'ERR_ARRAY_VALIDATION',
          message: `Array '${fieldName}' must have at least ${fieldSchema.minItems} items`
        });
      }
      
      if (fieldSchema.maxItems && value.length > fieldSchema.maxItems) {
        errors.push({
          field: fieldName,
          error_code: 'ERR_ARRAY_VALIDATION',
          message: `Array '${fieldName}' must have at most ${fieldSchema.maxItems} items`
        });
      }

      // Validate array items
      if (fieldSchema.items) {
        value.forEach((item, index) => {
          const itemErrors = this.validateField(item, fieldSchema.items, `${fieldName}[${index}]`);
          errors.push(...itemErrors);
        });
      }
    }

    // Object validation
    if (fieldSchema.type === 'object' && fieldSchema.properties) {
      const objectErrors = this.validate(value, { properties: fieldSchema.properties });
      errors.push(...objectErrors.map(err => ({
        ...err,
        field: `${fieldName}.${err.field}`
      })));
    }

    // Custom validation function
    if (fieldSchema.validate && typeof fieldSchema.validate === 'function') {
      try {
        const customResult = fieldSchema.validate(value);
        if (customResult !== true) {
          errors.push({
            field: fieldName,
            error_code: 'ERR_CUSTOM_VALIDATION',
            message: customResult || `Custom validation failed for field '${fieldName}'`
          });
        }
      } catch (error) {
        errors.push({
          field: fieldName,
          error_code: 'ERR_CUSTOM_VALIDATION',
          message: `Custom validation error for field '${fieldName}': ${error.message}`
        });
      }
    }

    return errors;
  }

  validate(data, schema) {
    const errors = [];

    if (!schema.properties) {
      return errors;
    }

    // Validate each property in schema
    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      const fieldErrors = this.validateField(data[fieldName], fieldSchema, fieldName);
      errors.push(...fieldErrors);
    }

    // Check for unexpected properties if strict mode is enabled
    if (schema.strict) {
      const allowedFields = Object.keys(schema.properties);
      const dataFields = Object.keys(data);
      const unexpectedFields = dataFields.filter(field => !allowedFields.includes(field));
      
      unexpectedFields.forEach(field => {
        errors.push({
          field: field,
          error_code: 'ERR_INVALID_FIELD',
          message: `Unexpected field '${field}' in strict mode`
        });
      });
    }

    return errors;
  }

  isValid(data, schema) {
    const errors = this.validate(data, schema);
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

// Common schema definitions
const CommonSchemas = {
  fileOperation: {
    properties: {
      operation: { type: 'string', required: true, enum: ['create', 'read', 'update', 'delete'] },
      path: { type: 'string', required: true, minLength: 1 },
      content: { type: 'string' },
      success: { type: 'boolean', required: true }
    }
  },

  mcpResponse: {
    properties: {
      status: { type: 'string', required: true, enum: ['SUCCESS', 'ERROR', 'UNCERTAINTY_HALT'] },
      data: { type: 'object' },
      error: { type: 'string' },
      operation_id: { type: 'string', required: true }
    }
  },

  logEntry: {
    properties: {
      timestamp: { type: 'string', required: true },
      level: { type: 'string', required: true, enum: ['INFO', 'WARN', 'ERROR'] },
      message: { type: 'string', required: true },
      operation_id: { type: 'string' },
      context: { type: 'object' }
    }
  },

  uncertaintyHalt: {
    properties: {
      operation_id: { type: 'string', required: true },
      status: { type: 'string', required: true, enum: ['UNCERTAINTY_HALT'] },
      reason: { type: 'string', required: true },
      raw_response: { type: 'string', required: true },
      context: { type: 'object', required: true },
      source: { type: 'string', required: true }
    }
  }
};

module.exports = { SchemaValidator, CommonSchemas };