# Universal RAG-to-PPT

AI-powered pipeline that ingests your documents, performs retrieval-augmented generation (RAG), and designs a ready-to-download PowerPoint deck with a custom glassmorphism theme.

## Highlights
- Upload and chunk PDFs, DOCX, PPTX, CSV, XLSX, TXT into a persistent ChromaDB vector store.
- RAG-powered slide outline generation via OpenRouter (GLM-4.5-Air by default).
- FastAPI backend streams a finished `.pptx` built with `python-pptx` styling helpers.
- Next.js 14 frontend with drag-and-drop ingest UI, context preview, and one-click download.
- Runs locally: backend on `:8000`, frontend on `:3000`.

## Project Layout
```
backend/
  main.py              # FastAPI app + endpoints
  db_manager.py        # ChromaDB store and retriever
  ingestion_engine.py  # Universal file loader
  llm_engine.py        # OpenRouter client and slide planning
  design_engine.py     # PPT design/rendering
frontend/
  src/app/page.tsx     # Tabbed UI (ingest / generate)
  src/components/      # IngestTab, GenerateTab
start-backend.bat      # Helper to run API on Windows
start-frontend.bat     # Helper to run Next.js dev server
```

## Prerequisites
- Python 3.10+
- Node.js 18+ with npm or yarn
- An OpenRouter API key (`OPENROUTER_API_KEY`)

## Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
venv\Scripts\activate    # On macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

# Configure secrets
echo OPENROUTER_API_KEY=your_key_here > .env

# Run (dev)
python main.py
# or
uvicorn main:app --reload --port 8000
```
The API serves at `http://localhost:8000`. Swagger: `/docs`, ReDoc: `/redoc`.

## Frontend Setup (Next.js)
```bash
cd frontend
npm install       # or yarn install
npm run dev       # or yarn dev
```
Visit `http://localhost:3000`. The UI assumes the backend is on `http://localhost:8000`.

## Using the App
1) Ingest data  
   - Open the **Ingest Data** tab.  
   - Drag/drop or choose files (PDF, DOCX, PPTX, CSV, XLSX, TXT).  
   - Click **Process Files** to load chunks into ChromaDB.

2) Generate slides  
   - Switch to **Generate PPT**.  
   - Enter a topic; the app retrieves top-k chunks and asks the LLM for a slide outline.  
   - Review the slide preview and retrieved context.

3) Download  
   - Click **Download PowerPoint** to stream a fully rendered `.pptx`.

## API Overview (backend/main.py)
- `POST /api/ingest` - multipart file upload; returns status messages per file.  
- `POST /api/generate` - body `{ "topic": "..." }`; returns `slides_data` plus the retrieved `context`.  
- `POST /api/create-ppt` - body `{ "slides_data": [...] }`; streams the generated `.pptx`.

## Configuration Notes
- Model choice: `backend/llm_engine.py` (`self.model`) can be swapped for any OpenRouter model.
- Chunking: adjust `chunk_size` / `chunk_overlap` in `backend/db_manager.py`.
- Design tweaks: palette and layout live in `backend/design_engine.py`.
- CORS: allowed origins set in `backend/main.py` (defaults to `http://localhost:3000`).

## Troubleshooting
- ChromaDB permission issues: delete `backend/chroma_db` and restart the backend.
- LLM errors or empty slides: confirm `OPENROUTER_API_KEY` is set and the backend can reach OpenRouter.
- CORS complaints in the browser: ensure backend is on `:8000` and origins match in `main.py`.
- File parsing failures: check that dependencies (pypdf, python-docx, openpyxl) are installed; see `requirements.txt`.

## Common Commands
- Windows helpers: run `start-backend.bat` and `start-frontend.bat` from the repo root.
- Lint frontend: `cd frontend && npm run lint`.

## License
MIT - use freely for personal or commercial projects.
