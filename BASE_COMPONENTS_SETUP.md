# Setup Instructions for Base Components

To complete the setup of base components, you have several options:

## Option 1: Using npm (Recommended)
```bash
cd c:\dev\gerinvest
npm run setup:base-components
```

## Option 2: Using Node directly
```bash
node scripts/setup-base-components.js
```

## Option 3: Using the batch script (Windows)
Double-click `setup-base-components.bat` in the project root.

## Option 4: Using npm with a direct call
```bash
npm run setup:base-components
```

---

## What gets created

This script will create the following directory structure and files:

```
src/ui/components/base/
├── index.ts          (exports all components)
├── Button.tsx        (primary, secondary, danger, ghost variants)
├── Card.tsx          (container component with shadow)
├── Badge.tsx         (status badge component)
├── Skeleton.tsx      (loading skeleton + specialized variants)
├── EmptyState.tsx    (empty state with optional action)
├── PageHeader.tsx    (page header with title and actions)
└── KpiCard.tsx       (key performance indicator card)
```

## Setup Scripts Available

- `scripts/setup-base-components.js` - Main Node.js setup script
- `scripts/setup-base-components.ts` - TypeScript version (if you prefer)
- `setup-base-components.bat` - Windows batch script

## Verification

After running the setup, verify the files were created:
```bash
dir src\ui\components\base\
```

You should see all 8 files listed.
