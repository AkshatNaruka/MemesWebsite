# Meme Editor - SPA Frontend

A modern React + TypeScript single-page application that provides a rich meme editing interface.

## 🚀 Features

- **Modern Editor Shell**: Instagram Stories-inspired UI with responsive design
- **Asset Management**: Browse templates, stickers, and fonts with search and filtering
- **Live API Integration**: Real-time data from Flask backend via React Query
- **Canvas Workspace**: Interactive editor with layer management
- **Properties Panel**: Dynamic controls for customizing elements
- **Content Browser**: Built-in trending content and GIF search
- **State Management**: React Context for global editor state
- **Development Experience**: TypeScript, Tailwind CSS, and hot module replacement

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📦 Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Development mode** (with hot reload):
   ```bash
   npm run dev
   ```

3. **Production build**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Flask Integration

The frontend integrates with Flask in two ways:

1. **Development**: Set `DEV_FRONTEND_URL=http://localhost:3000` in Flask environment
2. **Production**: Built files are served from Flask's static directory

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Sidebar.tsx     # Asset browser sidebar
│   │   ├── Canvas.tsx      # Main editor canvas
│   │   ├── PropertiesPanel.tsx # Properties editor
│   │   └── BottomDrawer.tsx # Content browser
│   ├── contexts/           # React contexts
│   │   └── EditorContext.tsx # Global editor state
│   ├── hooks/              # Custom React hooks
│   │   ├── useTemplates.ts # Template data fetching
│   │   ├── useAssets.ts   # Asset data fetching
│   │   └── useTrending.ts # Trending content hooks
│   ├── pages/              # Page components
│   │   └── EditorPage.tsx  # Main editor page
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # API and component types
│   ├── utils/              # Utility functions
│   │   ├── api.ts          # API client functions
│   │   └── index.ts        # Helper utilities
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
└── vite-env.d.ts           # Vite type definitions
```

## 🎨 Component Architecture

### Sidebar Component
- **Purpose**: Asset browsing and selection
- **Features**: Search, filtering by category, template/sticker/font tabs
- **API Integration**: Consumes templates, stickers, fonts, and categories

### Canvas Component
- **Purpose**: Main editing workspace
- **Features**: Template background, field overlays, layer rendering
- **State Integration**: Connected to EditorContext for template and layer data

### Properties Panel
- **Purpose**: Element customization controls
- **Features**: Dynamic controls based on selected layer type
- **Element Types**: Text (font, size, color), position, rotation, layering

### Bottom Drawer
- **Purpose**: Content browsing (trending, GIFs)
- **Features**: Tabbed interface, search functionality
- **API Integration**: Reddit trending content, Giphy search

## 📡 API Integration

The frontend consumes the following Flask API endpoints:

- `GET /api/v1/templates` - Template list with pagination and filtering
- `GET /api/v1/templates/:id` - Template details with editable fields
- `GET /api/v1/stickers` - Sticker list with optional category filtering
- `GET /api/v1/fonts` - Available font list
- `GET /api/v1/assets/categories` - Template and sticker categories
- `GET /api/v1/trending` - Trending meme content from Reddit
- `GET /api/v1/gifs?query=:query` - GIF search via Giphy API

## 🎯 Usage

1. **Select a Template**: Browse and click templates in the sidebar
2. **Add Content**: Use the properties panel to add text, stickers, or other elements
3. **Customize**: Adjust position, size, font, color, and other properties
4. **Save Draft**: Save work in progress using the draft functionality
5. **Browse Content**: Access trending content and GIFs via the bottom drawer

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency rules
- **Prettier**: Code formatting (recommended extension)
- **Tailwind CSS**: Utility-first styling approach

### Performance Optimizations

- **React Query**: Intelligent caching and background updates
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive operations

## 🔗 Flask Backend Integration

The frontend is designed to work seamlessly with the Flask backend:

1. **Static Serving**: Production builds are served from Flask's static directory
2. **API Proxy**: Development server proxies API requests to Flask backend
3. **Hot Reload**: Changes in frontend code automatically refresh the browser

## 📝 Notes

- The application is responsive and works on desktop and mobile devices
- Uses modern React patterns (hooks, context, functional components)
- Includes loading states and error handling for all API interactions
- Follows accessibility best practices with proper ARIA labels and keyboard navigation
- Designed to be extensible for future features like canvas manipulation, collaborative editing, etc.