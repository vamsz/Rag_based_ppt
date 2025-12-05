'use client';

import { useState } from 'react';
import IngestTab from '@/components/IngestTab';
import GenerateTab from '@/components/GenerateTab';
import styles from './page.module.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'ingest' | 'generate'>('ingest');

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Universal RAG-to-PPT</h1>
          <p className={styles.subtitle}>
            Generate Midnight Professional PowerPoints from any document
          </p>
        </header>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'ingest' ? styles.active : ''}`}
            onClick={() => setActiveTab('ingest')}
          >
            📂 Ingest Data
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'generate' ? styles.active : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            🎬 Generate PPT
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'ingest' && <IngestTab />}
          {activeTab === 'generate' && <GenerateTab />}
        </div>
      </div>
    </main>
  );
}

