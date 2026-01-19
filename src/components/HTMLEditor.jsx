import React, { useState, useRef } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, 
  Image as ImageIcon, Code, AlignLeft, AlignCenter, AlignRight,
  Eye, EyeOff
} from 'lucide-react';

const HTMLEditor = ({ value = '', onChange, label = "Description (HTML)" }) => {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  const insertTag = (openTag, closeTag = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + openTag + selectedText + closeTag + value.substring(end);
    
    onChange({ target: { value: newText } });

    // Set cursor position after the inserted tags
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: () => insertTag('<strong>', '</strong>') },
    { icon: Italic, label: 'Italic', action: () => insertTag('<em>', '</em>') },
    { icon: Underline, label: 'Underline', action: () => insertTag('<u>', '</u>') },
    { icon: List, label: 'Bullet List', action: () => insertTag('<ul>\n  <li>', '</li>\n</ul>') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertTag('<ol>\n  <li>', '</li>\n</ol>') },
    { icon: LinkIcon, label: 'Link', action: () => insertTag('<a href="URL">', '</a>') },
    { icon: ImageIcon, label: 'Image', action: () => insertTag('<img src="URL" alt="description" />') },
    { icon: Code, label: 'Code', action: () => insertTag('<code>', '</code>') },
    { icon: AlignLeft, label: 'Align Left', action: () => insertTag('<div style="text-align: left;">', '</div>') },
    { icon: AlignCenter, label: 'Align Center', action: () => insertTag('<div style="text-align: center;">', '</div>') },
    { icon: AlignRight, label: 'Align Right', action: () => insertTag('<div style="text-align: right;">', '</div>') },
  ];

  const insertHeading = (level) => {
    insertTag(`<h${level}>`, `</h${level}>`);
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontWeight: '500' }}>{label}</label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            background: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: '500'
          }}
        >
          {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {!showPreview ? (
        <>
          {/* Toolbar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            padding: '10px',
            background: '#f8f9fa',
            border: '1px solid #ddd',
            borderBottom: 'none',
            borderRadius: '6px 6px 0 0'
          }}>
            {/* Heading Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  insertHeading(e.target.value);
                  e.target.value = '';
                }
              }}
              style={{
                padding: '6px 8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              <option value="">Heading</option>
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
            </select>

            {/* Toolbar Buttons */}
            {toolbarButtons.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={btn.action}
                title={btn.label}
                style={{
                  padding: '6px 8px',
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e9ecef'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <btn.icon size={16} />
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '0 0 6px 6px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              resize: 'vertical'
            }}
            placeholder="Enter HTML content here..."
          />

          {/* Quick Reference */}
          <details style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666' }}>
            <summary style={{ cursor: 'pointer', fontWeight: '500', marginBottom: '8px' }}>
              HTML Quick Reference
            </summary>
            <div style={{ 
              padding: '12px', 
              background: '#f8f9fa', 
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '0.8rem'
            }}>
              <div><strong>Headings:</strong> &lt;h1&gt;...&lt;/h1&gt; to &lt;h6&gt;...&lt;/h6&gt;</div>
              <div><strong>Paragraph:</strong> &lt;p&gt;...&lt;/p&gt;</div>
              <div><strong>Line Break:</strong> &lt;br /&gt;</div>
              <div><strong>Bold:</strong> &lt;strong&gt;...&lt;/strong&gt; or &lt;b&gt;...&lt;/b&gt;</div>
              <div><strong>Italic:</strong> &lt;em&gt;...&lt;/em&gt; or &lt;i&gt;...&lt;/i&gt;</div>
              <div><strong>Link:</strong> &lt;a href="url"&gt;text&lt;/a&gt;</div>
              <div><strong>Image:</strong> &lt;img src="url" alt="description" /&gt;</div>
              <div><strong>List:</strong> &lt;ul&gt;&lt;li&gt;item&lt;/li&gt;&lt;/ul&gt;</div>
              <div><strong>Div:</strong> &lt;div style="..."&gt;...&lt;/div&gt;</div>
            </div>
          </details>
        </>
      ) : (
        /* Preview */
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          background: 'white',
          minHeight: '300px'
        }}>
          <div 
            dangerouslySetInnerHTML={{ __html: value }}
            style={{ lineHeight: '1.6' }}
          />
          {!value && (
            <div style={{ color: '#999', fontStyle: 'italic' }}>
              No content to preview
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HTMLEditor;
