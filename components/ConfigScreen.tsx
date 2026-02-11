
import React, { useState, useEffect, useRef } from 'react';
import { GameSettings, ApiProvider, ConnectionStatus, ApiConfig, ConfigTab } from '../types';
import { resolveImgPath } from '../utils/imagePath';

interface ConfigScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
  initialTab?: ConfigTab;
}

// 定义 SVG 图标组件，使用 img 标签引入外部 SVG
const Icons = {
  Google: () => (
    <img src={resolveImgPath("img/svg/gemini-logo.svg")} className="w-5 h-5 object-contain" alt="Google Gemini" />
  ),
  DeepSeek: () => (
    <img src={resolveImgPath("img/svg/deepseek-logo.svg")} className="w-5 h-5 object-contain" alt="DeepSeek" />
  ),
  OpenAI: () => (
    <img src={resolveImgPath("img/svg/chatgpt-logo_white.svg")} className="w-5 h-5 object-contain" alt="OpenAI" />
  ),
  Claude: () => (
    <img src={resolveImgPath("img/svg/claude-logo.svg")} className="w-5 h-5 object-contain" alt="Claude" />
  ),
  Ollama: () => (
     <img src={resolveImgPath("img/svg/free-chat.svg")} className="w-5 h-5 object-contain" alt="Ollama" />
  )
};

const PROVIDER_OPTIONS: { id: ApiProvider; name: string; icon: React.ReactNode }[] = [
  { id: 'openai_compatible', name: 'OpenAI 兼容式 API', icon: <Icons.Ollama /> },
  { id: 'google', name: 'Google AI Studio', icon: <Icons.Google /> },
  { id: 'deepseek', name: 'DeepSeek', icon: <Icons.DeepSeek /> },
  { id: 'openai', name: 'OpenAI GPT', icon: <Icons.OpenAI /> },
  { id: 'claude', name: 'Anthropic Claude', icon: <Icons.Claude /> },
];

// -----------------------------------------------------------------------------
// Helper Components
// -----------------------------------------------------------------------------

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 md:flex-none w-auto md:w-full
      flex items-center justify-center md:justify-start 
      gap-2 md:gap-3 px-3 md:px-4 py-3 
      rounded-lg
      transition-all duration-200
      whitespace-nowrap
      ${active
        ? 'bg-gradient-to-t md:bg-gradient-to-r from-cyan-900/40 to-transparent border-b-2 md:border-b-0 md:border-l-4 border-cyan-500 text-white shadow-lg'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}
    `}
  >
    <i className={`fa-solid ${icon} w-5 text-center ${active ? 'text-cyan-400' : 'opacity-70'}`}></i>
    <span className="font-medium tracking-wide text-sm md:text-base">{label}</span>
  </button>
);

const SectionHeader: React.FC<{ title: string; subtitle: string; onClick?: () => void; className?: string }> = ({ title, subtitle, onClick, className = "" }) => (
  <div className={`mb-6 ${className}`} onClick={onClick}>
    <h3 className="text-xl font-bold text-white flex items-center gap-2 select-none">
      <span className="w-1 h-6 bg-amber-500 rounded-full inline-block"></span>
      {title}
    </h3>
    <p className="text-sm text-slate-400 mt-1 ml-3 select-none">{subtitle}</p>
  </div>
);

const InputGroup: React.FC<{
  label: string;
  desc: string;
  value: string;
  icon: string;
  placeholder?: string;
  onChange: (val: string) => void;
}> = ({ label, desc, value, icon, placeholder, onChange }) => (
  <div className="group">
    <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
    <p className="text-xs text-slate-500 mb-2">{desc}</p>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <i className={`fa-solid ${icon} text-slate-500 group-focus-within:text-cyan-500 transition-colors`}></i>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600"
      />
    </div>
  </div>
);

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
}> = ({ checked, onChange, color = 'bg-cyan-600' }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
      checked ? color : 'bg-slate-700'
    }`}
  >
    <div
      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`}
    />
  </button>
);

const TypewriterPreview: React.FC<{
  enabled: boolean;
  transparency: number;
}> = ({ enabled, transparency }) => {
  const [text, setText] = useState('');
  const fullText = "这是一段预览文本，用于展示打字机效果。";

  useEffect(() => {
    let interval: any;
    if (enabled) {
      let i = 0;
      setText('');
      interval = setInterval(() => {
        setText(fullText.slice(0, i + 1));
        i++;
        if (i >= fullText.length + 10) { // pause at end
            i = 0;
        }
      }, 50);
    } else {
      setText(fullText);
    }
    return () => clearInterval(interval);
  }, [enabled]);

  const alpha = transparency / 100;

  return (
    <div 
        className="p-4 rounded border border-[#d6cbb8]/30 text-slate-900 font-medium h-20 overflow-hidden"
        style={{
            background: `rgba(253, 251, 247, ${alpha})`
        }}
    >
      {text}
      {enabled && text.length < fullText.length && (
         <span className="inline-block w-2 h-4 bg-amber-800/40 ml-1 animate-pulse align-middle" />
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------------------

const ConfigScreen: React.FC<ConfigScreenProps> = ({ settings, onUpdateSettings, onBack, initialTab = 'dialogue' }) => {
  const [activeTab, setActiveTab] = useState<ConfigTab>(initialTab);
  
  // 监听 initialTab 变化 (确保从不同入口进入时能正确切换)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // API 设置相关的本地状态
  const [apiConfig, setApiConfig] = useState<ApiConfig>(settings.apiConfig);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);

  // 控制下拉列表的显示
  const [showModelList, setShowModelList] = useState(false);
  const [showProviderList, setShowProviderList] = useState(false);
  
  const modelListRef = useRef<HTMLDivElement>(null);
  const providerListRef = useRef<HTMLDivElement>(null);

  // 隐藏内容的状态
  const [isNSFWRevealed, setIsNSFWRevealed] = useState(false);
  const [isDebugRevealed, setIsDebugRevealed] = useState(false);

  // 点击计数器 Refs
  const headerClickRef = useRef({ count: 0, startTime: 0 });
  const visualClickRef = useRef({ count: 0, startTime: 0 });

  // 头部标题点击处理：10秒内5次点击显示 NSFW 模式
  const handleHeaderClick = () => {
    const now = Date.now();
    if (headerClickRef.current.count === 0 || now - headerClickRef.current.startTime > 10000) {
        headerClickRef.current.count = 1;
        headerClickRef.current.startTime = now;
    } else {
        headerClickRef.current.count++;
    }

    if (headerClickRef.current.count >= 5) {
        setIsNSFWRevealed(true);
    }
  };

  // 视觉效果标题点击处理：10秒内5次点击显示 Debug 模式
  const handleVisualTitleClick = () => {
    const now = Date.now();
    if (visualClickRef.current.count === 0 || now - visualClickRef.current.startTime > 10000) {
        visualClickRef.current.count = 1;
        visualClickRef.current.startTime = now;
    } else {
        visualClickRef.current.count++;
    }

    if (visualClickRef.current.count >= 5) {
        setIsDebugRevealed(true);
    }
  };

  // 初始化自动连接
  useEffect(() => {
    if (activeTab === 'api' && apiConfig.autoConnect && apiConfig.apiKey) {
        // 如果是自动连接，我们尝试触发一次“静默”连接逻辑
        handleConnect(true);
    }
  }, [activeTab]);

  // 点击外部关闭下拉列表
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelListRef.current && !modelListRef.current.contains(event.target as Node)) {
        setShowModelList(false);
      }
      if (providerListRef.current && !providerListRef.current.contains(event.target as Node)) {
        setShowProviderList(false);
      }
    };

    if (showModelList || showProviderList) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelList, showProviderList]);

  const handleProviderChange = (provider: ApiProvider) => {
    setApiConfig(prev => ({ 
        ...prev, 
        provider,
        // OpenAI 兼容模式默认 grok-3，其他模式置空等待拉取
        model: provider === 'openai_compatible' ? 'grok-3' : '',
        baseUrl: provider === 'openai_compatible' ? 'https://love.qinyan.icu/v1' : ''
    }));
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setAvailableModels([]);
    setTestResult(null);
    setShowModelList(false);
  };

  const handleConnect = async (isAutoConnect = false) => {
    if (!apiConfig.apiKey) return;

    setConnectionStatus(ConnectionStatus.CONNECTING);
    setTestResult(null);
    setAvailableModels([]);

    try {
        let models: string[] = [];
        let endpoint = '';
        let headers: Record<string, string> = {
            'Authorization': `Bearer ${apiConfig.apiKey}`,
            'Content-Type': 'application/json'
        };

        // 统一使用 /models 端点获取模型列表
        switch (apiConfig.provider) {
             case 'google':
                 // 使用 Google 的 OpenAI 兼容模型端点
                 endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/models';
                 break;
             case 'openai':
                 endpoint = 'https://api.openai.com/v1/models';
                 break;
             case 'deepseek':
                 endpoint = 'https://api.deepseek.com/models';
                 break;
             case 'openai_compatible':
             default:
                 const baseUrl = apiConfig.baseUrl.replace(/\/$/, '');
                 endpoint = `${baseUrl}/models`;
                 break;
        }

        const response = await fetch(endpoint, {
             method: 'GET',
             headers: headers
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        // 统一解析 OpenAI 格式的 { data: [{ id: ... }] }
        if (data && Array.isArray(data.data)) {
             models = data.data.map((m: any) => m.id).sort();
        }

        setConnectionStatus(ConnectionStatus.CONNECTED);
        setAvailableModels(models);

        // 如果获取到了列表但当前没有选中有效值，则默认选中第一个
        if (apiConfig.provider !== 'openai_compatible') {
             if (models.length > 0 && !models.includes(apiConfig.model)) {
                 setApiConfig(prev => ({ ...prev, model: models[0] }));
             }
        }

        if (!isAutoConnect) {
            setShowModelList(true);
        }
        
        onUpdateSettings({ ...settings, apiConfig });

    } catch (error: any) {
        console.error("Connection failed:", error);
        setConnectionStatus(ConnectionStatus.ERROR);
        setTestResult({ success: false, message: `连接失败: ${error.message}` });
    }
  };

  const handleTestMessage = async () => {
    if (connectionStatus !== ConnectionStatus.CONNECTED) return;
    
    setIsTestLoading(true);
    setTestResult(null);

    // 可以在这里增加真实的聊天测试请求，目前先保持模拟
    setTimeout(() => {
        setIsTestLoading(false);
        setTestResult({ success: true, message: "测试成功！API 响应正常。" });
    }, 1000);
  };

  useEffect(() => {
      onUpdateSettings({ ...settings, apiConfig });
  }, [apiConfig]);

  return (
    <div className="relative w-full h-full bg-slate-950/70 backdrop-blur-sm text-slate-100 font-sans flex items-center justify-center animate-fadeIn">
      {/* 模态框主体 */}
      <div className="w-full max-w-5xl h-[90%] bg-slate-900/90 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row backdrop-blur-xl relative z-10">
        
        {/* Navigation Sidebar (Vertical on Desktop, Horizontal Top on Mobile) */}
        <div className="w-full md:w-64 bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-700/50 flex flex-col flex-shrink-0">
          {/* Header Area - Click trigger for NSFW Mode */}
          <div 
            className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center select-none"
            onClick={handleHeaderClick}
          >
            <h2 className="text-xl md:text-2xl font-bold text-amber-500 tracking-wider cursor-default">
              <i className="fa-solid fa-gear mr-2 md:mr-3"></i>
              <span className="md:inline">系统设置</span>
            </h2>
            {/* Mobile Close Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); onBack(); }} 
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="关闭"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          {/* Tabs Container */}
          <nav className="flex-none md:flex-1 overflow-x-auto md:overflow-y-auto p-2 md:p-4 flex flex-row md:flex-col gap-2 md:space-y-2 no-scrollbar">
            <TabButton active={activeTab === 'dialogue'} onClick={() => setActiveTab('dialogue')} icon="fa-comment-dots" label="对话设置" />
            <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon="fa-plug" label="API 设置" />
            <TabButton active={activeTab === 'sound'} onClick={() => setActiveTab('sound')} icon="fa-music" label="音频设置" />
          </nav>

          {/* Desktop Back Button (Bottom) */}
          <div className="hidden md:block p-4 border-t border-slate-800">
            <button onClick={onBack} className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
              <i className="fa-solid fa-arrow-left"></i>
              返回
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          
          {activeTab === 'dialogue' && (
            <div className="space-y-8 animate-fadeIn">
              <SectionHeader title="基础设置" subtitle="自定义游戏中的称呼与名称" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="主角名称" desc="在对话中替换 {{user}} 的文本" value={settings.userName} icon="fa-user" placeholder="罗安"
                  onChange={(val) => onUpdateSettings({...settings, userName: val})}
                />
                <InputGroup 
                  label="旅店名称" desc="在对话中替换 {{home}} 的文本" value={settings.innName} icon="fa-house-chimney" placeholder="夜莺亭"
                  onChange={(val) => onUpdateSettings({...settings, innName: val})}
                />
              </div>
              <div className="w-full h-px bg-slate-800 my-4" />
              
              {/* 视觉效果 - Click trigger for Debug Mode */}
              <SectionHeader 
                title="视觉效果" 
                subtitle="调整文本显示的呈现方式" 
                onClick={handleVisualTitleClick}
                className="cursor-default"
              />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                  <div>
                    <h4 className="text-lg font-medium text-slate-200">打字机效果</h4>
                    <p className="text-sm text-slate-400 mt-1">开启后文字逐个显示，关闭后立即显示。</p>
                  </div>
                  <ToggleSwitch checked={settings.enableTypewriter} onChange={(checked) => onUpdateSettings({...settings, enableTypewriter: checked})} />
                </div>

                {/* 透明度设置 */}
                <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-lg font-medium text-slate-200">聊天窗口透明度</label>
                       <span className="text-amber-500 font-mono font-bold">{settings.dialogueTransparency}%</span>
                   </div>
                   <input 
                     type="range" 
                     min="0" 
                     max="100" 
                     value={settings.dialogueTransparency} 
                     onChange={(e) => onUpdateSettings({...settings, dialogueTransparency: Number(e.target.value)})}
                     className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                   />
                   <p className="text-sm text-slate-400 mt-2">调整对话框背景的不透明度。</p>
                </div>

                <div className="mt-4 p-6 bg-[url('img/_Title.png')] bg-cover bg-center rounded-lg border border-slate-700/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="relative z-10">
                      <div className="text-xs text-white/80 uppercase tracking-widest mb-3 font-bold shadow-black text-shadow-sm">效果预览</div>
                      <TypewriterPreview enabled={settings.enableTypewriter} transparency={settings.dialogueTransparency} />
                  </div>
                </div>

                {/* Debug Mode Toggle - Hidden by default */}
                {isDebugRevealed && (
                    <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/30 border-l-4 border-l-yellow-600/50 animate-fadeIn">
                      <div>
                        <h4 className="text-lg font-medium text-slate-200">Debug 模式</h4>
                        <p className="text-sm text-slate-400 mt-1">开启后显示开发者调试工具。</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.enableDebug} 
                        onChange={(checked) => onUpdateSettings({...settings, enableDebug: checked})} 
                        color="bg-yellow-600"
                      />
                    </div>
                )}

                {/* NSFW 设置 - Hidden by default */}
                {isNSFWRevealed && (
                    <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/30 border-l-4 border-l-red-900/50 animate-fadeIn">
                      <div>
                        <h4 className="text-lg font-medium text-slate-200">NSFW</h4>
                        <p className="text-sm text-slate-400 mt-1">开启后对话消耗的Token会大幅增加。</p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.enableNSFW} 
                        onChange={(checked) => onUpdateSettings({...settings, enableNSFW: checked})} 
                        color="bg-red-600"
                      />
                    </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-8 animate-fadeIn">
              {/* ... (API settings content unchanged) ... */}
              <SectionHeader title="连接设置" subtitle="配置 LLM 后端服务供应商" />

              <div className="space-y-6">
                {/* Provider Selection - Custom Dropdown */}
                 <div className="group relative" ref={providerListRef}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">API 供应商</label>
                    <button
                        onClick={() => setShowProviderList(!showProviderList)}
                        className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-lg pl-4 pr-4 py-3 text-left focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                {PROVIDER_OPTIONS.find(p => p.id === apiConfig.provider)?.icon}
                            </div>
                            <span className="font-medium tracking-wide">{PROVIDER_OPTIONS.find(p => p.id === apiConfig.provider)?.name}</span>
                        </div>
                        <i className={`fa-solid fa-chevron-${showProviderList ? 'up' : 'down'} text-xs text-slate-500 transition-transform duration-300`}></i>
                    </button>

                    {showProviderList && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col max-h-[300px] overflow-y-auto animate-fadeIn ring-1 ring-black/5">
                            {PROVIDER_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => {
                                        handleProviderChange(opt.id);
                                        setShowProviderList(false);
                                    }}
                                    className={`px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0 flex items-center gap-3 ${apiConfig.provider === opt.id ? 'text-cyan-400 bg-cyan-900/10' : 'text-slate-300'}`}
                                >
                                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center opacity-90">
                                        {opt.icon}
                                    </div>
                                    <span className="font-medium">{opt.name}</span>
                                    {apiConfig.provider === opt.id && <i className="fa-solid fa-check ml-auto text-cyan-500 text-sm"></i>}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>

                {apiConfig.provider === 'openai_compatible' && (
                  <InputGroup
                    label="API 端点 (Base URL)"
                    desc="兼容 OpenAI 格式的 API 地址"
                    value={apiConfig.baseUrl}
                    onChange={(val) => setApiConfig({...apiConfig, baseUrl: val})}
                    placeholder="https://love.qinyan.icu/v1"
                    icon="fa-link"
                  />
                )}

                <div className="group">
                  <label className="block text-sm font-medium text-slate-300 mb-1">API 密钥 (API-Key)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fa-solid fa-key text-slate-500"></i>
                    </div>
                    <input
                      type="password"
                      value={apiConfig.apiKey}
                      onChange={(e) => setApiConfig({...apiConfig, apiKey: e.target.value})}
                      placeholder="sk-..."
                      className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-slate-600 font-mono tracking-widest"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleConnect(false)}
                    disabled={!apiConfig.apiKey || connectionStatus === ConnectionStatus.CONNECTING}
                    className={`px-6 py-2.5 rounded-lg font-bold text-white shadow-lg flex items-center gap-2 transition-all ${
                      connectionStatus === ConnectionStatus.CONNECTED 
                        ? 'bg-emerald-600 hover:bg-emerald-500' 
                        : 'bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {connectionStatus === ConnectionStatus.CONNECTING ? (
                       <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> 连接中...</>
                    ) : connectionStatus === ConnectionStatus.CONNECTED ? (
                       <><i className="fa-solid fa-check"/> 已连接</>
                    ) : (
                       <><i className="fa-solid fa-plug"/> 连接</>
                    )}
                  </button>

                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/40 rounded border border-slate-800">
                     <div className={`w-2.5 h-2.5 rounded-full ${
                         connectionStatus === ConnectionStatus.CONNECTED ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                         connectionStatus === ConnectionStatus.CONNECTING ? 'bg-yellow-500 animate-pulse' :
                         'bg-red-500'
                     }`} />
                     <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                         {connectionStatus === ConnectionStatus.CONNECTED ? 'CONNECTED' : 
                          connectionStatus === ConnectionStatus.CONNECTING ? 'CONNECTING...' : 'DISCONNECTED'}
                     </span>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-slate-800 my-4" />
              
              {/* 
                模型选择器区域 
              */}
              <div className="space-y-6" ref={modelListRef}>
                 <div className="group relative">
                    <label className="block text-sm font-medium text-slate-300 mb-2">聊天模型</label>
                    
                    {/* 区分显示逻辑：OpenAI 兼容模式显示输入框，其他模式显示下拉按钮 */}
                    {apiConfig.provider === 'openai_compatible' ? (
                        <div className="relative flex">
                          <input 
                              type="text" 
                              value={apiConfig.model}
                              onChange={(e) => setApiConfig({...apiConfig, model: e.target.value})}
                              onFocus={() => setShowModelList(true)}
                              placeholder="例如: grok-4"
                              className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-l-lg pl-4 pr-10 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono z-10"
                          />
                          <button
                              onClick={() => setShowModelList(!showModelList)}
                              className="px-4 bg-slate-800 border-y border-r border-slate-700 rounded-r-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                          >
                              <i className={`fa-solid fa-chevron-${showModelList ? 'down' : 'up'} transition-transform duration-300`}></i>
                          </button>

                           {/* 自定义向上展开的下拉列表 */}
                           {showModelList && (
                              <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col max-h-[300px] overflow-y-auto animate-fadeIn">
                                  <div className="sticky top-0 bg-slate-950/90 backdrop-blur p-2 border-b border-slate-800 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                      可用模型 ({availableModels.length})
                                  </div>
                                  {availableModels.length > 0 ? (
                                      availableModels.map(m => (
                                          <button
                                              key={m}
                                              onClick={() => {
                                                  setApiConfig({...apiConfig, model: m});
                                                  setShowModelList(false);
                                              }}
                                              className={`px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0 font-mono text-sm ${apiConfig.model === m ? 'text-cyan-400 bg-cyan-900/10' : 'text-slate-300'}`}
                                          >
                                              {m}
                                          </button>
                                      ))
                                  ) : (
                                      <div className="p-4 text-center text-slate-500 text-sm">
                                          {connectionStatus === ConnectionStatus.CONNECTED ? '未找到模型' : '请先连接以获取列表'}
                                      </div>
                                  )}
                              </div>
                           )}
                        </div>
                    ) : (
                        // 其他供应商：强制下拉选择模式
                        <div className="relative w-full">
                           <button 
                              onClick={() => setShowModelList(!showModelList)}
                              disabled={availableModels.length === 0 && connectionStatus !== ConnectionStatus.CONNECTED}
                              className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-lg pl-4 pr-10 py-3 text-left focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50 flex items-center justify-between"
                           >
                              <span className={apiConfig.model ? "text-slate-100" : "text-slate-500"}>
                                  {apiConfig.model || (connectionStatus === ConnectionStatus.CONNECTED ? "请选择模型..." : "请先连接以获取模型列表")}
                              </span>
                              <i className={`fa-solid fa-chevron-${showModelList ? 'down' : 'up'} text-xs text-slate-500`}></i>
                           </button>

                           {/* 自定义向上展开的下拉列表 */}
                           {showModelList && (
                              <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col max-h-[300px] overflow-y-auto animate-fadeIn">
                                  <div className="sticky top-0 bg-slate-950/90 backdrop-blur p-2 border-b border-slate-800 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                      可用模型 ({availableModels.length})
                                  </div>
                                  {availableModels.length > 0 ? (
                                      availableModels.map(m => (
                                          <button
                                              key={m}
                                              onClick={() => {
                                                  setApiConfig({...apiConfig, model: m});
                                                  setShowModelList(false);
                                              }}
                                              className={`px-4 py-3 text-left hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0 font-mono text-sm ${apiConfig.model === m ? 'text-cyan-400 bg-cyan-900/10' : 'text-slate-300'}`}
                                          >
                                              {m}
                                          </button>
                                      ))
                                  ) : (
                                      <div className="p-4 text-center text-slate-500 text-sm">
                                          {connectionStatus === ConnectionStatus.CONNECTED ? '未找到模型' : '请先连接以获取列表'}
                                      </div>
                                  )}
                              </div>
                           )}
                        </div>
                    )}
                 </div>

                 <div className="flex items-center justify-between">
                    <button
                      onClick={handleTestMessage}
                      disabled={connectionStatus !== ConnectionStatus.CONNECTED || isTestLoading}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                       {isTestLoading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <i className="fa-solid fa-vial"></i>}
                       测试消息
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">自动连接上次服务器</span>
                        <ToggleSwitch 
                           checked={apiConfig.autoConnect}
                           onChange={(v) => setApiConfig({...apiConfig, autoConnect: v})}
                        />
                    </div>
                 </div>

                 {testResult && (
                     <div className={`p-3 rounded text-sm flex items-center gap-2 animate-fadeIn ${
                         testResult.success ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-red-900/30 text-red-400 border border-red-800'
                     }`}>
                         <i className={`fa-solid ${testResult.success ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                         {testResult.message}
                     </div>
                 )}
              </div>

            </div>
          )}

          {activeTab === 'sound' && (
            <div className="space-y-8 animate-fadeIn">
              <SectionHeader title="音频设置" subtitle="调整游戏音量与音效" />
              
              <div className="p-6 bg-slate-800/40 rounded-lg border border-slate-700/30 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-medium text-slate-200">主音量</h4>
                        <p className="text-sm text-slate-400 mt-1">控制所有背景音乐与音效的音量</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-amber-500 font-mono font-bold w-8 text-right">{settings.masterVolume}%</span>
                        <ToggleSwitch checked={settings.isMuted} onChange={(v) => onUpdateSettings({...settings, isMuted: v})} />
                        <span className="text-sm text-slate-400 font-medium">{settings.isMuted ? '静音' : '开启'}</span>
                    </div>
                </div>

                <div className={`transition-opacity duration-300 ${settings.isMuted ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={settings.masterVolume} 
                        onChange={(e) => onUpdateSettings({...settings, masterVolume: Number(e.target.value)})}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-slate-500 font-mono">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ConfigScreen;
