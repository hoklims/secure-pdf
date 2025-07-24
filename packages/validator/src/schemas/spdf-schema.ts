/**
 * JSON Schema for SPDF document format validation
 */
export const spdfSchema = {
  type: "object",
  required: ["spdf", "metadata", "security", "content", "audit_trail"],
  properties: {
    spdf: {
      type: "object",
      required: ["version", "created", "id"],
      properties: {
        version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" },
        created: { type: "string", format: "date-time" },
        id: { type: "string", format: "uuid" }
      }
    },
    metadata: {
      type: "object",
      required: ["title", "author", "subject", "keywords", "permissions"],
      properties: {
        title: { type: "string", maxLength: 200 },
        author: { type: "string", maxLength: 100 },
        subject: { type: "string", maxLength: 300 },
        keywords: {
          type: "array",
          items: { type: "string", maxLength: 50 },
          maxItems: 20
        },
        permissions: {
          type: "object",
          required: ["print", "copy", "modify", "annotate"],
          properties: {
            print: { type: "boolean" },
            copy: { type: "boolean" },
            modify: { type: "boolean" },
            annotate: { type: "boolean" }
          }
        }
      }
    },
    security: {
      type: "object",
      required: ["encryption", "signature", "content_hashes"],
      properties: {
        encryption: {
          type: "object",
          required: ["algorithm", "key_derivation", "salt", "iterations"],
          properties: {
            algorithm: { type: "string", enum: ["AES-256-GCM"] },
            key_derivation: { type: "string", enum: ["PBKDF2"] },
            salt: { type: "string" },
            iterations: { type: "number", minimum: 100000 }
          }
        },
        signature: {
          type: "object",
          required: ["algorithm", "hash_algorithm", "certificate", "signature", "timestamp"],
          properties: {
            algorithm: { type: "string", enum: ["RSA-PSS"] },
            hash_algorithm: { type: "string", enum: ["SHA3-256"] },
            certificate: { type: "string" },
            signature: { type: "string" },
            timestamp: { type: "string", format: "date-time" }
          }
        },
        content_hashes: {
          type: "object",
          required: ["text", "images", "forms"],
          properties: {
            text: { type: "string" },
            images: {
              type: "array",
              items: { type: "string" }
            },
            forms: { type: "string" }
          }
        }
      }
    },
    content: {
      type: "object",
      required: ["pages"],
      properties: {
        pages: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            required: ["id", "width", "height", "elements"],
            properties: {
              id: { type: "string", format: "uuid" },
              width: { type: "number", minimum: 1 },
              height: { type: "number", minimum: 1 },
              elements: {
                type: "array",
                items: {
                  type: "object",
                  required: ["type", "id", "x", "y", "width", "height"],
                  properties: {
                    type: { type: "string", enum: ["text", "image", "form"] },
                    id: { type: "string", format: "uuid" },
                    x: { type: "number" },
                    y: { type: "number" },
                    width: { type: "number", minimum: 1 },
                    height: { type: "number", minimum: 1 },
                    content: { type: "string" },
                    data: { type: "string" },
                    format: { type: "string", enum: ["PNG", "JPEG", "WebP"] },
                    alt: { type: "string", maxLength: 200 },
                    style: {
                      type: "object",
                      properties: {
                        font: { type: "string", maxLength: 50 },
                        size: { type: "number", minimum: 1, maximum: 200 },
                        color: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
                        bold: { type: "boolean" },
                        italic: { type: "boolean" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        forms: {
          type: "object",
          properties: {
            fields: {
              type: "array",
              items: {
                type: "object",
                required: ["id", "type", "name", "page", "x", "y", "width", "height", "required", "validation"],
                properties: {
                  id: { type: "string", format: "uuid" },
                  type: { type: "string", enum: ["text", "checkbox", "radio", "select"] },
                  name: { type: "string", maxLength: 100 },
                  page: { type: "number", minimum: 0 },
                  x: { type: "number" },
                  y: { type: "number" },
                  width: { type: "number", minimum: 1 },
                  height: { type: "number", minimum: 1 },
                  required: { type: "boolean" },
                  validation: {
                    type: "object",
                    required: ["type"],
                    properties: {
                      type: { type: "string" },
                      max_length: { type: "number", minimum: 1 },
                      pattern: { type: "string" },
                      options: {
                        type: "array",
                        items: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    audit_trail: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["timestamp", "action", "user", "previous_hash", "hash"],
        properties: {
          timestamp: { type: "string", format: "date-time" },
          action: { type: "string", maxLength: 50 },
          user: { type: "string" },
          previous_hash: { type: ["string", "null"] },
          hash: { type: "string" }
        }
      }
    }
  }
};
