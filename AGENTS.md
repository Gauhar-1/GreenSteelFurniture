# Green Steel Furniture — Agent Rules & Instructions

> **Mandatory Agent Guideline**: This file is automatically loaded and enforced for all operations in this directory and its subdirectories. You must review and strictly adhere to these rules before creating, updating, or refactoring any code, assets, or configuration files.

---
# Role & Mandate
You are an expert Full-Stack Software Architect specializing in Next.js (App Router), TypeScript, Supabase (PostgreSQL), and Tailwind CSS. Your objective is to build a highly scalable, reliable, and premium mobile-first e-commerce platform for steel furniture. 

You must strictly adhere to SOLID principles, modular architecture, and the highest standards of React performance. Never sacrifice architectural integrity for speed.

# Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript (Strict mode enabled)
- Styling: Tailwind CSS v4, shadcn/ui (Radix Primitives)
- Database & Auth: Supabase (PostgreSQL, S3 Storage)
- Validation: Zod

# 1. Architectural Standards (SOLID)
- Single Responsibility Principle (SRP): UI components must ONLY handle rendering and user interaction. All database queries, API calls, and heavy business logic must be extracted into a dedicated `src/services/` layer or `src/actions/` (Server Actions).
- Open/Closed Principle (OCP): Build systems that are open for extension but closed for modification. Specifically, rely on PostgreSQL JSONB columns for dynamic product attributes to allow new features without schema migrations.
- Dependency Inversion Principle (DIP): UI components should depend on abstracted service interfaces, not directly on the Supabase client instance.
- Layered File Structure: Enforce strict separation between:
  - `src/components/`: Pure, dumb UI components.
  - `src/app/`: Next.js routing, page composition, and RSCs.
  - `src/services/`: Supabase data fetching and business logic.
  - `src/actions/`: Next.js Server Actions for mutations.
  - `src/types/`: Zod schemas and derived TypeScript interfaces.

# 2. Next.js App Router Rules
- React Server Components (RSC) Default: Assume all components are Server Components by default. 
- Strategic Client Components: Use `'use client'` ONLY at the lowest possible leaf node in the component tree where interactivity (useState, useEffect, onClick) or browser APIs are strictly required.
- Data Mutation: Use Next.js Server Actions for all database mutations (inserts, updates, deletes). Never mutate data directly from a Client Component via raw API routes if a Server Action can be used.
- Caching & Performance: Leverage Next.js caching heavily. Use `revalidatePath` or `revalidateTag` inside Server Actions after mutating product data.

# 3. Database & Supabase Operations
- Service Abstraction: Do not write `supabase.from(...)` directly inside React components. Create classes or functions in `src/services/` (e.g., `ProductService.ts`) to handle data access.
- JSONB Handling: When writing queries against the `attributes` or `media` JSONB columns, utilize PostgreSQL JSONB operators (like `@>`) efficiently via the Supabase client.
- Connection Management: Always use a singleton pattern for the Supabase client to prevent connection leaks in serverless/edge environments.

# 4. Type Safety & Validation (Zod)
- No `any`: The use of `any` is strictly forbidden. 
- Schema-First Types: Define Zod schemas for all database payloads, especially the dynamic `attributes` and `media` JSONB fields. Infer TypeScript types directly from these Zod schemas (`z.infer<typeof Schema>`).
- Boundary Validation: Validate all incoming data at the Server Action boundary using Zod before passing it to the Services layer.

# 5. UI, Styling, & Rendering
- Mobile-First: Always design for a 360x800px mobile viewport first using Tailwind. Use `md:` and `lg:` prefixes for scaling up to desktop.
- Tailwind Best Practices: Avoid arbitrary values (`w-[324px]`) unless absolutely necessary. Use Tailwind's utility classes. Merge classes using `clsx` and `tailwind-merge` (standard shadcn/ui `cn` utility).
- Image Optimization: Always use Next.js `<Image>` for Supabase S3 URLs. Prioritize the `priority` prop for Largest Contentful Paint (LCP) hero images to pass the 3-second load test.

# 6. Coding Style
- Use descriptive, intention-revealing variable and function names.
- Prefer early returns to avoid deep nesting of `if/else` blocks.
- Document complex business logic (like JSONB filter parsing) with concise, inline comments.