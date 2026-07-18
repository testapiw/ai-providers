# Publishing to npm

## Prerequisites

Before publishing, ensure you have:

1. An npm account (create at https://www.npmjs.com/signup)
2. Verified email address
3. npm CLI installed and logged in

## Pre-publication Checklist

- [ ] Update version in `package.json` (follow semver)
- [ ] Update `CHANGELOG.md` if you have one
- [ ] Update `README.md` with latest changes
- [ ] Update repository URLs in `package.json`
- [ ] Add your name/organization to `author` field in `package.json`
- [ ] Run tests: `npm test`
- [ ] Check package contents: `npm pack --dry-run`
- [ ] Verify files to be published are correct

## Steps to Publish

### 1. Login to npm

```bash
npm login
```

Enter your npm username, password, and email.

### 2. Check package name availability

```bash
npm search @testapiw/ai-providers
```

The package is using a scoped name `@testapiw/ai-providers` which ensures uniqueness.

### 3. Dry run

Test what will be published:

```bash
npm pack --dry-run
```

This shows all files that will be included in the package.

### 4. Publish

For first-time publication:

```bash
npm publish
```

For scoped packages (if using @username/package-name):

```bash
npm publish --access public
```

### 5. Verify publication

Check your package on npm:
```
https://www.npmjs.com/package/@testapiw/ai-providers
```

## Updating the Package

1. Make your changes
2. Update version in `package.json`:
   - Patch (1.0.x): Bug fixes
   - Minor (1.x.0): New features, backward compatible
   - Major (x.0.0): Breaking changes

3. Publish the update:
```bash
npm publish
```

## Version Bumping Helper Commands

```bash
# Patch version (1.0.0 -> 1.0.1)
npm version patch

# Minor version (1.0.0 -> 1.1.0)
npm version minor

# Major version (1.0.0 -> 2.0.0)
npm version major
```

These commands automatically update `package.json` and create a git tag.

## Unpublishing (Use with caution!)

You can unpublish within 72 hours of publishing:

```bash
npm unpublish @testapiw/ai-providers@1.0.0
```

Or unpublish all versions (package will be permanently reserved):

```bash
npm unpublish @testapiw/ai-providers --force
```

**Note**: Unpublishing is discouraged. Use deprecation instead:

```bash
npm deprecate @testapiw/ai-providers@1.0.0 "This version has bugs, please upgrade"
```

## Important Notes

1. **Package name**: Package is scoped under `@testapiw/ai-providers`
2. **Author field**: Add your name or organization
3. **Repository URLs**: Already configured for testapiw organization
4. **API Keys**: Never commit API keys - they are excluded via `.npmignore`
5. **Testing**: Always test your package locally before publishing
6. **Semantic Versioning**: Follow semver (https://semver.org/)

## Testing Package Locally

Before publishing, test the package installation:

```bash
# In your package directory
npm pack

# In a test project
npm install /path/to/testapiw-ai-providers-1.0.0.tgz
```

Or link it locally:

```bash
# In your package directory
npm link

# In a test project
npm link @testapiw/ai-providers
```
