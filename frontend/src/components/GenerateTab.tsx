'use client';

import { useState } from 'react';
import axios from 'axios';
import styles from './GenerateTab.module.css';

const API_BASE_URL = 'http://localhost:8000';

export default function GenerateTab() {
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [slidesData, setSlidesData] = useState<any[]>([]);
  const [context, setContext] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setGenerating(true);
    setError('');
    setSlidesData([]);
    setContext('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate`, {
        topic: topic,
      });

      setSlidesData(response.data.slides_data);
      setContext(response.data.context);
    } catch (err: any) {
      setError(`Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (slidesData.length === 0) return;

    try {
      console.log('Sending slides data:', slidesData);
      const response = await axios.post(
        `${API_BASE_URL}/api/create-ppt`,
        { slides_data: slidesData },
        {
          responseType: 'blob',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${topic.replace(/\s+/g, '_')}_presentation.pptx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      const errorMessage = err.response?.data ? 
        `Request failed with status code ${err.response.status}` : 
        err.message;
      setError(`Download Error: ${errorMessage}`);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create Presentation</h2>

      <div className={styles.inputGroup}>
        <label htmlFor="topic" className={styles.label}>
          Enter Presentation Topic
        </label>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Quarterly Financial Review"
          className={styles.input}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className={styles.generateButton}
      >
        {generating ? '⏳ Generating...' : '✨ Generate PPT'}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {context && (
        <details className={styles.contextBox}>
          <summary className={styles.contextSummary}>
            📚 View Retrieved Context
          </summary>
          <pre className={styles.contextContent}>{context}</pre>
        </details>
      )}

      {slidesData.length > 0 && (
        <div className={styles.results}>
          <div className={styles.resultHeader}>
            <h3>✅ Generated {slidesData.length} Slides</h3>
            <button onClick={handleDownload} className={styles.downloadButton}>
              📥 Download PowerPoint
            </button>
          </div>

          <div className={styles.slides}>
            {slidesData.map((slide, index) => (
              <div key={index} className={styles.slide}>
                <div className={styles.slideHeader}>
                  <span className={styles.slideNumber}>Slide {index + 1}</span>
                  <span className={styles.slideType}>{slide.type}</span>
                </div>
                <h4 className={styles.slideTitle}>{slide.title}</h4>
                <p className={styles.slideContent}>{slide.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

