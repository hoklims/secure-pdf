import React, { useState, useEffect, useCallback } from 'react';
import { SpdfDocument, SpdfCore } from '@secure-pdf/core';
import { SpdfValidator } from '@secure-pdf/validator';

interface SpdfViewerProps {
  document?: SpdfDocument;
  spdfData?: string;
  password?: string;
  onError?: (error: string) => void;
  onLoad?: (document: SpdfDocument) => void;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Secure SPDF Document Viewer Component
 * Renders SPDF documents with security validation
 */
export const SpdfViewer: React.FC<SpdfViewerProps> = ({
  document: initialDocument,
  spdfData,
  password,
  onError,
  onLoad,
  className = '',
  width = 800,
  height = 600
}) => {
  const [document, setDocument] = useState<SpdfDocument | null>(initialDocument || null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [core] = useState(() => new SpdfCore());
  const [validator] = useState(() => new SpdfValidator());

  // Load document from SPDF data
  const loadDocument = useCallback(async (data: string, pwd?: string) => {
    try {
      setLoading(true);
      setError(null);

      const parsedDoc = await core.parseDocument(data);
      
      // Decrypt if password provided
      let finalDoc = parsedDoc;
      if (pwd) {
        finalDoc = await core.decryptDocument(parsedDoc, pwd);
      }

      // Validate document
      const validation = await validator.validateDocument(finalDoc);
      if (!validation.isValid) {
        throw new Error(`Document validation failed: ${validation.errors.join(', ')}`);
      }

      setDocument(finalDoc);
      onLoad?.(finalDoc);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [core, validator, onError, onLoad]);

  // Load document when spdfData changes
  useEffect(() => {
    if (spdfData) {
      loadDocument(spdfData, password);
    }
  }, [spdfData, password, loadDocument]);

  // Render page elements
  const renderPageElements = useCallback((page: any) => {
    return page.elements.map((element: any) => {
      const style = {
        position: 'absolute' as const,
        left: element.x * zoom,
        top: element.y * zoom,
        width: element.width * zoom,
        height: element.height * zoom,
      };

      switch (element.type) {
        case 'text':
          return (
            <div
              key={element.id}
              style={{
                ...style,
                fontFamily: element.style?.font || 'Arial',
                fontSize: (element.style?.size || 12) * zoom,
                color: element.style?.color || '#000000',
                fontWeight: element.style?.bold ? 'bold' : 'normal',
                fontStyle: element.style?.italic ? 'italic' : 'normal',
                overflow: 'hidden',
                userSelect: document?.metadata.permissions.copy ? 'text' : 'none'
              }}
            >
              {element.content}
            </div>
          );

        case 'image':
          return (
            <img
              key={element.id}
              src={`data:image/${element.format.toLowerCase()};base64,${element.data}`}
              alt={element.alt || 'Document image'}
              style={{
                ...style,
                objectFit: 'contain',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
              onError={() => console.warn(`Failed to load image: ${element.id}`)}
            />
          );

        default:
          return null;
      }
    });
  }, [zoom, document]);

  if (loading) {
    return (
      <div className={`spdf-viewer ${className}`} style={{ width, height }}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading secure document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`spdf-viewer error ${className}`} style={{ width, height }}>
        <div className="error-message">
          <h3>Document Error</h3>
          <p>{error}</p>
          <button onClick={() => setError(null)}>Retry</button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className={`spdf-viewer empty ${className}`} style={{ width, height }}>
        <div className="empty-state">
          <p>No document loaded</p>
        </div>
      </div>
    );
  }

  const currentPageData = document.content.pages[currentPage];
  const totalPages = document.content.pages.length;

  return (
    <div className={`spdf-viewer ${className}`} style={{ width, height }}>
      {/* Toolbar */}
      <div className="spdf-toolbar">
        <div className="navigation">
          <button
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          >
            Next
          </button>
        </div>

        <div className="zoom-controls">
          <button onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>-</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(3, zoom + 0.25))}>+</button>
          <button onClick={() => setZoom(1)}>Reset</button>
        </div>

        <div className="document-info">
          <span className="security-indicator">🔒 Secure</span>
          <span className="title">{document.metadata.title}</span>
        </div>
      </div>

      {/* Page Content */}
      <div className="spdf-page-container">
        <div
          className="spdf-page"
          style={{
            width: currentPageData.width * zoom,
            height: currentPageData.height * zoom,
            position: 'relative',
            background: 'white',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            margin: '20px auto'
          }}
        >
          {renderPageElements(currentPageData)}
        </div>
      </div>

      {/* Security Panel */}
      <div className="spdf-security-panel">
        <h4>Document Security</h4>
        <div className="security-info">
          <div className="permission">
            <span>Print: </span>
            <span className={document.metadata.permissions.print ? 'allowed' : 'denied'}>
              {document.metadata.permissions.print ? '✓' : '✗'}
            </span>
          </div>
          <div className="permission">
            <span>Copy: </span>
            <span className={document.metadata.permissions.copy ? 'allowed' : 'denied'}>
              {document.metadata.permissions.copy ? '✓' : '✗'}
            </span>
          </div>
          <div className="permission">
            <span>Modify: </span>
            <span className={document.metadata.permissions.modify ? 'allowed' : 'denied'}>
              {document.metadata.permissions.modify ? '✓' : '✗'}
            </span>
          </div>
          <div className="permission">
            <span>Annotate: </span>
            <span className={document.metadata.permissions.annotate ? 'allowed' : 'denied'}>
              {document.metadata.permissions.annotate ? '✓' : '✗'}
            </span>
          </div>
        </div>
        <div className="signature-info">
          <p><strong>Signed by:</strong> {document.metadata.author}</p>
          <p><strong>Created:</strong> {new Date(document.spdf.created).toLocaleString()}</p>
          <p><strong>Encryption:</strong> {document.security.encryption.algorithm}</p>
        </div>
      </div>
    </div>
  );
};

export default SpdfViewer;
