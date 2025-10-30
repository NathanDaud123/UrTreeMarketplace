# Contributing to UrTree Marketplace

Terima kasih atas minat Anda untuk berkontribusi pada UrTree Marketplace! 🌱

## 🤝 Code of Conduct

Proyek ini mengikuti prinsip-prinsip:
- Respect dan profesionalisme
- Konstruktif dalam feedback
- Kolaboratif dalam problem-solving

## 🚀 Cara Berkontribusi

### 1. Fork & Clone

```bash
# Fork repository di GitHub
# Clone fork Anda
git clone https://github.com/YOUR_USERNAME/UrTreeMarketplace.git
cd UrTreeMarketplace

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/UrTreeMarketplace.git
```

### 2. Create Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

Naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `style/` - UI/UX improvements

### 3. Development

#### Setup Development Environment

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

#### Code Standards

**TypeScript**
- Use TypeScript strict mode
- Define proper types and interfaces
- Avoid `any` types

**Components**
- Use functional components with hooks
- Keep components small and focused
- Follow single responsibility principle

**Styling**
- Use Tailwind CSS classes
- Follow existing design system
- Maintain responsive design

**Naming**
- Components: PascalCase (e.g., `ProductCard.tsx`)
- Functions: camelCase (e.g., `handleSubmit`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### 4. Testing

Sebelum submit PR, pastikan:

```bash
# Code compiles without errors
npm run build

# No TypeScript errors
npm run type-check

# Linting passes
npm run lint
```

### 5. Commit

Gunakan conventional commit messages:

```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(cart): add quantity increment/decrement buttons"
git commit -m "fix(checkout): resolve radius validation bug"
git commit -m "docs(readme): add deployment instructions"
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

### 6. Push & Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request di GitHub
# Gunakan template PR yang tersedia
```

## 📋 Pull Request Guidelines

### PR Title
Gunakan format conventional commits:
```
feat(seller): add bulk product upload
fix(auth): resolve login session timeout
```

### PR Description
Include:
1. **What**: Apa yang diubah
2. **Why**: Kenapa perubahan diperlukan
3. **How**: Bagaimana implementasinya
4. **Testing**: Cara test perubahan
5. **Screenshots**: Jika ada perubahan UI

Template:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## 🐛 Reporting Bugs

### Before Submitting
1. Check existing issues
2. Update to latest version
3. Try to reproduce bug

### Bug Report Template
```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Description of the problem

**Describe the solution**
Clear description of what you want

**Describe alternatives**
Alternative solutions you've considered

**Additional context**
Mockups, examples, etc.
```

## 🎯 Areas to Contribute

### High Priority
- [ ] Payment integration (Midtrans)
- [ ] Email notifications
- [ ] Mobile app version
- [ ] Advanced search filters
- [ ] Product recommendations

### Medium Priority
- [ ] Wishlist feature
- [ ] Product comparison
- [ ] Seller analytics
- [ ] Social media sharing
- [ ] Multi-language support

### Good First Issues
- [ ] UI improvements
- [ ] Documentation
- [ ] Bug fixes
- [ ] Test coverage
- [ ] Accessibility improvements

## 📚 Resources

### Documentation
- [README.md](./README.md) - Project overview
- [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) - Database documentation
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Docs](https://react.dev/)

### Tools
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## 💬 Communication

### Questions?
- Open a GitHub Discussion
- Tag maintainers in issues
- Join our community (if applicable)

### Response Time
- Bug reports: 1-3 days
- Feature requests: 1 week
- Pull requests: 3-7 days

## 🏆 Recognition

Contributors akan diakui di:
- README.md Contributors section
- Release notes
- Project documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to UrTree Marketplace! 🌱💚
