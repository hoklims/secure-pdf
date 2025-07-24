# Contributing to SecurePDF

We welcome contributions to the SecurePDF project! This document provides guidelines for contributing.

## 🤝 How to Contribute

### 1. Fork the Repository
```bash
git clone https://github.com/YOUR_USERNAME/secure-pdf.git
cd secure-pdf
```

### 2. Set Up Development Environment
```bash
npm install
npm run build
npm test
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/your-feature-name
```

### 4. Make Your Changes
- Follow our coding standards
- Add tests for new features
- Update documentation as needed

### 5. Submit a Pull Request
- Write a clear description
- Reference any related issues
- Ensure all tests pass

## 🛡️ Security-First Development

This project prioritizes security above all else. When contributing:

### ✅ Do:
- Always validate inputs
- Use approved cryptographic algorithms
- Write comprehensive tests for security features
- Document security considerations
- Follow OWASP guidelines

### ❌ Don't:
- Introduce code execution capabilities
- Use deprecated crypto algorithms
- Skip security reviews
- Ignore input validation

## 📝 Coding Standards

### TypeScript Guidelines
- Use strict mode (`"strict": true`)
- Prefer explicit types over `any`
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Security Guidelines
- All crypto functions must have unit tests
- Use only approved algorithms:
  - **Encryption**: AES-256-GCM
  - **Signatures**: RSA-PSS
  - **Hashing**: SHA-3-256
  - **Key Derivation**: PBKDF2 (100k+ iterations)

### Testing Requirements
- Minimum 90% code coverage for crypto modules
- Security tests for all validation functions
- Performance tests for large documents
- Fuzzing tests for parser components

## 🐛 Bug Reports

When reporting bugs, please include:

1. **SPDF document** that demonstrates the issue (if applicable)
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, Node.js version, browser)
5. **Security implications** if any

### Security Vulnerabilities

**DO NOT** open public issues for security vulnerabilities.
Instead, email: `security@secure-pdf.org`

## 💡 Feature Requests

We welcome ideas for new features! Please:

1. Check existing issues first
2. Describe the use case clearly
3. Consider security implications
4. Propose implementation approach

### Priority Features
- PDF to SPDF converters
- Additional signature algorithms
- Mobile viewer applications
- Integration with document management systems

## 📚 Documentation

Help improve our documentation:

- **API docs**: Update JSDoc comments
- **Tutorials**: Add examples and guides
- **Specification**: Clarify technical details
- **Security model**: Explain security benefits

## 🧪 Testing

### Running Tests
```bash
npm test                    # All tests
npm run test:security      # Security-focused tests
npm run test:coverage      # Coverage report
npm run test:performance   # Performance benchmarks
```

### Writing Tests
- Use Vitest for unit tests
- Include edge cases
- Test error conditions
- Validate security properties

## 🏆 Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Project website (when available)

## 📞 Getting Help

- **Discord**: [Community Server Link]
- **Issues**: GitHub Issues for bugs/features
- **Email**: `maintainers@secure-pdf.org`
- **Documentation**: Check `/docs` folder

## 📄 License

By contributing to SecurePDF, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for helping make document security better for everyone! 🔒
