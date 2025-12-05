import os
import logging
import chromadb
from typing import List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from ingestion_engine import UniversalLoader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DBManager:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.persist_directory = persist_directory
        self.loader = UniversalLoader()
        
        # Initialize Embeddings
        # Using a standard efficient model for general purpose RAG
        self.embedding_function = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Initialize persistent Chroma Vector Store
        self._client = chromadb.PersistentClient(path=self.persist_directory)
        self.vector_store = Chroma(
            client=self._client,
            collection_name="rag_ppt_collection",
            embedding_function=self.embedding_function,
        )
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            is_separator_regex=False,
        )

    def add_to_knowledge_base(self, uploaded_files) -> List[str]:
        """
        Process uploaded files and add them to the vector database.
        
        Args:
            uploaded_files: List of Streamlit UploadedFile objects.
            
        Returns:
            List[str]: List of status messages for each file.
        """
        status_messages = []
        documents_to_add = []

        for uploaded_file in uploaded_files:
            try:
                logger.info(f"Processing {uploaded_file.name}...")
                
                # Extract text
                raw_text = self.loader.process_upload(uploaded_file)
                
                if not raw_text:
                    msg = f"Skipped {uploaded_file.name}: No text extracted or empty file."
                    logger.warning(msg)
                    status_messages.append(msg)
                    continue
                
                if raw_text.startswith("Error"):
                    msg = f"Failed {uploaded_file.name}: {raw_text}"
                    logger.error(msg)
                    status_messages.append(msg)
                    continue

                # Create chunks
                chunks = self.text_splitter.split_text(raw_text)
                
                # Create Documents with metadata
                for chunk in chunks:
                    documents_to_add.append(
                        Document(
                            page_content=chunk,
                            metadata={"source": uploaded_file.name}
                        )
                    )
                
                msg = f"Successfully processed {uploaded_file.name} ({len(chunks)} chunks)."
                status_messages.append(msg)
                
            except Exception as e:
                msg = f"Error processing {uploaded_file.name}: {str(e)}"
                logger.error(msg)
                status_messages.append(msg)

        if documents_to_add:
            try:
                self.vector_store.add_documents(documents=documents_to_add)
                logger.info(f"Added {len(documents_to_add)} chunks to ChromaDB.")
            except Exception as e:
                logger.error(f"Error adding documents to ChromaDB: {e}")
                status_messages.append(f"Critical Error: Failed to save to database: {e}")

        return status_messages

    def get_retriever(self):
        """Returns the vector store retriever."""
        return self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5}
        )

