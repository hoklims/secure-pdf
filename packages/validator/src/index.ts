import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { spdfSchema } from './schemas/spdf-schema.js';

/**
 * Document validation for SPDF format
 * Ensures security compliance and format integrity
 */
export class SpdfValidator {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    this.ajv.addSchema(spdfSchema, 'spdf');
  }

  /**
   * Validate complete SPDF document structure
   */
  async validateDocument(document: any): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Schema validation
    const isValidSchema = this.ajv.validate('spdf', document);
    if (!isValidSchema && this.ajv.errors) {
      errors.push(...this.ajv.errors.map(err => `Schema error: ${err.instancePath} ${err.message}`));
    }

    // Security validation
    const securityErrors = await this.validateSecurity(document);
    errors.push(...securityErrors);

    // Content validation
    const contentErrors = await this.validateContent(document);
    errors.push(...contentErrors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate security configuration
   */
  private async validateSecurity(document: any): Promise<string[]> {
    const errors: string[] = [];

    if (!document.security) {
      errors.push('Missing security configuration');
      return errors;
    }

    // Validate encryption
    if (!document.security.encryption) {
      errors.push('Missing encryption configuration');
    } else {
      const enc = document.security.encryption;
      if (enc.algorithm !== 'AES-256-GCM') {
        errors.push('Invalid encryption algorithm. Only AES-256-GCM is allowed');
      }
      if (enc.iterations < 100000) {
        errors.push('Insufficient PBKDF2 iterations. Minimum 100,000 required');
      }
    }

    // Validate signature
    if (!document.security.signature) {
      errors.push('Missing digital signature');
    } else {
      const sig = document.security.signature;
      if (sig.algorithm !== 'RSA-PSS') {
        errors.push('Invalid signature algorithm. Only RSA-PSS is allowed');
      }
      if (sig.hash_algorithm !== 'SHA3-256') {
        errors.push('Invalid hash algorithm. Only SHA3-256 is allowed');
      }
      if (!sig.certificate || !sig.signature) {
        errors.push('Missing certificate or signature data');
      }
    }

    return errors;
  }

  /**
   * Validate document content
   */
  private async validateContent(document: any): Promise<string[]> {
    const errors: string[] = [];

    if (!document.content || !document.content.pages) {
      errors.push('Missing document content or pages');
      return errors;
    }

    // Validate pages
    for (let i = 0; i < document.content.pages.length; i++) {
      const page = document.content.pages[i];
      const pageErrors = await this.validatePage(page, i);
      errors.push(...pageErrors);
    }

    // Validate forms if present
    if (document.content.forms) {
      const formErrors = await this.validateForms(document.content.forms);
      errors.push(...formErrors);
    }

    return errors;
  }

  /**
   * Validate individual page
   */
  private async validatePage(page: any, pageIndex: number): Promise<string[]> {
    const errors: string[] = [];

    if (!page.id || typeof page.id !== 'string') {
      errors.push(`Page ${pageIndex}: Missing or invalid page ID`);
    }

    if (typeof page.width !== 'number' || page.width <= 0) {
      errors.push(`Page ${pageIndex}: Invalid page width`);
    }

    if (typeof page.height !== 'number' || page.height <= 0) {
      errors.push(`Page ${pageIndex}: Invalid page height`);
    }

    if (!Array.isArray(page.elements)) {
      errors.push(`Page ${pageIndex}: Missing or invalid elements array`);
      return errors;
    }

    // Validate elements
    for (let i = 0; i < page.elements.length; i++) {
      const element = page.elements[i];
      const elementErrors = await this.validateElement(element, pageIndex, i);
      errors.push(...elementErrors);
    }

    return errors;
  }

  /**
   * Validate page element
   */
  private async validateElement(element: any, pageIndex: number, elementIndex: number): Promise<string[]> {
    const errors: string[] = [];
    const prefix = `Page ${pageIndex}, Element ${elementIndex}`;

    // Validate element type
    if (!['text', 'image', 'form'].includes(element.type)) {
      errors.push(`${prefix}: Invalid element type '${element.type}'`);
    }

    // Validate required fields
    if (!element.id || typeof element.id !== 'string') {
      errors.push(`${prefix}: Missing or invalid element ID`);
    }

    if (typeof element.x !== 'number' || typeof element.y !== 'number') {
      errors.push(`${prefix}: Invalid position coordinates`);
    }

    if (typeof element.width !== 'number' || element.width <= 0 ||
        typeof element.height !== 'number' || element.height <= 0) {
      errors.push(`${prefix}: Invalid dimensions`);
    }

    // Type-specific validation
    if (element.type === 'text') {
      if (!element.content || typeof element.content !== 'string') {
        errors.push(`${prefix}: Missing or invalid text content`);
      }
      if (element.style) {
        const styleErrors = this.validateTextStyle(element.style, prefix);
        errors.push(...styleErrors);
      }
    } else if (element.type === 'image') {
      if (!element.data || typeof element.data !== 'string') {
        errors.push(`${prefix}: Missing or invalid image data`);
      }
      if (!['PNG', 'JPEG', 'WebP'].includes(element.format)) {
        errors.push(`${prefix}: Invalid image format '${element.format}'`);
      }
      if (element.alt && typeof element.alt !== 'string') {
        errors.push(`${prefix}: Invalid alt text`);
      }
    }

    return errors;
  }

  /**
   * Validate text style
   */
  private validateTextStyle(style: any, prefix: string): string[] {
    const errors: string[] = [];

    if (style.font && typeof style.font !== 'string') {
      errors.push(`${prefix}: Invalid font`);
    }

    if (style.size && (typeof style.size !== 'number' || style.size <= 0)) {
      errors.push(`${prefix}: Invalid font size`);
    }

    if (style.color && typeof style.color !== 'string') {
      errors.push(`${prefix}: Invalid color`);
    }

    if (style.bold !== undefined && typeof style.bold !== 'boolean') {
      errors.push(`${prefix}: Invalid bold value`);
    }

    if (style.italic !== undefined && typeof style.italic !== 'boolean') {
      errors.push(`${prefix}: Invalid italic value`);
    }

    return errors;
  }

  /**
   * Validate forms
   */
  private async validateForms(forms: any): Promise<string[]> {
    const errors: string[] = [];

    if (!Array.isArray(forms.fields)) {
      errors.push('Forms: Invalid fields array');
      return errors;
    }

    for (let i = 0; i < forms.fields.length; i++) {
      const field = forms.fields[i];
      const fieldErrors = this.validateFormField(field, i);
      errors.push(...fieldErrors);
    }

    return errors;
  }

  /**
   * Validate form field
   */
  private validateFormField(field: any, fieldIndex: number): string[] {
    const errors: string[] = [];
    const prefix = `Form field ${fieldIndex}`;

    if (!field.id || typeof field.id !== 'string') {
      errors.push(`${prefix}: Missing or invalid field ID`);
    }

    if (!['text', 'checkbox', 'radio', 'select'].includes(field.type)) {
      errors.push(`${prefix}: Invalid field type '${field.type}'`);
    }

    if (!field.name || typeof field.name !== 'string') {
      errors.push(`${prefix}: Missing or invalid field name`);
    }

    if (typeof field.page !== 'number' || field.page < 0) {
      errors.push(`${prefix}: Invalid page reference`);
    }

    if (typeof field.x !== 'number' || typeof field.y !== 'number' ||
        typeof field.width !== 'number' || typeof field.height !== 'number') {
      errors.push(`${prefix}: Invalid field dimensions`);
    }

    if (typeof field.required !== 'boolean') {
      errors.push(`${prefix}: Invalid required value`);
    }

    // Validate field validation rules
    if (field.validation) {
      const validationErrors = this.validateFieldValidation(field.validation, prefix);
      errors.push(...validationErrors);
    }

    return errors;
  }

  /**
   * Validate field validation rules
   */
  private validateFieldValidation(validation: any, prefix: string): string[] {
    const errors: string[] = [];

    if (!validation.type || typeof validation.type !== 'string') {
      errors.push(`${prefix}: Missing or invalid validation type`);
    }

    if (validation.max_length !== undefined && 
        (typeof validation.max_length !== 'number' || validation.max_length <= 0)) {
      errors.push(`${prefix}: Invalid max_length`);
    }

    if (validation.pattern !== undefined && typeof validation.pattern !== 'string') {
      errors.push(`${prefix}: Invalid pattern`);
    }

    if (validation.options !== undefined && !Array.isArray(validation.options)) {
      errors.push(`${prefix}: Invalid options array`);
    }

    return errors;
  }

  /**
   * Validate image data and format
   */
  async validateImage(imageData: Buffer, format: string): Promise<void> {
    // Check format
    if (!['PNG', 'JPEG', 'WebP'].includes(format)) {
      throw new Error(`Unsupported image format: ${format}`);
    }

    // Check size limits
    if (imageData.length > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('Image size exceeds maximum limit of 50MB');
    }

    // Basic format validation by checking magic bytes
    const magicBytes = imageData.slice(0, 8);
    
    if (format === 'PNG' && !this.isPNG(magicBytes)) {
      throw new Error('Invalid PNG format');
    } else if (format === 'JPEG' && !this.isJPEG(magicBytes)) {
      throw new Error('Invalid JPEG format');
    } else if (format === 'WebP' && !this.isWebP(magicBytes)) {
      throw new Error('Invalid WebP format');
    }
  }

  /**
   * Check if data is PNG format
   */
  private isPNG(data: Buffer): boolean {
    return data.length >= 8 &&
           data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47 &&
           data[4] === 0x0D && data[5] === 0x0A && data[6] === 0x1A && data[7] === 0x0A;
  }

  /**
   * Check if data is JPEG format
   */
  private isJPEG(data: Buffer): boolean {
    return data.length >= 2 &&
           data[0] === 0xFF && data[1] === 0xD8;
  }

  /**
   * Check if data is WebP format
   */
  private isWebP(data: Buffer): boolean {
    return data.length >= 12 &&
           data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46 &&
           data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50;
  }
}

export * from './schemas/spdf-schema.js';
