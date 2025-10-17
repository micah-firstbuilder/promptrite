# Precommit Hook Configuration

This directory contains Git hooks managed by Husky.

## Pre-commit Hook

The `pre-commit` hook runs the following checks before each commit:

1. **Code Formatting** - Runs `npx ultracite format` to format code
   - Warnings and non-critical failures are ignored
   - The hook continues even if formatting fails

2. **Build Verification** - Runs `pnpm build` to verify the project builds successfully
   - **CRITICAL**: If the build fails, the commit is rejected
   - This ensures only working code is committed

## How It Works

When you attempt to commit changes, the hook will:
1. Change to the `promptrite` directory
2. Run ultracite format (non-blocking)
3. Run the build command
4. Reject the commit if the build fails
5. Allow the commit if the build succeeds

## Manual Testing

To test the hook manually:

```bash
cd /Users/micahjohnson/promptrite
.husky/pre-commit
```

## Disabling the Hook (Not Recommended)

To bypass the hook for a single commit:

```bash
git commit --no-verify
```

To disable all hooks temporarily:

```bash
husky uninstall
```

To re-enable hooks:

```bash
husky install