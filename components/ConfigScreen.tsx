import React, { useState, useEffect, useRef } from 'react';
import { GameSettings, ApiProvider, ConnectionStatus, ApiConfig, ConfigTab } from '../types';
import { resolveImgPath } from '../utils/imagePath';

interface ConfigScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
  initialTab?: ConfigTab;
  currentUserId?: number | null; // Added prop
}

// 瀹氫箟 SVG 鍥炬爣缁勪欢锛屼娇鐢?img 鏍囩寮曞叆澶栭儴 SVG
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
  { id: 'openai_compatible', name: 'OpenAI 鍏煎寮?API', icon: <Icons.Ollama /> },
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
  const fullText = "杩欐槸涓€娈甸瑙堟枃鏈紝鐢ㄤ簬灞曠ず鎵撳瓧鏈烘晥鏋溿€?;

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

const ConfigScreen: React.FC<ConfigScreenProps> = ({ settings, onUpdateSettings, onBack, initialTab = 'dialogue', currentUserId }) => {
  const [activeTab, setActiveTab] = useState<ConfigTab>(initialTab);
  
  // 鐩戝惉 initialTab 鍙樺寲 (纭繚浠庝笉鍚屽叆鍙ｈ繘鍏ユ椂鑳芥纭垏鎹?
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // API 璁剧疆鐩稿叧鐨勬湰鍦扮姸鎬?  const [apiConfig, setApiConfig] = useState<ApiConfig>(settings.apiConfig);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null);

  // 鎺у埗涓嬫媺鍒楄〃鐨勬樉绀?  const [showModelList, setShowModelList] = useState(false);
  const [showProviderList, setShowProviderList] = useState(false);
  
  const modelListRef = useRef<HTMLDivElement>(null);
  const providerListRef = useRef<HTMLDivElement>(null);

  // 闅愯棌鍐呭鐨勭姸鎬?  const [isNSFWRevealed, setIsNSFWRevealed] = useState(false);
  const [isDebugRevealed, setIsDebugRevealed] = useState(false);

  // 鐐瑰嚮璁℃暟鍣?Refs
  const headerClickRef = useRef({ count: 0, startTime: 0 });
  const visualClickRef = useRef({ count: 0, startTime: 0 });

  // 澶撮儴鏍囬鐐瑰嚮澶勭悊锛?0绉掑唴5娆＄偣鍑绘樉绀?NSFW 妯″紡
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

  // 瑙嗚鏁堟灉鏍囬鐐瑰嚮澶勭悊锛?0绉掑唴5娆＄偣鍑绘樉绀?Debug 妯″紡
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

  // 鍒濆鍖栬嚜鍔ㄨ繛鎺?  useEffect(() => {
    if (activeTab === 'api' && apiConfig.autoConnect && apiConfig.apiKey) {
        // 濡傛灉鏄嚜鍔ㄨ繛鎺ワ紝鎴戜滑灏濊瘯瑙﹀彂涓€娆♀€滈潤榛樷€濊繛鎺ラ€昏緫
        handleConnect(true);
    }
  }, [activeTab]);

  // 鐐瑰嚮澶栭儴鍏抽棴涓嬫媺鍒楄〃
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
        // OpenAI 鍏煎妯″紡榛樿 grok-3锛屽叾浠栨ā寮忕疆绌虹瓑寰呮媺鍙?        model: provider === 'openai_compatible' ? 'grok-3' : '',
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

        // 缁熶竴浣跨敤 /models 绔偣鑾峰彇妯″瀷鍒楄〃
        switch (apiConfig.provider) {
             case 'google':
                 // 浣跨敤 Google 鐨?OpenAI 鍏煎妯″瀷绔偣
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

        // 缁熶竴瑙ｆ瀽 OpenAI 鏍煎紡鐨?{ data: [{ id: ... }] }
        if (data && Array.isArray(data.data)) {
             models = data.data.map((m: any) => m.id).sort();
        }

        setConnectionStatus(ConnectionStatus.CONNECTED);
        setAvailableModels(models);

        // 濡傛灉鑾峰彇鍒颁簡鍒楄〃浣嗗綋鍓嶆病鏈夐€変腑鏈夋晥鍊硷紝鍒欓粯璁ら€変腑绗竴涓?        if (apiConfig.provider !== 'openai_compatible') {
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
        setTestResult({ success: false, message: `杩炴帴澶辫触: ${error.message}` });
    }
  };

  const handleTestMessage = async () => {
    if (connectionStatus !== ConnectionStatus.CONNECTED) return;
    
    setIsTestLoading(true);
    setTestResult(null);

    // 鍙互鍦ㄨ繖閲屽鍔犵湡瀹炵殑鑱婂ぉ娴嬭瘯璇锋眰锛岀洰鍓嶅厛淇濇寔妯℃嫙
    setTimeout(() => {
        setIsTestLoading(false);
        setTestResult({ success: true, message: "娴嬭瘯鎴愬姛锛丄PI 鍝嶅簲姝ｅ父銆? });
    }, 1000);
  };

  useEffect(() => {
      onUpdateSettings({ ...settings, apiConfig });
  }, [apiConfig]);

  return (
    <div className="relative w-full h-full bg-slate-950/70 backdrop-blur-sm text-slate-100 font-sans flex items-center justify-center animate-fadeIn">
      {/* 妯℃€佹涓讳綋 */}
      <div className="w-full max-w-5xl h-[90%] bg-slate-900/90 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row backdrop-blur-xl relative z-10">
        
        {/* Navigation Sidebar (Vertical on Desktop, Horizontal Top on Mobile) */}
        <div className="w-full md:w-64 bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-700/50 flex flex-col flex-shrink-0">
          {/* Header Area - Click trigger for NSFW Mode */}
          <div 
            className="p-4 md:p-6 border-b border-slate-800 flex justify-between items-center select-none"
            onClick={handleHeaderClick}
          >
            <div className="flex flex-col md:block">
                {/* Desktop UID display (Above title) */}
                {currentUserId !== null && (
                    <div className="hidden md:block text-[10px] text-slate-600 font-mono mb-1">UID: {currentUserId}</div>
                )}
                
                <h2 className="text-xl md:text-2xl font-bold text-amber-500 tracking-wider cursor-default flex items-center">
                    <i className="fa-solid fa-gear mr-2 md:mr-3"></i>
                    <span>绯荤粺璁剧疆</span>
                    {/* Mobile UID display (Right of title) */}
                    {currentUserId !== null && (
                        <span className="md:hidden ml-2 text-[10px] text-slate-600 font-mono self-end pb-1">UID: {currentUserId}</span>
                    )}
                </h2>
            </div>

            {/* Mobile Close Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); onBack(); }} 
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="鍏抽棴"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          
          {/* Tabs Container */}
          <nav className="flex-none md:flex-1 overflow-x-auto md:overflow-y-auto p-2 md:p-4 flex flex-row md:flex-col gap-2 md:space-y-2 no-scrollbar">
            <TabButton active={activeTab === 'dialogue'} onClick={() => setActiveTab('dialogue')} icon="fa-comment-dots" label="瀵硅瘽璁剧疆" />
            <TabButton active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon="fa-plug" label="API 璁剧疆" />
            <TabButton active={activeTab === 'sound'} onClick={() => setActiveTab('sound')} icon="fa-music" label="闊抽璁剧疆" />
          </nav>

          {/* Desktop Back Button (Bottom) */}
          <div className="hidden md:block p-4 border-t border-slate-800">
            <button onClick={onBack} className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium">
              <i className="fa-solid fa-arrow-left"></i>
              杩斿洖
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          
          {activeTab === 'dialogue' && (
            <div className="space-y-8 animate-fadeIn">
              <SectionHeader title="鍩虹璁剧疆" subtitle="鑷畾涔夋父鎴忎腑鐨勭О鍛间笌鍚嶇О" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="涓昏鍚嶇О" desc="鍦ㄥ璇濅腑鏇挎崲 {{user}} 鐨勬枃鏈? value={settings.userName} icon="fa-user" placeholder="缃楀畨"
                  onChange={(val) => onUpdateSettings({...settings, userName: val})}
                />
                <InputGroup 
                  label="鏃呭簵鍚嶇О" desc="鍦ㄥ璇濅腑鏇挎崲 {{home}} 鐨勬枃鏈? value={settings.innName} icon="fa-house-chimney" placeholder="澶滆幒浜?
                  onChange={(val) => onUpdateSettings({...settings, innName: val})}
                />
              </div>
              
              {/* 琛€缂樺叧绯昏缃?*/}
              <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/30 mt-6">
                <div>
                  <h4 className="text-lg font-medium text-slate-200">涓庤帀鑾夊▍鐨勫叧绯?/h4>
                  <p className="text-sm text-slate-400 mt-1">
                    {settings.isBloodRelated ? '浜茬敓濮愬 - 鏈夎缂樺叧绯? : '涔夊 - 鏃犺缂樺叧绯?}
                  </p>
                </div>
                <ToggleSwitch 
                  checked={settings.isBloodRelated} 
                  onChange={(checked) => onUpdateSettings({...settings, isBloodRelated: checked})} 
                  color="bg-pink-600"
                />
              </div>
              
              <div className="w-full h-px bg-slate-800 my-4" />
              
              {/* 瑙嗚鏁堟灉 - Click trigger for Debug Mode */}
              <SectionHeader 
                title="瑙嗚鏁堟灉" 
                subtitle="璋冩暣鏂囨湰鏄剧ず鐨勫憟鐜版柟寮? 
                onClick={handleVisualTitleClick}
                className="cursor-default"
              />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                  <div>
                    <h4 className="text-lg font-medium text-slate-200">鎵撳瓧鏈烘晥鏋?/h4>
                    <p className="text-sm text-slate-400 mt-1">寮€鍚悗鏂囧瓧閫愪釜鏄剧ず锛屽叧闂悗绔嬪嵆鏄剧ず銆?/p>
                  </div>
                  <ToggleSwitch checked={settings.enableTypewriter} onChange={(checked) => onUpdateSettings({...settings, enableTypewriter: checked})} />
                </div>

                {/* 閫忔槑搴﹁缃?*/}
                <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                   <div className="flex justify-between items-center mb-2">
                       <label className="text-lg font-medium text-slate-200">鑱婂ぉ绐楀彛閫忔槑搴?/label>
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
                   <p className="text-sm text-slate-400 mt-2">璋冩暣瀵硅瘽妗嗚儗鏅殑涓嶉€忔槑搴︺€?/p>
                </div>

                <div className="mt-4 p-6 bg-[url('img/_Title.png')] bg-cover bg-center rounded-lg border border-slate-700/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="relative z-10">
                      <div className="text-xs text-white/80 uppercase tracking-widest mb-3 font-bold shadow-black text-shadow-sm">鏁堟灉棰勮</div>
                      <TypewriterPreview enabled={settings.enableTypewriter} transparency={settings.dialogueTransparency} />
                  </div>
                </div>

                {/* 楂樻竻鍥剧墖妯″紡 */}
                <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/30">
                  <div>
                    <h4 className="text-lg font-medium text-slate-200">楂樻竻鍥剧墖妯″紡</h4>
                    <p className="text-sm text-slate-400 mt-1">鏀逛负楂樺垎杈ㄧ巼澶у昂瀵稿浘鐗囷紝娉ㄦ剰娴侀噺娑堣€椼€?/p>
                  </div>
                  <ToggleSwitch 
                    checked={settings.enableHD} 
                    onChange={(checked) => onUpdateSettings({...settings, enableHD: checked})} 
                  />
                </div>

                {/* Debug Mode Toggle - Hidden by default */}
                {isDebugRevealed && (
                    <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/30 border-l-4 border-l-yellow-600/50 animate-fadeIn">
                      <div>
                        <h4 className="text-lg font-medium text-slate-200">Debug 妯″紡</h4>
                        <p className="text-sm text-slate-400 mt-1">寮€鍚悗鏄剧ず寮€鍙戣€呰皟璇曞伐鍏枫€?/p>
                      </div>
                      <ToggleSwitch 
                        checked={settings.enableDebug} 
                        onChange={(checked) => onUpdateSettings({...settings, enableDebug: checked})} 
                        color="bg-yellow-600"
                      />
                    </div>
                )}

                {/* NSFW 璁剧疆 - Hidden by default */}
                {isNSFWRevealed && (
                    <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-lg border border-slate-700/30 border-l-4 border-l-red-900/50 animate-fadeIn">
                      <div>
                        <h4 className="text-lg font-medium text-slate-200">NSFW</h4>
                        <p className="text-sm text-slate-400 mt-1">寮€鍚悗瀵硅瘽娑堣€楃殑Token浼氬ぇ骞呭鍔犮€?/p>
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
              <SectionHeader title="杩炴帴璁剧疆" subtitle="閰嶇疆 LLM 鍚庣鏈嶅姟渚涘簲鍟? />

              <div className="space-y-6">
                {/* Provider Selection - Custom Dropdown */}
                 <div className="group relative" ref={providerListRef}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">API 渚涘簲鍟?/label>
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
                    label="API 绔偣 (Base URL)"
                    desc="鍏煎 OpenAI 鏍煎紡鐨?API 鍦板潃"
                    value={apiConfig.baseUrl}
                    onChange={(val) => setApiConfig({...apiConfig, baseUrl: val})}
                    placeholder="https://love.qinyan.icu/v1"
                    icon="fa-link"
                  />
                )}

                <div className="group">
                  <label className="block text-sm font-medium text-slate-300 mb-1">API 瀵嗛挜 (API-Key)</label>
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
                       <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> 杩炴帴涓?..</>
                    ) : connectionStatus === ConnectionStatus.CONNECTED ? (
                       <><i className="fa-solid fa-check"/> 宸茶繛鎺?/>
                    ) : (
                       <><i className="fa-solid fa-plug"/> 杩炴帴</>
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
                妯″瀷閫夋嫨鍣ㄥ尯鍩?
              */}
              <div className="space-y-6" ref={modelListRef}>
                 <div className="group relative">
                    <label className="block text-sm font-medium text-slate-300 mb-2">鑱婂ぉ妯″瀷</label>
                    
                    {/* 鍖哄垎鏄剧ず閫昏緫锛歄penAI 鍏煎妯″紡鏄剧ず杈撳叆妗嗭紝鍏朵粬妯″紡鏄剧ず涓嬫媺鎸夐挳 */}
                    {apiConfig.provider === 'openai_compatible' ? (
                        <div className="relative flex">
                          <input 
                              type="text" 
                              value={apiConfig.model}
                              onChange={(e) => setApiConfig({...apiConfig, model: e.target.value})}
                              onFocus={() => setShowModelList(true)}
                              placeholder="渚嬪: grok-4"
                              className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-l-lg pl-4 pr-10 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono z-10"
                          />
                          <button
                              onClick={() => setShowModelList(!showModelList)}
                              className="px-4 bg-slate-800 border-y border-r border-slate-700 rounded-r-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                          >
                              <i className={`fa-solid fa-chevron-${showModelList ? 'down' : 'up'} transition-transform duration-300`}></i>
                          </button>

                           {/* 鑷畾涔夊悜涓婂睍寮€鐨勪笅鎷夊垪琛?*/}
                           {showModelList && (
                              <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col max-h-[300px] overflow-y-auto animate-fadeIn">
                                  <div className="sticky top-0 bg-slate-950/90 backdrop-blur p-2 border-b border-slate-800 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                      鍙敤妯″瀷 ({availableModels.length})
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
                                          {connectionStatus === ConnectionStatus.CONNECTED ? '鏈壘鍒版ā鍨? : '璇峰厛杩炴帴浠ヨ幏鍙栧垪琛?}
                                      </div>
                                  )}
                              </div>
                           )}
                        </div>
                    ) : (
                        // 鍏朵粬渚涘簲鍟嗭細寮哄埗涓嬫媺閫夋嫨妯″紡
                        <div className="relative w-full">
                           <button 
                              onClick={() => setShowModelList(!showModelList)}
                              disabled={availableModels.length === 0 && connectionStatus !== ConnectionStatus.CONNECTED}
                              className="w-full bg-slate-950/50 border border-slate-700 text-slate-100 rounded-lg pl-4 pr-10 py-3 text-left focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50 flex items-center justify-between"
                           >
                              <span className={apiConfig.model ? "text-slate-100" : "text-slate-500"}>
                                  {apiConfig.model || (connectionStatus === ConnectionStatus.CONNECTED ? "璇烽€夋嫨妯″瀷..." : "璇峰厛杩炴帴浠ヨ幏鍙栨ā鍨嬪垪琛?)}
                              </span>
                              <i className={`fa-solid fa-chevron-${showModelList ? 'down' : 'up'} text-xs text-slate-500`}></i>
                           </button>

                           {/* 鑷畾涔夊悜涓婂睍寮€鐨勪笅鎷夊垪琛?*/}
                           {showModelList && (
                              <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col max-h-[300px] overflow-y-auto animate-fadeIn">
                                  <div className="sticky top-0 bg-slate-950/90 backdrop-blur p-2 border-b border-slate-800 text-xs text-slate-500 font-bold uppercase tracking-wider">
                                      鍙敤妯″瀷 ({availableModels.length})
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
                                          {connectionStatus === ConnectionStatus.CONNECTED ? '鏈壘鍒版ā鍨? : '璇峰厛杩炴帴浠ヨ幏鍙栧垪琛?}
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
                       娴嬭瘯娑堟伅
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">鑷姩杩炴帴涓婃鏈嶅姟鍣?/span>
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
              <SectionHeader title="闊抽璁剧疆" subtitle="璋冩暣娓告垙闊抽噺涓庨煶鏁? />
              
              <div className="p-6 bg-slate-800/40 rounded-lg border border-slate-700/30 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-lg font-medium text-slate-200">涓婚煶閲?/h4>
                        <p className="text-sm text-slate-400 mt-1">鎺у埗鎵€鏈夎儗鏅煶涔愪笌闊虫晥鐨勯煶閲?/p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-amber-500 font-mono font-bold w-8 text-right">{settings.masterVolume}%</span>
                        <ToggleSwitch checked={settings.isMuted} onChange={(v) => onUpdateSettings({...settings, isMuted: v})} />
                        <span className="text-sm text-slate-400 font-medium">{settings.isMuted ? '闈欓煶' : '寮€鍚?}</span>
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

