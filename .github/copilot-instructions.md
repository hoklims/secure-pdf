<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# SecurePDF (SPDF) Development Instructions

This is a secure document format project designed to replace traditional PDF with enhanced security features.

## Project Structure

This is a TypeScript monorepo with the following packages:

- `@secure-pdf/core`: Core parser and generator for SPDF documents
- `@secure-pdf/crypto`: Cryptographic operations (signatures, encryption, hashing)
- `@secure-pdf/validator`: Document validation and security checks
- `@secure-pdf/viewer`: React-based secure document viewer

## Security Requirements

When working on this project, always prioritize security:

1. **No Code Execution**: Never implement features that allow arbitrary code execution
2. **Input Validation**: Always validate and sanitize all inputs
3. **Cryptographic Standards**: Use only approved algorithms (AES-256-GCM, RSA-PSS, SHA-3)
4. **Content Security**: Strictly validate document content and structure
5. **Audit Trail**: Maintain immutable modification history

## Code Guidelines

- Use TypeScript with strict mode enabled
- Follow security-first development practices
- Implement comprehensive error handling
- Add detailed JSDoc comments for all public APIs
- Write unit tests for all security-critical functions
- Use ESM modules throughout the project

## Testing Requirements

- All cryptographic functions must have comprehensive tests
- Document validation must be thoroughly tested
- Security vulnerabilities should be tested with fuzzing
- Performance tests for large documents

## Documentation

- Keep the SPDF specification up to date
- Document all security considerations
- Provide clear examples for all APIs
- Maintain security audit trail

When suggesting code, prioritize security, correctness, and performance in that order.
