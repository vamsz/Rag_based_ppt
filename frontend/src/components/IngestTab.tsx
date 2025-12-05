'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import styles from './IngestTab.module.css';

const API_BASE_URL = 'http://localhost:8000';

export default function IngestTab() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setMessages(['Please select at least one file.']);
      return;
    }

    setUploading(true);
    setMessages([]);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ingest`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessages(response.data.messages);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setMessages([`Error: ${error.response?.data?.detail || error.message}`]);
    } finally {
      setUploading(false);
    }
  };

  const getMessageClass = (msg: string) => {
    if (msg.includes('Error') || msg.includes('Failed')) return styles.error;
    if (msg.includes('Skipped')) return styles.warning;
    return styles.success;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Upload Documents</h2>
      <p className={styles.description}>
        Supported formats: PDF, DOCX, PPTX, CSV, XLSX, TXT
      </p>

      <div 
        className={`${styles.uploadArea} ${isDragging ? styles.dragging : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.pptx,.csv,.xlsx,.txt"
          onChange={handleFileChange}
          className={styles.fileInput}
          id="fileInput"
        />
        <label htmlFor="fileInput" className={styles.fileLabel}>
          📁 Choose Files or Drag & Drop
        </label>
        <p className={styles.hint}>Select multiple files at once</p>
      </div>

      {selectedFiles.length > 0 && (
        <div className={styles.selectedFiles}>
          <div className={styles.selectedFilesHeader}>
            <h3>Selected Files ({selectedFiles.length}):</h3>
            <button onClick={() => setSelectedFiles([])} className={styles.clearButton}>
              Clear All
            </button>
          </div>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index} className={styles.fileItem}>
                <span>{file.name}</span>
                <button onClick={() => removeFile(index)} className={styles.removeFileBtn}>×</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
        className={styles.uploadButton}
      >
        {uploading ? '⏳ Processing...' : '🚀 Process Files'}
      </button>

      {messages.length > 0 && (
        <div className={styles.messages}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles.message} ${getMessageClass(msg)}`}>
              {msg}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

