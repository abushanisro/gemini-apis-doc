import React, { useState } from 'react';

const StreamingDiagram = () => {
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const phases = [
    { id: 'init', label: 'Initialization', color: 'from-blue-500 to-blue-600' },
    { id: 'request', label: 'API Request', color: 'from-violet-500 to-violet-600' },
    { id: 'stream', label: 'Stream Processing', color: 'from-emerald-500 to-emerald-600' },
    { id: 'parse', label: 'Data Parsing', color: 'from-amber-500 to-amber-600' },
    { id: 'complete', label: 'Completion', color: 'from-teal-500 to-teal-600' },
  ];

  const architectureNodes = [
    {
      id: 'client',
      title: 'Client Application',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500',
      operations: [
        { phase: 'init', text: 'evaluateStreaming(prompt, config, options)' },
        { phase: 'stream', text: 'Receive: onChunk(text, fullResponse)' },
        { phase: 'complete', text: 'Final: onComplete(fullResponse)' },
      ]
    },
    {
      id: 'evaluator',
      title: 'Evaluator Engine',
      color: 'from-violet-500/20 to-violet-600/20',
      borderColor: 'border-violet-500',
      operations: [
        { phase: 'init', text: 'Generate UUID + Start Timer' },
        { phase: 'init', text: 'Build Payload: {role: "user", parts: [{text}]}' },
        { phase: 'request', text: 'POST /v1beta/models/{model}:streamGenerateContent' },
        { phase: 'stream', text: 'response.body.on("data")' },
        { phase: 'parse', text: 'Buffer Management + SSE Parsing' },
        { phase: 'parse', text: 'Extract: candidates[0].content.parts[0].text' },
        { phase: 'complete', text: 'Calculate Latency + Store Results' },
      ]
    },
    {
      id: 'api',
      title: 'Gemini API',
      color: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500',
      operations: [
        { phase: 'request', text: 'Receive: POST with generationConfig' },
        { phase: 'request', text: 'Validate: API Key + Model Availability' },
        { phase: 'stream', text: 'Stream: text/event-stream' },
        { phase: 'stream', text: 'Send: data: {JSON}\n\n' },
        { phase: 'complete', text: 'Include: usageMetadata.totalTokenCount' },
      ]
    },
    {
      id: 'stream',
      title: 'Node.js Stream',
      color: 'from-emerald-500/20 to-emerald-600/20',
      borderColor: 'border-emerald-500',
      operations: [
        { phase: 'stream', text: 'Event: on("data", chunk)' },
        { phase: 'stream', text: 'Event: on("end")' },
        { phase: 'stream', text: 'Event: on("error", err)' },
        { phase: 'parse', text: 'Buffer: chunk.toString()' },
      ]
    },
  ];

  const dataFlow = [
    { from: 'client', to: 'evaluator', label: 'evaluateStreaming()', phase: 'init' },
    { from: 'evaluator', to: 'api', label: 'POST /streamGenerateContent', phase: 'request' },
    { from: 'api', to: 'stream', label: 'HTTP 200 + SSE Stream', phase: 'request' },
    { from: 'stream', to: 'evaluator', label: 'data chunks', phase: 'stream' },
    { from: 'evaluator', to: 'client', label: 'onChunk() callbacks', phase: 'stream' },
    { from: 'evaluator', to: 'client', label: 'onComplete()', phase: 'complete' },
  ];

  const bufferProcess = [
    { step: '1', code: 'let buffer = "";', desc: 'Initialize empty buffer' },
    { step: '2', code: 'stream.on("data", chunk => {', desc: 'Listen for data events' },
    { step: '3', code: '  buffer += chunk.toString();', desc: 'Append chunk to buffer' },
    { step: '4', code: '  const lines = buffer.split("\\n");', desc: 'Split by newline' },
    { step: '5', code: '  buffer = lines.pop() || "";', desc: 'Keep incomplete line' },
    { step: '6', code: '  for (const line of lines) {', desc: 'Process complete lines' },
    { step: '7', code: '    if (line.startsWith("data: ")) {', desc: 'Check SSE format' },
    { step: '8', code: '      const json = JSON.parse(line.slice(6));', desc: 'Parse JSON payload' },
    { step: '9', code: '      const text = json.candidates[0]...', desc: 'Extract text content' },
    { step: '10', code: '      onChunk(text, fullResponse);', desc: 'Trigger callback' },
  ];

  const errorScenarios = [
    { type: 'API Error', color: 'text-red-400', desc: 'Invalid API key or model unavailable', action: 'Reject promise with error details' },
    { type: 'Stream Error', color: 'text-orange-400', desc: 'Network interruption or timeout', action: 'Emit "evaluation:error" event' },
    { type: 'Parse Error', color: 'text-yellow-400', desc: 'Malformed JSON in SSE data', action: 'Skip line, continue processing' },
    { type: 'Rate Limit', color: 'text-pink-400', desc: 'Too many requests to API', action: 'Return 429 with retry-after' },
  ];

  const metrics = [
    { label: 'First Token', value: '~150ms', color: 'text-blue-400' },
    { label: 'Tokens/sec', value: '~40-60', color: 'text-emerald-400' },
    { label: 'Chunk Size', value: '~50-200', color: 'text-violet-400' },
    { label: 'Latency', value: '<500ms', color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4 pb-8 border-b border-slate-800">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 rounded-full">
            <span className="text-sm font-medium text-slate-300">Real-time Streaming Architecture</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            Gemini API Evaluator
          </h1>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Interactive visualization of streaming evaluation pipeline with server-sent events, buffer management, and real-time processing
          </p>
        </div>

        {/* Phase Selector */}
        <div className="flex flex-wrap justify-center gap-3">
          {phases.map(phase => {
            const isActive = selectedPhase === phase.id;
            return (
              <button
                key={phase.id}
                onClick={() => setSelectedPhase(isActive ? null : phase.id)}
                className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-r ${phase.color} shadow-lg scale-105` 
                    : 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-300'}>{phase.label}</span>
              </button>
            );
          })}
        </div>

        {/* Architecture Diagram */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
          <h2 className="text-2xl font-bold mb-8">System Architecture</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
            {/* Connection Lines Background */}
            <div className="absolute inset-0 pointer-events-none hidden lg:block">
              <svg className="w-full h-full" style={{position: 'absolute', top: 0, left: 0}}>
                <defs>
                  <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <line x1="24%" y1="50%" x2="76%" y2="50%" stroke="url(#gradientLine)" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
            </div>

            {architectureNodes.map((node, idx) => {
              const isHovered = hoveredNode === node.id;
              const showOperations = !selectedPhase || node.operations.some(op => op.phase === selectedPhase);
              
              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`relative bg-gradient-to-br ${node.color} backdrop-blur-sm rounded-xl border-2 ${node.borderColor} p-6 transition-all duration-300 ${
                    isHovered ? 'scale-105 shadow-2xl' : 'shadow-lg'
                  } ${!showOperations ? 'opacity-40' : ''}`}
                >
                  {/* Node Header */}
                  <div className="mb-4 pb-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold">{node.title}</h3>
                  </div>

                  {/* Operations */}
                  <div className="space-y-2">
                    {node.operations.map((op, opIdx) => {
                      const isActiveOp = selectedPhase === op.phase;
                      return (
                        <div
                          key={opIdx}
                          className={`text-sm p-3 rounded-lg border transition-all duration-300 ${
                            isActiveOp
                              ? 'bg-white/10 border-white/30 shadow-lg'
                              : 'bg-slate-900/30 border-slate-700/50'
                          } ${!selectedPhase || isActiveOp ? 'opacity-100' : 'opacity-30'}`}
                        >
                          <code className="text-slate-200 font-mono text-xs leading-relaxed">
                            {op.text}
                          </code>
                        </div>
                      );
                    })}
                  </div>

                  {/* Flow Indicator */}
                  {idx < architectureNodes.length - 1 && (
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden lg:block">
                      <div className="w-6 h-6 text-violet-400 text-2xl">→</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Data Flow Legend */}
          <div className="mt-8 pt-8 border-t border-slate-800">
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              {dataFlow.map((flow, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border transition-all ${
                    selectedPhase === flow.phase ? 'border-violet-500 bg-violet-500/10' : 'border-slate-700'
                  }`}
                >
                  <span className="text-slate-400 font-mono text-xs">{flow.from}</span>
                  <span className="text-violet-400">→</span>
                  <span className="text-slate-300 font-medium">{flow.label}</span>
                  <span className="text-violet-400">→</span>
                  <span className="text-slate-400 font-mono text-xs">{flow.to}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buffer Processing & Error Handling Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Buffer Processing */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <h3 className="text-xl font-bold mb-6">Buffer Management Algorithm</h3>
            
            <div className="space-y-2 font-mono text-sm">
              {bufferProcess.map(item => (
                <div key={item.step} className="group">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-all border border-slate-700 hover:border-emerald-500/50">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded flex items-center justify-center flex-shrink-0 text-emerald-400 text-xs font-bold">
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <code className="text-emerald-300 block mb-1 break-all">{item.code}</code>
                      <p className="text-slate-400 text-xs">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Scenarios */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
            <h3 className="text-xl font-bold mb-6">Error Handling Matrix</h3>
            
            <div className="space-y-4">
              {errorScenarios.map((error, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-red-500/50 transition-all">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1">
                      <h4 className={`font-bold ${error.color} mb-1`}>{error.type}</h4>
                      <p className="text-slate-400 text-sm mb-2">{error.desc}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">→</span>
                        <code className="text-xs bg-slate-900 px-2 py-1 rounded text-emerald-400">
                          {error.action}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8">
          <h3 className="text-2xl font-bold mb-8">Performance Metrics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <div key={idx} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-violet-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700 group-hover:border-violet-500/50 transition-all text-center">
                  <div className="text-3xl font-bold mb-1 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {metric.value}
                  </div>
                  <div className="text-slate-400 text-sm font-medium">{metric.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6">
          <h3 className="text-xl font-bold mb-6">SSE Data Format Specification</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Request Payload</h4>
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-700 overflow-x-auto">
                <pre className="text-sm text-emerald-400 font-mono leading-relaxed">
{`{
  "contents": [{
    "role": "user",
    "parts": [{
      "text": "prompt"
    }]
  }],
  "generationConfig": {
    "temperature": 0.7,
    "maxOutputTokens": 8192
  }
}`}
                </pre>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">SSE Response Format</h4>
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-700 overflow-x-auto">
                <pre className="text-sm text-blue-400 font-mono leading-relaxed">
{`data: {
  "candidates": [{
    "content": {
      "parts": [{
        "text": "chunk"
      }],
      "role": "model"
    }
  }],
  "usageMetadata": {
    "totalTokenCount": 150
  }
}

`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingDiagram;