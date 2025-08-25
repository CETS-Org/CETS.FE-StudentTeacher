# CETS Admin/Staff Portal Frontend

A modern React-based frontend application for the CETS (Campus Equipment Tracking System) Admin and Staff portal, built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CETS.FE-StudentTeacher
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a file name `.env`
   
   Configure the following variables in `.env`:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_PORT=3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Tech Stack

### Core Technologies
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite 7** - Build tool and dev server
- **React Router DOM 7** - Client-side routing

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Tailwind Plugins**: Forms, Typography
- **Lucide React** - Icon library
- **Custom Design System** - Consistent UI components

### Form Management & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation integration

### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state management
- **Axios** - HTTP client
- **Axios Retry** - Request retry logic

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Lint Staged** - Pre-commit linting
- **TypeScript ESLint** - TypeScript-specific linting

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Footer)
│   └── ui/             # Base UI components (Button, Card, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── styles/             # Global styles and design tokens
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global CSS imports
```

### Key Directories

- **`components/ui/`** - Reusable UI components following a consistent design system
- **`components/layout/`** - Application layout components
- **`pages/`** - Route-based page components
- **`hooks/`** - Custom React hooks for shared logic
- **`styles/`** - Design tokens and global styles

## 🎨 Design System

The application uses a comprehensive design system with:

### Color Palette
- **Primary** - Main brand colors
- **Neutral** - Grays and blacks
- **Accent** - Orange/yellow highlights
- **Semantic** - Success, warning, error, info colors

### Components
All UI components are built with:
- Consistent styling using design tokens
- TypeScript support
- Accessibility considerations
- Responsive design

### Available Components
- `Button` - Various styles and states
- `Card` - Content containers
- `Dialog` - Modal dialogs
- `Form` - Form inputs with validation
- `Table` - Data tables
- `PageHeader` - Page headers with breadcrumbs
- And more...

## 🧭 Routing & Navigation

The application uses React Router for navigation:

### Available Routes
- **`/`** - Home Dashboard
- **`/requests`** - Service Requests Management
- **`/reports`** - System Reports
- **`/dev`** - Developer Dashboard (development only)

### Page Titles
Each page automatically sets a unique browser title using the `usePageTitle` hook:
- Home: "Home - CETS Admin"
- Requests: "Requests - CETS Admin"
- Reports: "Reports - CETS Admin"

## 📜 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
```

### Type Checking
```bash
npm run type-check   # Run TypeScript compiler check
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL` - Backend API URL
- `VITE_PORT` - Development server port (default: 4000)

### Vite Configuration
The Vite config includes:
- React plugin for JSX support
- Tailwind CSS integration
- API proxy for development
- TypeScript path mapping

### Tailwind Configuration
Custom Tailwind setup with:
- Design tokens integration
- Forms plugin
- Typography plugin
- Container utilities

## 🎯 Development Guidelines

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Use `usePageTitle` hook for page title
4. Add navigation link in Header if needed

### Creating Components
1. Follow existing component patterns in `src/components/ui/`
2. Use TypeScript interfaces for props
3. Include JSDoc comments for complex components
4. Test responsive behavior

### Styling Guidelines
1. Use Tailwind utility classes
2. Reference design tokens for colors
3. Maintain consistency with existing components
4. Ensure responsive design

### Form Handling
1. Use React Hook Form with Zod validation
2. Follow existing form component patterns
3. Handle loading and error states
4. Provide user feedback

## 🔍 API Integration

### HTTP Client
- Axios configured with base URL and retry logic
- Request/response interceptors for common handling
- Proxy setup for development environment

### Data Fetching
- TanStack Query for server state management
- Automatic caching and background updates
- Error handling and retry logic
- Loading state management

## 🚦 Code Quality

### Pre-commit Hooks
- Automatic linting and formatting
- Type checking
- Staged file validation

### ESLint Configuration
- React-specific rules
- TypeScript integration
- Accessibility recommendations
- Code quality standards

## 📱 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ support required
- CSS Grid and Flexbox support

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b dev_name
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   npm run lint
   npm run type-check
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to the branch**
   ```bash
   git push origin dev_name
   ```
7. **Open a Pull Request**

## 📝 Notes for Developers

### Design System
- All colors are defined as CSS custom properties in `src/styles/tokens.css`
- Use existing UI components when possible before creating new ones
- Follow the established naming conventions for components and utilities

### State Management
- Use React Query for server state
- Use React's built-in state for local component state
- Consider custom hooks for shared stateful logic

### Performance
- Components are optimized for React 19
- Lazy loading is implemented where beneficial
- Bundle size is monitored and optimized

### Accessibility
- All interactive elements have proper ARIA labels
- Color contrast meets WCAG guidelines
- Keyboard navigation is supported throughout

## 📞 Support

For questions or issues:
1. Check existing documentation
2. Search through project issues
3. Create a new issue with detailed description
4. Follow the project's contribution guidelines

---

Built with ❤️ using React, TypeScript, and Tailwind CSS