# Frontend Project

A modern frontend application built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- ⚡ Next.js 15 with App Router
- 🎨 Tailwind CSS with custom design system
- 🌙 Dark/Light theme support
- 📱 Responsive design
- 🧪 Testing with Jest and React Testing Library
- 🔧 ESLint and TypeScript configuration
- 📦 Component library with shadcn/ui
- 🎯 Custom design tokens and CSS variables

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **State Management**: React Context + hooks
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library
- **Theme**: next-themes

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # Reusable components
│   ├── ui/                # Base UI components
│   ├── design-system/     # Design system components
│   └── layout/            # Layout components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utility functions and API
├── styles/                # Global styles and design tokens
└── types/                 # TypeScript type definitions
```

## Design System

This project includes a comprehensive design system with:

- Custom color palette using OKLCH color space
- Typography scale with Inter font
- Spacing, border radius, shadows, and z-index tokens
- CSS custom properties for theming
- Dark/light mode support

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## License

This project is licensed under the MIT License.