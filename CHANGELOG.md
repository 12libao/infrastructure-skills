# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-02-12

### Added
- Initial monorepo setup with pnpm workspace
- Migrated ai-model-server v2 from standalone directory
- Added comprehensive documentation (ARCHITECTURE.md, MIGRATION_SUMMARY.md)
- Added CI/CD workflows (GitHub Actions)
- Added shared utilities package
- Support for 9 preset AI models with role-based organization
- Pass-through mode for direct model name calling
- Dynamic model discovery with 5-minute cache
- Thinking tag cleaning functionality
- Fallback provider support (Gemini, GitHub Models)

### Changed
- Moved from `~/Documents/Cline/MCP/ai-model-server` to `~/git/mcp-infrastructure`
- Simplified architecture by removing unnecessary provider abstractions
- Updated to ES modules with explicit .js extensions
- Improved build configuration with TypeScript project references

### Fixed
- ES module import path issues
- TypeScript compilation errors
- Build output directory structure

## [1.0.0] - 2026-02-10

### Added
- Initial ai-model-server implementation (v1)
- Basic OpenAI-compatible API support
- Environment variable configuration