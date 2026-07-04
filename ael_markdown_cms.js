(function() {
  'use strict';

  const STORAGE_KEY = 'ael_md_docs';
  let currentDocId = null;
  let docs = loadDocs();
  let currentContent = '';

  const DOM = {};

  function cacheDOM() {
    DOM.navLinks = document.getElementById('navLinks');
    DOM.navToggle = document.getElementById('navToggle');
    DOM.navbar = document.getElementById('navbar');
    DOM.cursorGlow = document.getElementById('cursorGlow');
    DOM.heroCta = document.getElementById('heroCta');
    DOM.mdEditor = document.getElementById('mdEditor');
    DOM.livePreview = document.getElementById('livePreview');
    DOM.fullPreview = document.getElementById('fullPreview');
    DOM.charCount = document.getElementById('charCount');
    DOM.docTitle = document.getElementById('docTitle');
    DOM.saveDocBtn = document.getElementById('saveDocBtn');
    DOM.clearEditorBtn = document.getElementById('clearEditorBtn');
    DOM.documentsList = document.getElementById('documentsList');
    DOM.newDocBtn = document.getElementById('newDocBtn');
    DOM.exportAllBtn = document.getElementById('exportAllBtn');
    DOM.exportHtmlBtn = document.getElementById('exportHtmlBtn');
    DOM.exportMdBtn = document.getElementById('exportMdBtn');
    DOM.exportTxtBtn = document.getElementById('exportTxtBtn');
    DOM.exportPreview = document.getElementById('exportPreview');
  }

  // --- Custom Markdown Parser ---
  function parseMarkdown(md) {
    if (!md || !md.trim()) return '<p style="color:var(--text-muted);font-size:13px">Nothing to preview...</p>';
    let html = md;

    // Escape HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Code blocks (fenced) — must be before other transforms
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, code) => {
      const langClass = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${langClass}>${code.trim()}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');
    html = html.replace(/^___$/gm, '<hr>');

    // Headings
    html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Unordered lists
    html = html.replace(/^[*\-+] (.+)$/gm, '<li>$1</li>');
    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m.replace(/\n$/, '')}</ul>`);

    // Ordered lists
    html = html.replace(/^\d+\.\s(.+)$/gm, '<oli>$1</oli>');
    html = html.replace(/(<oli>.*<\/oli>\n?)+/g, m => `<ol>${m.replace(/<\/?oli>/g, m2 => m2 === '</oli>' ? '</li>' : '<li>').replace(/\n$/, '')}</ol>`);

    // Inline formatting
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<s>$1</s>');

    // Paragraphs — wrap remaining lines
    const lines = html.split('\n');
    const result = [];
    let inBlock = false;
    const blockTags = ['<h', '<ul', '<ol', '<pre', '<blockquote', '<hr'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) { result.push(''); continue; }
      const isBlock = blockTags.some(t => line.startsWith(t));
      if (isBlock) { result.push(line); continue; }
      // Skip if continuation of a block
      if (i > 0 && (lines[i-1].trim().startsWith('<li') || lines[i-1].trim().startsWith('<ul') || lines[i-1].trim().startsWith('<ol') || lines[i-1].trim().startsWith('<pre') || lines[i-1].trim().startsWith('<blockquote'))) {
        result.push(line);
        continue;
      }
      result.push(`<p>${line}</p>`);
    }

    return result.join('\n').replace(/\n{2,}/g, '\n');
  }

  // --- Document Storage ---
  function loadDocs() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  }

  function saveDocs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    renderDocuments();
  }

  function loadDocContent(id) {
    try { return localStorage.getItem(`ael_md_content_${id}`) || ''; } catch { return ''; }
  }

  function saveDocContent(id, content) {
    localStorage.setItem(`ael_md_content_${id}`, content);
  }

  function deleteDocContent(id) {
    localStorage.removeItem(`ael_md_content_${id}`);
  }

  // --- Editor ---
  function updatePreview() {
    const text = DOM.mdEditor.value;
    currentContent = text;
    DOM.charCount.textContent = text.length;
    const html = parseMarkdown(text);
    DOM.livePreview.innerHTML = html;
    DOM.fullPreview.innerHTML = html || '<div class="full-preview-empty"><span class="full-preview-icon" style="font-size:48px;display:block;margin-bottom:16px">📝</span><p>No content to preview</p><p class="full-preview-sub" style="font-size:12px;margin-top:4px;color:var(--text-muted)">Write something in the editor first</p></div>';
    updateExportPreview();
  }

  function updateExportPreview() {
    const text = DOM.mdEditor.value;
    if (!text.trim()) {
      DOM.exportPreview.innerHTML = '<code>No content to export. Write something in the editor first.</code>';
      return;
    }
    const preview = text.length > 300 ? text.slice(0, 300) + '...' : text;
    DOM.exportPreview.innerHTML = `<code>${preview.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code>`;
  }

  function saveCurrentDoc() {
    const title = DOM.docTitle.value.trim() || 'Untitled';
    const content = DOM.mdEditor.value;

    if (currentDocId) {
      const idx = docs.findIndex(d => d.id === currentDocId);
      if (idx >= 0) {
        docs[idx].title = title;
        docs[idx].updatedAt = Date.now();
        saveDocContent(currentDocId, content);
        saveDocs();
        renderDocuments();
        return;
      }
    }

    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    docs.push({ id, title, createdAt: Date.now(), updatedAt: Date.now() });
    saveDocContent(id, content);
    currentDocId = id;
    saveDocs();
    renderDocuments();
  }

  function loadDoc(id) {
    const doc = docs.find(d => d.id === id);
    if (!doc) return;
    currentDocId = id;
    DOM.docTitle.value = doc.title;
    DOM.mdEditor.value = loadDocContent(id);
    updatePreview();
    renderDocuments();
    document.querySelector('.nav-link[href="#editor"]')?.click();
  }

  function deleteDoc(id) {
    if (!confirm('Delete this document?')) return;
    docs = docs.filter(d => d.id !== id);
    deleteDocContent(id);
    if (currentDocId === id) {
      currentDocId = null;
      DOM.docTitle.value = 'Untitled';
      DOM.mdEditor.value = '';
      updatePreview();
    }
    saveDocs();
    renderDocuments();
  }

  function newDoc() {
    currentDocId = null;
    DOM.docTitle.value = 'Untitled';
    DOM.mdEditor.value = '';
    updatePreview();
    document.querySelector('.nav-link[href="#editor"]')?.click();
  }

  // --- Render Documents ---
  function renderDocuments() {
    const list = DOM.documentsList;
    if (!docs.length) {
      list.innerHTML = '<div class="documents-empty"><span class="documents-empty-icon" style="font-size:48px;display:block;margin-bottom:16px">📂</span><p>No saved documents</p><p class="documents-empty-sub" style="font-size:12px;margin-top:4px;color:var(--text-muted)">Create a document in the editor and save it here</p></div>';
      return;
    }

    list.innerHTML = docs.map(d => `
      <div class="doc-item" data-id="${d.id}">
        <div class="doc-item-info">
          <div class="doc-item-title">${escHtml(d.title)}</div>
          <div class="doc-item-meta">${new Date(d.updatedAt).toLocaleString()} · ${(loadDocContent(d.id).length || 0)} chars</div>
        </div>
        <div class="doc-item-actions">
          <button class="doc-btn load-btn" data-id="${d.id}">Open</button>
          <button class="doc-btn danger delete-btn" data-id="${d.id}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.load-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); loadDoc(b.dataset.id); }));
    list.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); deleteDoc(b.dataset.id); }));
    list.querySelectorAll('.doc-item').forEach(item => item.addEventListener('click', () => loadDoc(item.dataset.id)));
  }

  function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // --- Export ---
  function exportHtml() {
    const title = DOM.docTitle.value.trim() || 'Untitled';
    const content = DOM.mdEditor.value;
    if (!content.trim()) return;
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${escHtml(title)}</title><style>body{max-width:800px;margin:40px auto;padding:20px;font-family:-apple-system,system-ui,sans-serif;line-height:1.6;color:#1a1a2e;background:#fff}h1,h2,h3{color:#111}code{background:#f0f0f5;padding:2px 6px;border-radius:4px;font-size:14px}pre{background:#f0f0f5;padding:16px;border-radius:8px;overflow-x:auto}blockquote{border-left:3px solid #0074FF;padding:8px 16px;margin:12px 0;background:#f8faff}img{max-width:100%}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}</style></head><body>${parseMarkdown(content)}<hr><p style="color:#999;font-size:12px">Generated by AEL Markdown CMS</p></body></html>`;
    download(html, `${title}.html`, 'text/html');
  }

  function exportMd() {
    const title = DOM.docTitle.value.trim() || 'Untitled';
    const content = DOM.mdEditor.value;
    if (!content.trim()) return;
    download(content, `${title}.md`, 'text/markdown');
  }

  function exportTxt() {
    const title = DOM.docTitle.value.trim() || 'Untitled';
    const content = DOM.mdEditor.value;
    if (!content.trim()) return;
    const plain = content.replace(/#{1,6}\s/g, '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/<\/?[^>]+>/g, '');
    download(plain, `${title}.txt`, 'text/plain');
  }

  function exportAll() {
    if (!docs.length) return;
    const all = docs.map(d => `# ${d.title}\n\n${loadDocContent(d.id)}`).join('\n\n---\n\n');
    download(all, `ael-all-docs-${Date.now()}.md`, 'text/markdown');
  }

  function download(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Toolbar ---
  function setupToolbar() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const ta = DOM.mdEditor;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const text = ta.value;
        const selected = text.slice(start, end);
        const lineData = btn.dataset.line;
        const wrapBefore = btn.dataset.before;
        const wrapAfter = btn.dataset.after;

        if (lineData) {
          // Line-based insertion
          const beforeLine = text.slice(0, start);
          const afterLine = text.slice(end);
          const lineStart = beforeLine.lastIndexOf('\n') + 1;
          const currentLine = text.slice(lineStart, end);
          const newLine = lineData.includes('\\n') ? lineData.replace('\\n', '\n') : lineData;
          ta.value = text.slice(0, lineStart) + newLine + currentLine + afterLine;
          const pos = lineStart + newLine.length + currentLine.length;
          ta.setSelectionRange(pos, pos);
        } else if (wrapBefore && wrapAfter) {
          // Wrap selected text
          if (selected) {
            ta.value = text.slice(0, start) + wrapBefore + selected + wrapAfter + text.slice(end);
            ta.setSelectionRange(start + wrapBefore.length, start + wrapBefore.length + selected.length);
          } else {
            ta.value = text.slice(0, start) + wrapBefore + wrapAfter + text.slice(end);
            ta.setSelectionRange(start + wrapBefore.length, start + wrapBefore.length);
          }
        }

        ta.focus();
        updatePreview();
      });
    });
  }

  // --- Init ---
  function init() {
    cacheDOM();
    // Navigation
    const navItems = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    const activate = (id) => {
      sections.forEach(s => s.classList.remove('active'));
      navItems.forEach(n => n.classList.remove('active'));
      document.getElementById(id)?.classList.add('active');
      document.querySelector(`.nav-link[href="#${id}"]`)?.classList.add('active');
      if (DOM.navLinks) DOM.navLinks.classList.remove('open');
      refreshOnView(id);
    };
    navItems.forEach(l => l.addEventListener('click', e => { e.preventDefault(); activate(l.getAttribute('href').slice(1)); }));
    if (DOM.heroCta) DOM.heroCta.addEventListener('click', e => { e.preventDefault(); activate('editor'); });
    const hash = location.hash.slice(1) || 'overview';
    activate(hash);

    function refreshOnView(id) {
      if (id === 'preview') updatePreview();
      if (id === 'documents') renderDocuments();
      if (id === 'export') updateExportPreview();
    }

    // Editor
    DOM.mdEditor.addEventListener('input', updatePreview);

    // Toolbar
    setupToolbar();

    // Save / Clear
    DOM.saveDocBtn.addEventListener('click', saveCurrentDoc);
    DOM.clearEditorBtn.addEventListener('click', () => {
      if (confirm('Clear the editor?')) { DOM.mdEditor.value = ''; updatePreview(); }
    });

    // Documents
    DOM.newDocBtn.addEventListener('click', newDoc);
    DOM.exportAllBtn.addEventListener('click', exportAll);
    renderDocuments();

    // Export
    DOM.exportHtmlBtn.addEventListener('click', exportHtml);
    DOM.exportMdBtn.addEventListener('click', exportMd);
    DOM.exportTxtBtn.addEventListener('click', exportTxt);

    // Load current doc if exists
    if (currentDocId) {
      const doc = docs.find(d => d.id === currentDocId);
      if (doc) { DOM.docTitle.value = doc.title; DOM.mdEditor.value = loadDocContent(currentDocId); updatePreview(); }
    }

    // Cursor
    document.addEventListener('mousemove', e => {
      if (DOM.cursorGlow) { DOM.cursorGlow.style.opacity = '1'; DOM.cursorGlow.style.left = e.clientX + 'px'; DOM.cursorGlow.style.top = e.clientY + 'px'; }
    });
    document.addEventListener('mouseleave', () => { if (DOM.cursorGlow) DOM.cursorGlow.style.opacity = '0'; });

    DOM.navToggle.addEventListener('click', () => DOM.navLinks?.classList.toggle('open'));
    window.addEventListener('scroll', () => DOM.navbar?.classList.toggle('scrolled', window.scrollY > 50));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
