/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, FolderTree, FileCode, GitBranch, Sparkles, Command, 
  Play, Plus, Trash2, Edit3, Save, Check, RefreshCw, X, Search, 
  Settings, ChevronRight, ChevronDown, Cpu, HardDrive, Shield, AlertCircle
} from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  isDir: boolean;
  content?: string;
  expanded?: boolean;
  children?: FileItem[];
}

interface GitFile {
  path: string;
  status: 'modified' | 'untracked' | 'staged';
}

interface CommitItem {
  sha: string;
  subject: string;
  author: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'editor' | 'explorer' | 'git' | 'ai'>('terminal');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState('');
  
  // Terminal state
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'Terax-C Terminal IDE v0.9.0 (Rust / Zig / Odin Engine)',
    'Type "help" for available commands or use top navigation tabs.',
    'root@terax-c:/workspace# '
  ]);

  // File Explorer state
  const [files, setFiles] = useState<FileItem[]>([
    {
      name: 'src',
      path: 'src',
      isDir: true,
      expanded: true,
      children: [
        { name: 'main.c', path: 'src/main.c', isDir: false, content: '#include <stdio.h>\n\nint main(void) {\n    printf("Terax-C Terminal IDE online.\\n");\n    return 0;\n}' },
        { name: 'editor.c', path: 'src/editor.c', isDir: false, content: '/* Terax-C Split Pane Code Editor */\n#include "editor.h"\n\nvoid ed_init(EdState *ed) {\n    // Initialize buffer state\n}' },
        { name: 'render.c', path: 'src/render.c', isDir: false, content: '/* Double-buffered ANSI renderer */\n#include "render.h"' }
      ]
    },
    {
      name: 'backend',
      path: 'backend',
      isDir: true,
      expanded: false,
      children: [
        { name: 'Cargo.toml', path: 'backend/Cargo.toml', isDir: false, content: '[package]\nname = "terax-lib"\nversion = "0.9.0"' },
        { name: 'lib.rs', path: 'backend/src/lib.rs', isDir: false, content: 'pub mod ffi;\npub mod modules;' }
      ]
    },
    { name: 'Makefile', path: 'Makefile', isDir: false, content: 'all:\n\tgcc -std=c11 -O2 main.c -o terax-c' },
    { name: 'README.md', path: 'README.md', isDir: false, content: '# Terax-C\n\nPure C TUI frontend + Rust/Zig/Odin backend engine.' }
  ]);

  const [selectedFile, setSelectedFile] = useState<FileItem>(files[0].children![0]);
  const [editorContent, setEditorContent] = useState(selectedFile.content || '');
  const [isSaved, setIsSaved] = useState(true);

  // Git state
  const [gitBranch, setGitBranch] = useState('master');
  const [gitFiles, setGitFiles] = useState<GitFile[]>([
    { path: 'src/main.c', status: 'modified' },
    { path: 'src/new_feature.c', status: 'untracked' }
  ]);
  const [commits, setCommits] = useState<CommitItem[]>([
    { sha: 'd5b0837', subject: 'initial seed', author: 'Terax Operator' },
    { sha: '9d6eda6', subject: 'feat: e2e live commit from terax-c', author: 'Terax Operator' }
  ]);
  const [commitMsg, setCommitMsg] = useState('');

  // AI Agent state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Terax AI Agent ready. Configure your API key or prompt for code generation & hunk review.' }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Keyboard shortcut listener for Command Palette (Ctrl+K or F1)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || e.key === 'F1') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        setIsSaved(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    const newHist = [...terminalHistory, `root@terax-c:/workspace# ${cmd}`];
    
    if (cmd === 'clear') {
      setTerminalHistory(['root@terax-c:/workspace# ']);
    } else if (cmd === 'help') {
      newHist.push('Available commands: ls, cat <file>, git status, make, uname -a, clear, status');
      setTerminalHistory(newHist);
    } else if (cmd === 'uname -a' || cmd === 'uname -s') {
      newHist.push('Linux terax-c-kernel 6.5.0-generic x86_64 GNU/Linux');
      setTerminalHistory(newHist);
    } else if (cmd === 'status') {
      newHist.push('PID: 30597 | VmRSS: 16.5MB (Zig FFI) | Odin p50: 50us | Status: 100% Operational');
      setTerminalHistory(newHist);
    } else if (cmd.startsWith('cat ')) {
      const fname = cmd.slice(4).trim();
      newHist.push(`Contents of ${fname}: ... (loaded successfully)`);
      setTerminalHistory(newHist);
    } else {
      newHist.push(`bash: ${cmd}: command executed successfully (exit code 0)`);
      setTerminalHistory(newHist);
    }
    setTerminalInput('');
  };

  const handleRunAi = () => {
    if (!aiPrompt.trim()) return;
    const userMsg = aiPrompt.trim();
    setAiMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiPrompt('');
    setIsStreaming(true);

    setTimeout(() => {
      setIsStreaming(false);
      setAiMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          text: `[Streamed response from ${aiProvider}/${aiModel}] Analysed codebase context successfully. Proposed refactoring hunk generated with Odin diff engine. Press 'y' to accept or 'n' to reject.` 
        }
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0f111a] text-[#c0caf5] font-sans overflow-hidden select-none">
      
      {/* TOP HEADER */}
      <header className="flex items-center justify-between px-4 h-12 bg-[#1a1b26] border-b border-[#292e42] shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[#7aa2f7] font-bold tracking-wider">
            <Cpu className="w-5 h-5 text-[#9ece6a]" />
            <span>TERAX-C IDE</span>
          </div>
          <span className="text-xs text-[#565f89]">|</span>
          <span className="text-xs text-[#bb9af7] font-mono">C TUI + Rust/Zig/Odin</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#16161e] p-1 rounded-lg border border-[#292e42]">
          {[
            { id: 'terminal', label: 'Terminal', icon: Terminal, shortcut: 'F4' },
            { id: 'editor', label: 'Editor', icon: FileCode, shortcut: 'F3' },
            { id: 'explorer', label: 'Explorer', icon: FolderTree, shortcut: 'F2' },
            { id: 'git', label: 'Git', icon: GitBranch, shortcut: 'F5' },
            { id: 'ai', label: 'AI Agent', icon: Sparkles, shortcut: 'F6' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-[#3d59a1] text-white shadow' 
                    : 'text-[#a9b1d6] hover:text-white hover:bg-[#292e42]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className="text-[10px] text-[#565f89] ml-1">{tab.shortcut}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#24283b] hover:bg-[#2f354d] border border-[#414868] rounded text-xs text-[#7aa2f7] transition-colors"
          >
            <Command className="w-3.5 h-3.5" />
            <span>Palette (Ctrl+K)</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-[#9ece6a]">
            <Shield className="w-3.5 h-3.5" />
            <span>0600 Secure</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR EXPLORER (Quick view when not in dedicated tab) */}
        <aside className="w-64 bg-[#16161e] border-r border-[#292e42] flex flex-col shrink-0">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#292e42] text-xs font-semibold text-[#7aa2f7]">
            <span>WORKSPACE FILES</span>
            <button className="text-[#565f89] hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
            {files.map(item => (
              <div key={item.path} className="space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#24283b] text-[#bb9af7] cursor-pointer">
                  <ChevronDown className="w-3 h-3" />
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </div>
                {item.children && item.children.map(child => (
                  <div 
                    key={child.path}
                    onClick={() => { setSelectedFile(child); setEditorContent(child.content || ''); setActiveTab('editor'); }}
                    className={`flex items-center gap-2 pl-6 pr-2 py-1 rounded cursor-pointer transition-colors ${
                      selectedFile.path === child.path ? 'bg-[#3d59a1]/30 text-white border-l-2 border-[#7aa2f7]' : 'text-[#a9b1d6] hover:bg-[#24283b]'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-[#7dcfff]" />
                    <span className="truncate">{child.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-[#292e42] text-[11px] text-[#565f89] flex items-center justify-between">
            <span>Branch: {gitBranch}</span>
            <span className="text-[#9ece6a]">Clean</span>
          </div>
        </aside>

        {/* ACTIVE PANEL WORKSPACE */}
        <section className="flex-1 flex flex-col bg-[#1a1b26] overflow-hidden relative">
          
          {/* TERMINAL TAB */}
          {activeTab === 'terminal' && (
            <div className="flex-1 flex flex-col p-4 font-mono text-sm overflow-hidden bg-[#16161e]">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#292e42] text-xs text-[#565f89]">
                <span>EMBEDDED PTY SHELL [active]</span>
                <span>Rows: 36 | Cols: 120 | Zig Poll</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 text-[#c0caf5]">
                {terminalHistory.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{line}</div>
                ))}
              </div>
              <form onSubmit={handleTerminalSubmit} className="mt-2 flex items-center gap-2 border-t border-[#292e42] pt-2">
                <span className="text-[#9ece6a]">root@terax-c:/workspace#</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={e => setTerminalInput(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[#c0caf5]"
                  placeholder="Type shell command..."
                  autoFocus
                />
              </form>
            </div>
          )}

          {/* EDITOR TAB */}
          {activeTab === 'editor' && (
            <div className="flex-1 flex flex-col bg-[#1a1b26] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-[#16161e] border-b border-[#292e42] text-xs">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#7aa2f7]" />
                  <span className="font-semibold text-white">{selectedFile.path}</span>
                  {!isSaved && <span className="text-[#e0af68]">● modified</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsSaved(true)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#3d59a1] text-white rounded text-xs hover:bg-[#2b427d]"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save (Ctrl+S)</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div className="w-12 bg-[#16161e] border-r border-[#292e42] text-right pr-3 pt-4 text-xs font-mono text-[#565f89] select-none space-y-1">
                  {editorContent.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
                <textarea
                  value={editorContent}
                  onChange={e => { setEditorContent(e.target.value); setIsSaved(false); }}
                  className="flex-1 bg-transparent p-4 font-mono text-sm text-[#c0caf5] outline-none resize-none leading-relaxed"
                  spellCheck="false"
                />
              </div>
            </div>
          )}

          {/* EXPLORER TAB */}
          {activeTab === 'explorer' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h2 className="text-lg font-bold text-white mb-4">Workspace File Explorer</h2>
              <div className="grid grid-cols-2 gap-4 max-w-3xl">
                {files.map(f => (
                  <div key={f.path} className="p-4 bg-[#16161e] border border-[#292e42] rounded-lg">
                    <div className="font-semibold text-[#7aa2f7] mb-2">{f.name}/</div>
                    <div className="text-xs text-[#a9b1d6] space-y-1">
                      {f.children?.map(c => (
                        <div key={c.path} onClick={() => { setSelectedFile(c); setEditorContent(c.content || ''); setActiveTab('editor'); }} className="hover:text-white cursor-pointer py-1">
                          ↳ {c.name}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GIT TAB */}
          {activeTab === 'git' && (
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Source Control (Git)</h2>
                  <p className="text-xs text-[#565f89]">Active Branch: <span className="text-[#7aa2f7]">{gitBranch}</span></p>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-[#24283b] text-[#9ece6a] rounded text-xs border border-[#414868]">
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#16161e] border border-[#292e42] rounded-lg p-4 flex flex-col">
                  <h3 className="text-xs font-semibold text-[#7aa2f7] mb-3">CHANGES</h3>
                  <div className="flex-1 space-y-2 mb-4">
                    {gitFiles.map((gf, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-[#24283b] rounded">
                        <span className="text-white font-mono">{gf.path}</span>
                        <span className="text-[#e0af68]">{gf.status}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={commitMsg}
                      onChange={e => setCommitMsg(e.target.value)}
                      placeholder="Commit message..."
                      className="bg-[#1a1b26] border border-[#414868] rounded px-3 py-2 text-xs text-white outline-none"
                    />
                    <button 
                      onClick={() => {
                        if (!commitMsg) return;
                        setCommits(prev => [{ sha: Math.random().toString(16).slice(2, 9), subject: commitMsg, author: 'Terax Operator' }, ...prev]);
                        setGitFiles([]);
                        setCommitMsg('');
                      }}
                      className="bg-[#9ece6a] text-[#1a1b26] font-semibold py-2 rounded text-xs hover:bg-[#8cc355] transition-colors"
                    >
                      Commit Staged Changes
                    </button>
                  </div>
                </div>

                <div className="bg-[#16161e] border border-[#292e42] rounded-lg p-4 flex flex-col">
                  <h3 className="text-xs font-semibold text-[#7aa2f7] mb-3">COMMIT DAG GRAPH</h3>
                  <div className="space-y-3 font-mono text-xs">
                    {commits.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-[#24283b]/50 rounded">
                        <span className="text-[#bb9af7]">{c.sha}</span>
                        <span className="text-white flex-1 truncate">{c.subject}</span>
                        <span className="text-[#565f89]">{c.author}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI AGENT TAB */}
          {activeTab === 'ai' && (
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#292e42]">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#bb9af7]" />
                    <span>Terax AI Agent & Hunk Reviewer</span>
                  </h2>
                  <p className="text-xs text-[#565f89]">Provider: <span className="text-[#7aa2f7]">{aiProvider}</span> | Model: <span className="text-[#9ece6a]">{aiModel}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={aiApiKey}
                    onChange={e => setAiApiKey(e.target.value)}
                    placeholder="API Key (Secrets 0600)..."
                    className="bg-[#16161e] border border-[#414868] rounded px-3 py-1.5 text-xs text-white outline-none w-48"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                {aiMessages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col gap-1 p-3 rounded-lg text-xs ${m.role === 'user' ? 'bg-[#3d59a1]/20 border border-[#3d59a1]/40 ml-12' : 'bg-[#16161e] border border-[#292e42] mr-12'}`}>
                    <span className="font-semibold text-[#7aa2f7]">{m.role === 'user' ? 'Operator' : 'Terax Agent'}</span>
                    <p className="text-white leading-relaxed font-mono whitespace-pre-wrap">{m.text}</p>
                  </div>
                ))}
                {isStreaming && (
                  <div className="p-3 bg-[#16161e] border border-[#292e42] rounded-lg text-xs text-[#9ece6a] animate-pulse">
                    Streaming response via reqwest + rustls...
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRunAi()}
                  placeholder="Ask AI agent or request refactoring..."
                  className="flex-1 bg-[#16161e] border border-[#414868] rounded-lg px-4 py-3 text-xs text-white outline-none"
                />
                <button
                  onClick={handleRunAi}
                  className="px-6 py-3 bg-[#bb9af7] text-[#1a1b26] font-semibold rounded-lg text-xs hover:bg-[#aa88e5] transition-colors"
                >
                  Send Prompt
                </button>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* COMMAND PALETTE MODAL */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1b26] border border-[#414868] rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[#292e42]">
              <Search className="w-4 h-4 text-[#7aa2f7]" />
              <input
                type="text"
                value={paletteQuery}
                onChange={e => setPaletteQuery(e.target.value)}
                placeholder="Type a command or file name (Odin Fuzzy)..."
                className="flex-1 bg-transparent outline-none text-sm text-white"
                autoFocus
              />
              <button onClick={() => setCommandPaletteOpen(false)} className="text-[#565f89] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {[
                { label: 'Terminal: Open Embedded Shell PTY', shortcut: 'F4', act: () => { setActiveTab('terminal'); setCommandPaletteOpen(false); } },
                { label: 'Editor: Save Active File', shortcut: 'Ctrl+S', act: () => { setActiveTab('editor'); setCommandPaletteOpen(false); } },
                { label: 'Explorer: View Workspace Files', shortcut: 'F2', act: () => { setActiveTab('explorer'); setCommandPaletteOpen(false); } },
                { label: 'Git: Commit Staged Changes', shortcut: 'F5', act: () => { setActiveTab('git'); setCommandPaletteOpen(false); } },
                { label: 'AI: Ask Agent & Review Hunks', shortcut: 'F6', act: () => { setActiveTab('ai'); setCommandPaletteOpen(false); } },
                { label: 'IDE: Refresh Workspace & Telemetry', shortcut: 'F12', act: () => { setCommandPaletteOpen(false); } }
              ]
              .filter(cmd => cmd.label.toLowerCase().includes(paletteQuery.toLowerCase()))
              .map((cmd, idx) => (
                <div
                  key={idx}
                  onClick={cmd.act}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#24283b] cursor-pointer text-xs group transition-colors"
                >
                  <span className="text-white group-hover:text-[#7aa2f7]">{cmd.label}</span>
                  <span className="text-[#565f89] font-mono">{cmd.shortcut}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER STATUS BAR */}
      <footer className="flex items-center justify-between px-4 h-7 bg-[#16161e] border-t border-[#292e42] text-[11px] text-[#565f89] shrink-0 font-mono">
        <div className="flex items-center gap-4">
          <span className="text-[#9ece6a]">[active workspace: /tmp/terax-c/project]</span>
          <span>git:master</span>
          <span>RSS: 16.5MB (Zig FFI)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Odin p50: 50us / 26 ops</span>
          <span className="text-[#7aa2f7]">Ready</span>
        </div>
      </footer>

    </div>
  );
}
