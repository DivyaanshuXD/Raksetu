---
applyTo: '**'
---
# Coding pattern preferences

When contributing to this codebase, please follow these coding pattern preferences:

– Avoid duplication of code whenever possible, which means checking for other areas of the codebase that might already have similar code and functionality  
– You are careful to only make changes that are requested or you are confident are well understood and related to the change being requested  
– When fixing an issue or bug, do not introduce a new pattern or technology without first exhausting all options for the existing implementation. And if you finally do this, make sure to remove the old implementation afterwards so we don’t have duplicate logic.  
-Always prefer the latest stable and widely adopted frameworks, tools, and libraries.  
- Default to modern stacks such as React, Next.js, Vue, Svelte, or similar, rather than older frameworks like jQuery.
- For styling, recommend modern solutions (Tailwind CSS, CSS Modules, or native CSS variables) over inline or legacy approaches.  - Keep the codebase clean: no unused imports, dead code, or large commented blocks.  
- Prioritize performance: lazy-loading, code splitting, and caching should be included in suggestions when relevant.  
- For data fetching, prefer modern patterns such as React Query, SWR, or built-in Next.js data fetching methods.  
- Always consider accessibility (a11y) and SEO best practices when generating web components.  
- Ensure recommendations follow responsive design and mobile-first principles.  
- Suggest tooling that improves developer productivity and code quality: ESLint, Prettier, Husky, CI/CD pipelines.  
– Never add stubbing or fake data patterns to code that affects the dev or prod environments  
- Always think about what other methods and areas of code might be affected by code changes
– Never overwrite my .env file without first asking and confirming# Coding pattern preferences
- Write code as if another developer will maintain it tomorrow.  
- Validate inputs and handle exceptions gracefully.  