# Doc Insights Frontend v2

A modern React frontend for the RAG-based Documentation Insights System featuring a sidebar layout, file management, and comparison mode.

## Features

### Left Sidebar
- **Git Repository Ingestion**: Add GitHub/GitLab repos by URL
- **File Upload**: Drag-and-drop file upload with extension validation
- **Indexed Files List**: Browse all ingested files grouped by source

### Right Main Panel
- **Semantic Search**: Natural language queries over your documentation
- **Search Metrics**: Real-time latency, result count, and similarity scores
- **RAG vs Raw LLM Comparison**: Toggle to see side-by-side comparison of RAG results vs raw LLM output

## Tech Stack

- **React 18** with hooks
- **Vite 5** for fast builds
- **Axios** for API communication
- **CSS Custom Properties** for theming

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── index.js          # API service layer
│   ├── components/
│   │   ├── Sidebar.jsx       # File management sidebar
│   │   ├── SearchPanel.jsx   # Search interface & results
│   │   └── index.js          # Component exports
│   ├── styles/
│   │   └── index.css         # Complete styling system
│   ├── App.jsx               # Main application
│   └── main.jsx              # Entry point
├── index.html
├── vite.config.js
├── package.json
├── Dockerfile
└── nginx.conf
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/search` | RAG-powered semantic search |
| POST | `/search/raw` | Raw LLM search (comparison mode) |
| GET | `/files` | List all indexed files |
| POST | `/ingest/git` | Ingest a Git repository |
| POST | `/ingest/upload` | Upload and ingest a file |
| POST | `/ingest/fs` | Ingest from filesystem path |

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Docker Deployment

```bash
# From project root
docker-compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

## Design System

**Theme**: Midnight Ocean (dark mode)

**Colors**:
- Primary: `#58a6ff` (blue)
- Secondary: `#3fb950` (green)
- Background: `#080b10`

**Typography**:
- Display: Outfit
- Monospace: JetBrains Mono

## Comparison Mode

The comparison mode allows you to see how RAG-augmented search differs from a raw LLM response:

- **RAG Results**: Searches your indexed documentation and returns relevant chunks with similarity scores
- **Raw LLM**: Queries the LLM directly without any document context (requires LLM API key configuration)

This is useful for demonstrating the value of RAG in grounding responses in actual documentation.
