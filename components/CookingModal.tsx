import React, { useState, useMemo, useEffect } from 'react';
import { ITEMS, ITEM_TAGS } from '../data/items';
import { FOOD_RECIPES, FoodRecipe } from '../data/food-recipes';
import { UserRecipe, ApiConfig, ItemData } from '../types';
import { resolveImgPath } from '../utils/imagePath';
import { llmService } from '../services/llmService';
import { getResValue } from '../data/item-value-table';

interface CookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Record<string, number>;
  userRecipes: UserRecipe[];
  foodStock: Record<string, number>;
  onAddRecipe: (recipe: UserRecipe) => void;
  onConsumeIngredients: (items: {id: string, count: number}[]) => void;
  onCraftRecipe: (recipeId: string, count: number, ingredients: {id: string, count: number}[]) => void;
  onDeleteRecipe: (recipeId: string) => void;
  onRenameRecipe: (recipeId: string, newName: string) => void;
  apiConfig: ApiConfig;
}

// ----------------------------------------------------------------------------
// 杈呭姪缁勪欢锛氱礌鏉愰€夋嫨妲戒綅
// ----------------------------------------------------------------------------
const MaterialSlot: React.FC<{
    label: string;
    itemId: string | null;
    onClick: () => void;
    onClear: (e: React.MouseEvent) => void;
    isMain?: boolean;
}> = ({ label, itemId, onClick, onClear, isMain }) => {
    const item = itemId ? ITEMS[itemId] : null;

    return (
        <div 
            onClick={onClick}
            className={`
                relative flex flex-col items-center justify-center p-2 rounded-lg border-2 cursor-pointer transition-all h-24 md:h-28 bg-[#f5f0e6]
                ${isMain ? 'border-[#b45309] bg-[#fff8ed]' : 'border-[#d6cbb8] hover:border-[#9b7a4c]'}
                ${!item ? 'opacity-80 hover:opacity-100' : ''}
            `}
        >
            <span className={`absolute top-1 left-2 text-[10px] font-bold uppercase tracking-widest ${isMain ? 'text-[#b45309]' : 'text-[#8c7b70]'}`}>
                {label}
            </span>
            
            {item ? (
                <>
                    <div className="text-2xl md:text-3xl mb-1 mt-2 drop-shadow-sm">
                        {ITEM_TAGS.find(t => t.id === item.tag)?.icon || '馃摝'}
                    </div>
                    <div className="text-xs font-bold text-[#382b26] text-center leading-tight line-clamp-2 px-1">
                        {item.name}
                    </div>
                    <button 
                        onClick={onClear}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                    >
                        <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                </>
            ) : (
                <div className="text-[#d6cbb8] text-2xl">
                    <i className="fa-solid fa-plus"></i>
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------------
// 涓荤粍浠?// ----------------------------------------------------------------------------
const CookingModal: React.FC<CookingModalProps> = ({
  isOpen, onClose, inventory, userRecipes, foodStock,
  onAddRecipe, onConsumeIngredients, onCraftRecipe, onDeleteRecipe, onRenameRecipe, apiConfig
}) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'develop'>('recipes');
  
  // --- 寮€鍙戞ā寮忕姸鎬?---
  // Slot 0 鏄?Main, 1-4 鏄?Subs
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null); // 褰撳墠姝ｅ湪閫夋嫨鍝釜妲戒綅鐨勭礌鏉?  
  // 棰勮/鍒朵綔鐘舵€?  const [previewData, setPreviewData] = useState<{
      recipeTemplate: FoodRecipe;
      ingredients: string[];
      avgStar: number;
      price: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // 鍒朵綔鍔ㄧ敾/API璇锋眰涓?
  // --- 鑿滆氨妯″紡鐘舵€?---
  const [craftingRecipeId, setCraftingRecipeId] = useState<string | null>(null); // 褰撳墠姝ｅ湪鍑嗗鐑归オ鐨勮彍璋盜D
  const [craftCount, setCraftCount] = useState(1);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  // 閲嶇疆鐘舵€?  useEffect(() => {
      if (isOpen) {
          setSlots([null, null, null, null, null]);
          setPreviewData(null);
          setIsProcessing(false);
          setCraftingRecipeId(null);
          setRenamingId(null);
      }
  }, [isOpen]);

  // --- 閫昏緫锛氬紑鍙戞ā寮?- 鍔ㄦ€佸簱瀛樿绠?---
  // 璁＄畻鍦ㄩ€夋嫨鏌愪釜妲戒綅鏃讹紝鍒楄〃涓簲璇ユ樉绀虹殑鍓╀綑鏁伴噺
  const getAvailableInventory = (targetSlotIndex: number) => {
      const tempInv = { ...inventory };
      
      // 閬嶅巻鎵€鏈夋Ы浣嶏紝鎵ｉ櫎闄ゅ綋鍓嶇洰鏍囨Ы浣嶄互澶栧凡閫変腑鐨勯亾鍏?      slots.forEach((itemId, idx) => {
          if (itemId && idx !== targetSlotIndex) {
              tempInv[itemId] = (tempInv[itemId] || 0) - 1;
          }
      });
      return tempInv;
  };

  // --- 閫昏緫锛氬紑鍙戞ā寮?- 鍖归厤閫昏緫 ---
  const handleAttemptDevelop = () => {
      const mainId = slots[0];
      if (!mainId) return;

      const mainItem = ITEMS[mainId];
      if (!mainItem) return;

      const subIds = slots.slice(1).filter(Boolean) as string[];
      const subItems = subIds.map(id => ITEMS[id]);
      
      // 1. 鏀堕泦鎵€鏈?Tag
      const mainTag = mainItem.tag;
      const subTags = subItems.map(i => i.tag).filter(Boolean) as string[]; // 鐢ㄦ埛鎻愪緵鐨勮緟鏂橳ags

      // 2. 绛涢€夌鍚堟潯浠剁殑椋熻氨
      // 瑙勫垯锛歁ain Tag 蹇呴』鍖归厤銆?      // 瑙勫垯锛氶璋辫姹傜殑 other-res 蹇呴』琚敤鎴锋彁渚涚殑 subTags 瀹屽叏鍖呭惈 (鏈€灏忕粍鍚堝尮閰?
      // 娉ㄦ剰锛氱敤鎴峰彲浠ユ彁渚涙洿澶氱礌鏉愶紝浣嗛璋辫姹傜殑蹇呴』閮芥湁
      const matchedRecipes = FOOD_RECIPES.filter(recipe => {
          // A. 妫€鏌ヤ富鏂?          if (recipe['main-res'] !== mainTag) return false;

          // B. 妫€鏌ヨ緟鏂?(User Input must contain all Recipe Requirements)
          const requiredTags = recipe['other-res'];
          if (requiredTags.length === 0) return true; // 涓嶉渶瑕佽緟鏂欙紝蹇呭畾婊¤冻

          // 鍒涘缓鐢ㄦ埛鎻愪緵鐨勮緟鏂橳ag鍓湰鐢ㄤ簬娑堣€楁鏌?          const providedPool = [...subTags];
          
          // 妫€鏌ラ璋辫姹傜殑姣忎釜杈呮枡鏄惁閮借兘鍦ㄧ敤鎴锋彁渚涚殑绱犳潗涓壘鍒?          for (const reqTag of requiredTags) {
              const idx = providedPool.indexOf(reqTag);
              if (idx !== -1) {
                  providedPool.splice(idx, 1); // 娑堣€楁帀涓€涓尮閰嶉」
              } else {
                  return false; // 缂哄皯蹇呰杈呮枡
              }
          }
          return true;
      });

      if (matchedRecipes.length === 0) {
          alert("鏃犳硶鍒╃敤褰撳墠鐨勯鏉愮粍鍚堟€濊€冨嚭鏂扮殑椋熻氨...");
          return;
      }

      // 3. 闅忔満閫夋嫨涓€涓尮閰嶇殑椋熻氨
      const selectedRecipe = matchedRecipes[Math.floor(Math.random() * matchedRecipes.length)];

      // 4. 璁＄畻鏁板€?      const allIngredientIds = [mainId, ...subIds];
      let totalStar = 0;
      let starSumPrice = 0;

      allIngredientIds.forEach(id => {
          const item = ITEMS[id];
          const s = parseInt(item.star || '1');
          totalStar += s;
          starSumPrice += Math.floor(getResValue(item.star) * 0.1);
      });

      const avgStar = Math.max(1, Math.round(totalStar / allIngredientIds.length));
      const basePrice = getResValue(avgStar.toString());
      const finalPrice = basePrice + starSumPrice;

      // 5. 璁剧疆棰勮鏁版嵁
      setPreviewData({
          recipeTemplate: selectedRecipe,
          ingredients: allIngredientIds,
          avgStar,
          price: finalPrice
      });
  };

  // --- 閫昏緫锛氬紑鍙戞ā寮?- 纭鍒朵綔 ---
  const handleRealCook = async () => {
      if (!previewData) return;
      setIsProcessing(true);

      // 3绉掔瓑寰?      await new Promise(resolve => setTimeout(resolve, 3000));

      const { recipeTemplate, ingredients, avgStar, price } = previewData;
      
      let finalName = recipeTemplate.name;
      let finalDesc = recipeTemplate.description;

      // LLM Generation
      // 鍙湁 API Key 瀛樺湪鏃舵墠灏濊瘯鐢熸垚
      if (apiConfig.apiKey) {
          try {
              // 鑾峰彇椋熸潗鐨勭湡瀹炰腑鏂囧悕绉板垪琛ㄥ強鎻忚堪
              const ingredientDetails = ingredients.map(id => ({
                  name: ITEMS[id]?.name || "鏈煡椋熸潗",
                  description: ITEMS[id]?.description || ""
              }));
              
              const lore = await llmService.generateFoodLore(ingredientDetails, recipeTemplate.keyword, apiConfig);
              if (lore.name) finalName = lore.name;
              if (lore.description) finalDesc = lore.description;
          } catch (e) {
              console.warn("LLM Food Gen failed, using template defaults.", e);
          }
      }

      // Create User Recipe
      const newRecipe: UserRecipe = {
          id: `ur-${Date.now()}`,
          templateId: recipeTemplate.id,
          name: finalName,
          description: finalDesc,
          imagePath: `img/foods/${recipeTemplate.img}`,
          star: avgStar,
          price: price,
          mainResId: ingredients[0],
          otherResIds: ingredients.slice(1),
          createdAt: Date.now()
      };

      onAddRecipe(newRecipe);
      
      // Consume Ingredients
      const consumption = ingredients.map(id => ({ id, count: 1 }));
      onConsumeIngredients(consumption);

      // Reset & Switch Tab
      setIsProcessing(false);
      setPreviewData(null);
      setSlots([null, null, null, null, null]);
      setActiveTab('recipes');
  };

  // --- 閫昏緫锛氳彍璋辨ā寮?---
  const getCraftableCount = (recipe: UserRecipe) => {
      const reqs: Record<string, number> = {};
      [recipe.mainResId, ...recipe.otherResIds].forEach(id => {
          reqs[id] = (reqs[id] || 0) + 1;
      });

      let min = 9999;
      for (const [id, count] of Object.entries(reqs)) {
          const invCount = inventory[id] || 0;
          const possible = Math.floor(invCount / count);
          if (possible < min) min = possible;
      }
      return min;
  };

  const confirmCraft = () => {
      if (!craftingRecipeId) return;
      const recipe = userRecipes.find(r => r.id === craftingRecipeId);
      if (!recipe) return;

      const ingredients: {id: string, count: number}[] = [];
      const rawList = [recipe.mainResId, ...recipe.otherResIds];
      
      // Aggregate ingredients
      const counts: Record<string, number> = {};
      rawList.forEach(id => counts[id] = (counts[id] || 0) + 1);
      
      Object.entries(counts).forEach(([id, baseCount]) => {
          ingredients.push({ id, count: baseCount * craftCount });
      });

      onCraftRecipe(recipe.id, craftCount, ingredients);
      setCraftingRecipeId(null);
      setCraftCount(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn font-sans">
       <div 
            className="w-full max-w-6xl h-[90vh] bg-[#2c241b] border-[3px] border-[#9b7a4c] rounded-xl shadow-2xl flex flex-col overflow-hidden relative select-none"
            onClick={e => e.stopPropagation()}
            style={{
                backgroundImage: 'linear-gradient(to bottom, #2c241b, #1a1512)'
            }}
        >
            {/* Header / Tabs - 淇甯冨眬闂 */}
            <div className="bg-[#382b26] border-b border-[#9b7a4c]/50 py-3 px-4 flex justify-between items-center shadow-md shrink-0 relative z-10 gap-4">
                <div className="flex-1 flex gap-2 md:gap-4 justify-center md:justify-start">
                    <button
                        onClick={() => setActiveTab('recipes')}
                        className={`
                            flex-1 md:flex-none px-4 py-2 text-center rounded transition-colors flex items-center justify-center gap-2
                            ${activeTab === 'recipes' 
                                ? 'bg-[#9b7a4c] text-[#f0e6d2] shadow-inner' 
                                : 'bg-transparent text-[#8c7b70] hover:text-[#d6cbb8] hover:bg-white/5'}
                        `}
                    >
                        <i className="fa-solid fa-book-open"></i> 
                        <span className="text-sm md:text-lg font-bold tracking-widest whitespace-nowrap">鑿滆氨</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('develop')}
                        className={`
                            flex-1 md:flex-none px-4 py-2 text-center rounded transition-colors flex items-center justify-center gap-2
                            ${activeTab === 'develop' 
                                ? 'bg-[#9b7a4c] text-[#f0e6d2] shadow-inner' 
                                : 'bg-transparent text-[#8c7b70] hover:text-[#d6cbb8] hover:bg-white/5'}
                        `}
                    >
                        <i className="fa-solid fa-flask"></i> 
                        <span className="text-sm md:text-lg font-bold tracking-widest whitespace-nowrap">寮€鍙戞枡鐞?/span>
                    </button>
                </div>
                
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-[#9b7a4c] hover:text-[#f0e6d2] transition-colors shrink-0">
                    <i className="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            {/* Content Container */}
            <div className="flex-1 overflow-hidden relative bg-[#e8dfd1]">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23382b26' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

                {/* --- Tab: Recipes --- */}
                {activeTab === 'recipes' && (
                    <div className="h-full overflow-y-auto p-4 custom-scrollbar relative z-10">
                        {userRecipes.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-[#8c7b70] opacity-70 gap-4">
                                <i className="fa-solid fa-book-open text-6xl"></i>
                                <span className="text-xl font-bold">鏆傛棤宸蹭範寰楄彍璋?/span>
                                <button onClick={() => setActiveTab('develop')} className="px-6 py-2 bg-[#9b7a4c] text-white rounded hover:bg-[#b45309] font-bold shadow transition-colors">鍘诲紑鍙戞柊鏂欑悊</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {userRecipes.map(recipe => {
                                    const craftable = getCraftableCount(recipe);
                                    const isRenaming = renamingId === recipe.id;

                                    return (
                                        <div key={recipe.id} className="bg-[#fcfaf7] border-2 border-[#d6cbb8] rounded-lg p-3 flex gap-4 shadow-sm hover:border-[#9b7a4c] transition-colors relative group">
                                            {/* Image & Stock */}
                                            <div className="flex flex-col items-center gap-2 shrink-0">
                                                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#e0d6c5] rounded border border-[#c7bca8] overflow-hidden relative">
                                                    <img src={resolveImgPath(recipe.imagePath)} alt={recipe.name} className="w-full h-full object-cover" />
                                                    
                                                    {/* Delete Button - Moved to Image Area for Mobile Optimization */}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); onDeleteRecipe(recipe.id); }}
                                                        className="absolute top-1 left-1 w-6 h-6 flex items-center justify-center bg-black/60 text-white/80 hover:text-red-400 hover:bg-black/80 rounded-full transition-all backdrop-blur-[2px] shadow-sm z-10"
                                                        title="鍒犻櫎椋熻氨"
                                                    >
                                                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                                                    </button>
                                                </div>
                                                <div className="text-xs font-bold text-[#8c7b70] bg-[#e8dfd1] px-2 py-0.5 rounded border border-[#d6cbb8] shadow-sm whitespace-nowrap">
                                                    搴撳瓨: {foodStock[recipe.id] || 0}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0 flex flex-col">
                                                <div className="flex justify-between items-start mb-1">
                                                    {isRenaming ? (
                                                        <div className="flex gap-2 items-center flex-1 mr-2">
                                                            <input 
                                                                type="text" 
                                                                value={tempName} 
                                                                onChange={e => setTempName(e.target.value)} 
                                                                className="flex-1 bg-white border border-[#b45309] px-2 py-1 text-sm rounded focus:outline-none"
                                                                autoFocus
                                                            />
                                                            <button onClick={() => { onRenameRecipe(recipe.id, tempName); setRenamingId(null); }} className="text-green-600"><i className="fa-solid fa-check"></i></button>
                                                            <button onClick={() => setRenamingId(null)} className="text-red-500"><i className="fa-solid fa-xmark"></i></button>
                                                        </div>
                                                    ) : (
                                                        <h3 className="font-bold text-[#382b26] text-lg truncate flex items-center gap-2">
                                                            {recipe.name}
                                                            <button 
                                                                onClick={() => { setRenamingId(recipe.id); setTempName(recipe.name); }} 
                                                                className="text-[#d6cbb8] hover:text-[#9b7a4c] text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <i className="fa-solid fa-pen"></i>
                                                            </button>
                                                        </h3>
                                                    )}
                                                    
                                                    {/* Star Rating Display */}
                                                    <div className="flex items-center text-yellow-500 text-xs gap-0.5">
                                                        {recipe.star > 5 ? (
                                                            <span className="font-black text-sm flex items-center gap-1 text-[#b45309] bg-yellow-100 px-2 py-0.5 rounded border border-yellow-300 shadow-sm">
                                                                {recipe.star} <i className="fa-solid fa-star text-xs"></i>
                                                            </span>
                                                        ) : (
                                                            [...Array(5)].map((_, i) => (
                                                                <i key={i} className={`fa-solid fa-star ${i < recipe.star ? '' : 'text-[#d6cbb8]'}`}></i>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-xs text-[#5c4d45] leading-relaxed mb-2 min-h-[2.5em] whitespace-pre-wrap break-words">
                                                    {recipe.description}
                                                </p>

                                                {/* Ingredients Row */}
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {[recipe.mainResId, ...recipe.otherResIds].map((id, idx) => (
                                                        <span key={idx} className="text-[10px] bg-[#e8dfd1] text-[#8c7b70] px-1.5 py-0.5 rounded border border-[#d6cbb8]">
                                                            {ITEMS[id]?.name}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="mt-auto flex justify-between items-end gap-2">
                                                    <div className="flex flex-col items-start bg-[#f5e6d3] px-2 py-1 rounded border border-[#e6dcc8] shrink-0">
                                                        <span className="text-[10px] text-[#8c7b70] font-bold">浼扮畻鍞环</span>
                                                        <span className="text-sm font-bold text-[#b45309] leading-none whitespace-nowrap">{recipe.price} G</span>
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => { setCraftingRecipeId(recipe.id); setCraftCount(1); }}
                                                            disabled={craftable <= 0}
                                                            className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap ${
                                                                craftable > 0 
                                                                ? 'bg-[#382b26] text-[#f0e6d2] hover:bg-[#4a3b32]' 
                                                                : 'bg-[#d6cbb8] text-[#f5f0e6] cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <i className="fa-solid fa-fire-burner"></i>
                                                            鐑硅皟 ({craftable})
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* --- Tab: Develop --- */}
                {activeTab === 'develop' && (
                    <div className="h-full flex flex-col p-4 md:p-8 relative z-10">
                        {/* Slots Area */}
                        <div className="flex-1 flex flex-col justify-center">
                            <h3 className="text-center font-bold text-[#5c4d45] mb-6 flex items-center justify-center gap-2">
                                <i className="fa-solid fa-carrot text-orange-600"></i>
                                閫夋嫨椋熸潗杩涜缁勫悎
                            </h3>
                            
                            <div className="flex flex-wrap md:flex-nowrap justify-center gap-4 mb-8">
                                <div className="w-full md:w-32 flex-shrink-0">
                                    <MaterialSlot 
                                        label="涓婚鏉?(Main)" 
                                        itemId={slots[0]} 
                                        onClick={() => setActiveSlotIndex(0)} 
                                        onClear={(e) => { e.stopPropagation(); const s = [...slots]; s[0] = null; setSlots(s); }}
                                        isMain={true}
                                    />
                                </div>
                                <div className="hidden md:flex items-center text-[#d6cbb8] text-xl">
                                    <i className="fa-solid fa-plus"></i>
                                </div>
                                <div className="flex gap-2 md:gap-4 justify-center w-full md:w-auto">
                                    {[1, 2, 3, 4].map(idx => (
                                        <div key={idx} className="w-1/4 md:w-24">
                                            <MaterialSlot 
                                                label={`杈呮枡 ${idx}`} 
                                                itemId={slots[idx]} 
                                                onClick={() => setActiveSlotIndex(idx)} 
                                                onClear={(e) => { e.stopPropagation(); const s = [...slots]; s[idx] = null; setSlots(s); }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button 
                                    onClick={handleAttemptDevelop}
                                    disabled={!slots[0]}
                                    className={`
                                        px-10 py-4 rounded-full font-black text-xl tracking-widest shadow-xl transition-all flex items-center gap-3
                                        ${slots[0] 
                                            ? 'bg-[#b45309] text-white hover:bg-[#d97706] hover:scale-105 active:scale-95' 
                                            : 'bg-[#d6cbb8] text-[#f5f0e6] cursor-not-allowed'}
                                    `}
                                >
                                    {slots[0] ? <i className="fa-solid fa-wand-magic-sparkles animate-pulse"></i> : <i className="fa-solid fa-ban"></i>}
                                    灏濊瘯鍒朵綔
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Overlay: Material Selector --- */}
                {activeSlotIndex !== null && (
                    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col animate-fadeIn">
                        <div className="flex-1 mt-10 md:mt-20 mx-4 md:mx-auto max-w-4xl w-full bg-[#fbf9f4] rounded-t-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border-x-2 border-t-2 border-[#9b7a4c]">
                            <div className="flex justify-between items-center p-4 border-b border-[#d6cbb8] bg-[#f5f0e6]">
                                <h3 className="font-bold text-[#382b26] flex items-center gap-2">
                                    <i className="fa-solid fa-basket-shopping"></i> 
                                    閫夋嫨 {activeSlotIndex === 0 ? '涓婚鏉? : '杈呮枡'}
                                </h3>
                                <button 
                                    onClick={() => setActiveSlotIndex(null)}
                                    className="w-8 h-8 rounded-full bg-[#d6cbb8] text-white hover:bg-[#9b7a4c] transition-colors flex items-center justify-center"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 bg-[#e8dfd1]">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {Object.entries(getAvailableInventory(activeSlotIndex)).map(([id, count]) => {
                                        const item = ITEMS[id];
                                        // 杩囨护鏉′欢锛氬繀椤绘槸绱犳潗(res)锛屼笖鏈夊墿浣欐暟閲?                                        if (item.category !== 'res' || (count as number) <= 0) return null;
                                        
                                        // 涓绘枡妲戒綅(slot 0)锛氳繃婊ゆ帀 non, drinks, spice, milk
                                        if (activeSlotIndex === 0 && ['non', 'drinks', 'spice', 'milk'].includes(item.tag)) return null;
                                        
                                        // 杈呮枡妲戒綅(slot 1-4)锛氳繃婊ゆ帀 non, drinks
                                        if (activeSlotIndex !== 0 && ['non', 'drinks'].includes(item.tag)) return null;

                                        return (
                                            <button
                                                key={id}
                                                onClick={() => {
                                                    const newSlots = [...slots];
                                                    newSlots[activeSlotIndex] = id;
                                                    setSlots(newSlots);
                                                    // 涓嶅叧闂獥鍙ｏ紝鍏佽鍙嶅鍒囨崲
                                                }}
                                                className={`
                                                    relative p-2 rounded border-2 flex flex-col items-center gap-1 transition-all
                                                    ${slots[activeSlotIndex] === id 
                                                        ? 'bg-[#ffeebb] border-[#b45309] shadow-inner' 
                                                        : 'bg-[#fcfaf7] border-[#d6cbb8] hover:border-[#9b7a4c]'}
                                                `}
                                            >
                                                <div className="text-2xl">{ITEM_TAGS.find(t=>t.id===item.tag)?.icon || '馃摝'}</div>
                                                <div className="text-xs font-bold text-[#382b26] line-clamp-1">{item.name}</div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-[10px] text-yellow-600"><i className="fa-solid fa-star"></i>{item.star}</span>
                                                    <span className="text-[10px] text-[#8c7b70] bg-[#e8dfd1] px-1 rounded">x{count}</span>
                                                </div>
                                                {slots[activeSlotIndex] === id && (
                                                    <div className="absolute top-1 right-1 text-emerald-500">
                                                        <i className="fa-solid fa-circle-check"></i>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Overlay: Preview Modal --- */}
                {previewData && (
                    <div className="absolute inset-0 z-50 bg-[#2c241b] flex flex-col items-center justify-center animate-fadeIn text-[#e8dfd1]">
                        {isProcessing ? (
                            <div className="text-center animate-pulse">
                                <div className="text-6xl mb-4 text-[#9b7a4c]"><i className="fa-solid fa-fire-burner animate-bounce"></i></div>
                                <h3 className="text-2xl font-bold tracking-widest">姝ｅ湪绮惧績鐑归オ涓?..</h3>
                                <p className="text-sm text-[#8c7b70] mt-2">棣欐皵姝ｅ湪寮ユ极</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-lg bg-[#fbf9f4] rounded-lg shadow-2xl overflow-hidden border-[3px] border-[#9b7a4c] m-4">
                                <div className="bg-[#382b26] p-3 text-center border-b border-[#9b7a4c]">
                                    <h3 className="text-[#f0e6d2] font-bold tracking-[0.2em]">鏂欑悊棰勮</h3>
                                </div>
                                <div className="p-6 flex flex-col items-center text-[#382b26]">
                                    <div className="w-32 h-32 rounded-full border-4 border-[#d6cbb8] overflow-hidden mb-4 shadow-lg bg-[#e0d6c5]">
                                        <img src={resolveImgPath(`img/foods/${previewData.recipeTemplate.img}`)} className="w-full h-full object-cover" alt="Preview" />
                                    </div>
                                    
                                    <div className="text-center mb-4">
                                        <div className="text-sm text-[#8c7b70] mb-1">浣跨敤绱犳潗</div>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {previewData.ingredients.map((id, i) => (
                                                <div key={i} className="flex items-center gap-1 bg-[#e8dfd1] px-2 py-1 rounded text-xs border border-[#d6cbb8]">
                                                    <span>{ITEM_TAGS.find(t=>t.id===ITEMS[id].tag)?.icon}</span>
                                                    <span>{ITEMS[id].name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full mb-6">
                                        <div className="bg-[#f5f0e6] p-3 rounded text-center border border-[#d6cbb8] flex flex-col justify-center">
                                            <div className="text-xs text-[#8c7b70] font-bold uppercase mb-1">鍝佽川鏄熺骇</div>
                                            <div className="text-yellow-500 font-bold text-lg leading-none">
                                                {previewData.avgStar} <i className="fa-solid fa-star text-sm"></i>
                                            </div>
                                        </div>
                                        <div className="bg-[#f5f0e6] p-3 rounded text-center border border-[#d6cbb8] flex flex-col justify-center">
                                            <div className="text-xs text-[#8c7b70] font-bold uppercase mb-1">浼扮畻鍞环</div>
                                            <div className="text-[#b45309] font-bold text-lg leading-none">
                                                {previewData.price} G
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full">
                                        <button 
                                            onClick={() => setPreviewData(null)}
                                            className="flex-1 py-3 bg-[#e8dfd1] text-[#5c4d45] font-bold rounded hover:bg-[#d6cbb8]"
                                        >
                                            鏀惧純
                                        </button>
                                        <button 
                                            onClick={handleRealCook}
                                            className="flex-1 py-3 bg-[#382b26] text-[#f0e6d2] font-bold rounded hover:bg-[#4a3b32] shadow-md"
                                        >
                                            鍒朵綔
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- Overlay: Craft Quantity Modal --- */}
                {craftingRecipeId && (() => {
                    const recipe = userRecipes.find(r => r.id === craftingRecipeId);
                    if (!recipe) return null;
                    const max = getCraftableCount(recipe);

                    return (
                        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fadeIn px-4">
                            <div className="bg-[#fbf9f4] w-full max-w-sm rounded-lg shadow-2xl border-2 border-[#9b7a4c] overflow-hidden">
                                <div className="bg-[#382b26] p-3 border-b border-[#9b7a4c] flex justify-between items-center">
                                    <h3 className="text-[#f0e6d2] font-bold">鎵归噺鍒朵綔</h3>
                                    <button onClick={() => setCraftingRecipeId(null)} className="text-[#8c7b70] hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                                </div>
                                <div className="p-6 text-[#382b26]">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-16 bg-[#e0d6c5] rounded border border-[#c7bca8] overflow-hidden">
                                            <img src={resolveImgPath(recipe.imagePath)} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold">{recipe.name}</div>
                                            <div className="text-xs text-[#8c7b70]">鏈€澶у彲鍒朵綔: <span className="font-bold text-[#b45309]">{max}</span></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-4 mb-6">
                                        <button 
                                            onClick={() => setCraftCount(Math.max(1, craftCount - 1))}
                                            className="w-10 h-10 bg-[#e8dfd1] rounded hover:bg-[#d6cbb8] font-bold text-xl"
                                        >-</button>
                                        <span className="text-2xl font-mono font-bold w-12 text-center">{craftCount}</span>
                                        <button 
                                            onClick={() => setCraftCount(Math.min(max, craftCount + 1))}
                                            className="w-10 h-10 bg-[#e8dfd1] rounded hover:bg-[#d6cbb8] font-bold text-xl"
                                        >+</button>
                                    </div>

                                    <div className="bg-[#f5f0e6] p-2 rounded mb-4 text-xs">
                                        <div className="font-bold text-[#8c7b70] mb-1">绱犳潗娑堣€楅瑙?</div>
                                        {[recipe.mainResId, ...recipe.otherResIds].map((id, i) => {
                                            // Count occurrences
                                            const list = [recipe.mainResId, ...recipe.otherResIds];
                                            const neededPerOne = list.filter(x => x === id).length;
                                            // Only show unique
                                            if (list.indexOf(id) !== i) return null;
                                            
                                            return (
                                                <div key={id} className="flex justify-between border-b border-[#d6cbb8]/50 last:border-0 py-0.5">
                                                    <span>{ITEMS[id].name}</span>
                                                    <span className="font-mono">{neededPerOne * craftCount}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button 
                                        onClick={confirmCraft}
                                        className="w-full py-3 bg-[#b45309] text-white font-bold rounded hover:bg-[#d97706] shadow-md"
                                    >
                                        寮€濮嬬児楗?                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })()}

            </div>
        </div>
    </div>
  );
};

export default CookingModal;

