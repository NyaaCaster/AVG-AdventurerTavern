
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
// 辅助组件：素材选择槽位
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
                        {ITEM_TAGS.find(t => t.id === item.tag)?.icon || '📦'}
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
// 主组件
// ----------------------------------------------------------------------------
const CookingModal: React.FC<CookingModalProps> = ({
  isOpen, onClose, inventory, userRecipes, foodStock,
  onAddRecipe, onConsumeIngredients, onCraftRecipe, onDeleteRecipe, onRenameRecipe, apiConfig
}) => {
  const [activeTab, setActiveTab] = useState<'recipes' | 'develop'>('recipes');
  
  // --- 开发模式状态 ---
  // Slot 0 是 Main, 1-4 是 Subs
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null); // 当前正在选择哪个槽位的素材
  
  // 预览/制作状态
  const [previewData, setPreviewData] = useState<{
      recipeTemplate: FoodRecipe;
      ingredients: string[];
      avgStar: number;
      price: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // 制作动画/API请求中

  // --- 菜谱模式状态 ---
  const [craftingRecipeId, setCraftingRecipeId] = useState<string | null>(null); // 当前正在准备烹饪的菜谱ID
  const [craftCount, setCraftCount] = useState(1);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");

  // 重置状态
  useEffect(() => {
      if (isOpen) {
          setSlots([null, null, null, null, null]);
          setPreviewData(null);
          setIsProcessing(false);
          setCraftingRecipeId(null);
          setRenamingId(null);
      }
  }, [isOpen]);

  // --- 逻辑：开发模式 - 动态库存计算 ---
  // 计算在选择某个槽位时，列表中应该显示的剩余数量
  const getAvailableInventory = (targetSlotIndex: number) => {
      const tempInv = { ...inventory };
      
      // 遍历所有槽位，扣除除当前目标槽位以外已选中的道具
      slots.forEach((itemId, idx) => {
          if (itemId && idx !== targetSlotIndex) {
              tempInv[itemId] = (tempInv[itemId] || 0) - 1;
          }
      });
      return tempInv;
  };

  // --- 逻辑：开发模式 - 匹配逻辑 ---
  const handleAttemptDevelop = () => {
      const mainId = slots[0];
      if (!mainId) return;

      const mainItem = ITEMS[mainId];
      if (!mainItem) return;

      const subIds = slots.slice(1).filter(Boolean) as string[];
      const subItems = subIds.map(id => ITEMS[id]);
      
      // 1. 收集所有 Tag
      const mainTag = mainItem.tag;
      const subTags = subItems.map(i => i.tag).filter(Boolean) as string[]; // 用户提供的辅料Tags

      // 2. 筛选符合条件的食谱
      // 规则：Main Tag 必须匹配。
      // 规则：食谱要求的 other-res 必须被用户提供的 subTags 完全包含 (最小组合匹配)
      // 注意：用户可以提供更多素材，但食谱要求的必须都有
      const matchedRecipes = FOOD_RECIPES.filter(recipe => {
          // A. 检查主料
          if (recipe['main-res'] !== mainTag) return false;

          // B. 检查辅料 (User Input must contain all Recipe Requirements)
          const requiredTags = recipe['other-res'];
          if (requiredTags.length === 0) return true; // 不需要辅料，必定满足

          // 创建用户提供的辅料Tag副本用于消耗检查
          const providedPool = [...subTags];
          
          // 检查食谱要求的每个辅料是否都能在用户提供的素材中找到
          for (const reqTag of requiredTags) {
              const idx = providedPool.indexOf(reqTag);
              if (idx !== -1) {
                  providedPool.splice(idx, 1); // 消耗掉一个匹配项
              } else {
                  return false; // 缺少必要辅料
              }
          }
          return true;
      });

      if (matchedRecipes.length === 0) {
          alert("无法利用当前的食材组合思考出新的食谱...");
          return;
      }

      // 3. 随机选择一个匹配的食谱
      const selectedRecipe = matchedRecipes[Math.floor(Math.random() * matchedRecipes.length)];

      // 4. 计算数值
      const allIngredientIds = [mainId, ...subIds];
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

      // 5. 设置预览数据
      setPreviewData({
          recipeTemplate: selectedRecipe,
          ingredients: allIngredientIds,
          avgStar,
          price: finalPrice
      });
  };

  // --- 逻辑：开发模式 - 确认制作 ---
  const handleRealCook = async () => {
      if (!previewData) return;
      setIsProcessing(true);

      // 3秒等待
      await new Promise(resolve => setTimeout(resolve, 3000));

      const { recipeTemplate, ingredients, avgStar, price } = previewData;
      
      let finalName = recipeTemplate.name;
      let finalDesc = recipeTemplate.description;

      // LLM Generation
      // 只有 API Key 存在时才尝试生成
      if (apiConfig.apiKey) {
          try {
              // 获取食材的真实中文名称列表及描述
              const ingredientDetails = ingredients.map(id => ({
                  name: ITEMS[id]?.name || "未知食材",
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

  // --- 逻辑：菜谱模式 ---
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
            {/* Header / Tabs - 修复布局问题 */}
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
                        <span className="text-sm md:text-lg font-bold tracking-widest whitespace-nowrap">菜谱</span>
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
                        <span className="text-sm md:text-lg font-bold tracking-widest whitespace-nowrap">开发料理</span>
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
                                <span className="text-xl font-bold">暂无已习得菜谱</span>
                                <button onClick={() => setActiveTab('develop')} className="px-6 py-2 bg-[#9b7a4c] text-white rounded hover:bg-[#b45309] font-bold shadow transition-colors">去开发新料理</button>
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
                                                        title="删除食谱"
                                                    >
                                                        <i className="fa-solid fa-trash-can text-[10px]"></i>
                                                    </button>
                                                </div>
                                                <div className="text-xs font-bold text-[#8c7b70] bg-[#e8dfd1] px-2 py-0.5 rounded border border-[#d6cbb8] shadow-sm whitespace-nowrap">
                                                    库存: {foodStock[recipe.id] || 0}
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
                                                        <span className="text-[10px] text-[#8c7b70] font-bold">估算售价</span>
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
                                                            烹调 ({craftable})
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
                                选择食材进行组合
                            </h3>
                            
                            <div className="flex flex-wrap md:flex-nowrap justify-center gap-4 mb-8">
                                <div className="w-full md:w-32 flex-shrink-0">
                                    <MaterialSlot 
                                        label="主食材 (Main)" 
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
                                                label={`辅料 ${idx}`} 
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
                                    尝试制作
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
                                    选择 {activeSlotIndex === 0 ? '主食材' : '辅料'}
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
                                        // 过滤条件：道具必须存在、必须是素材(res)，且有剩余数量
                                        if (!item || item.category !== 'res' || (count as number) <= 0) return null;
                                        
                                        // 主料槽位(slot 0)：过滤掉 non, drinks, spice, milk
                                        if (activeSlotIndex === 0 && ['non', 'drinks', 'spice', 'milk'].includes(item.tag ?? '')) return null;
                                        
                                        // 辅料槽位(slot 1-4)：过滤掉 non, drinks
                                        if (activeSlotIndex !== 0 && ['non', 'drinks'].includes(item.tag ?? '')) return null;

                                        return (
                                            <button
                                                key={id}
                                                onClick={() => {
                                                    const newSlots = [...slots];
                                                    newSlots[activeSlotIndex] = id;
                                                    setSlots(newSlots);
                                                    // 不关闭窗口，允许反复切换
                                                }}
                                                className={`
                                                    relative p-2 rounded border-2 flex flex-col items-center gap-1 transition-all
                                                    ${slots[activeSlotIndex] === id 
                                                        ? 'bg-[#ffeebb] border-[#b45309] shadow-inner' 
                                                        : 'bg-[#fcfaf7] border-[#d6cbb8] hover:border-[#9b7a4c]'}
                                                `}
                                            >
                                                <div className="text-2xl">{ITEM_TAGS.find(t=>t.id===(item.tag ?? ''))?.icon || '📦'}</div>
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
                                <h3 className="text-2xl font-bold tracking-widest">正在精心烹饪中...</h3>
                                <p className="text-sm text-[#8c7b70] mt-2">香气正在弥漫</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-lg bg-[#fbf9f4] rounded-lg shadow-2xl overflow-hidden border-[3px] border-[#9b7a4c] m-4">
                                <div className="bg-[#382b26] p-3 text-center border-b border-[#9b7a4c]">
                                    <h3 className="text-[#f0e6d2] font-bold tracking-[0.2em]">料理预览</h3>
                                </div>
                                <div className="p-6 flex flex-col items-center text-[#382b26]">
                                    <div className="w-32 h-32 rounded-full border-4 border-[#d6cbb8] overflow-hidden mb-4 shadow-lg bg-[#e0d6c5]">
                                        <img src={resolveImgPath(`img/foods/${previewData.recipeTemplate.img}`)} className="w-full h-full object-cover" alt="Preview" />
                                    </div>
                                    
                                    <div className="text-center mb-4">
                                        <div className="text-sm text-[#8c7b70] mb-1">使用素材</div>
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
                                            <div className="text-xs text-[#8c7b70] font-bold uppercase mb-1">品质星级</div>
                                            <div className="text-yellow-500 font-bold text-lg leading-none">
                                                {previewData.avgStar} <i className="fa-solid fa-star text-sm"></i>
                                            </div>
                                        </div>
                                        <div className="bg-[#f5f0e6] p-3 rounded text-center border border-[#d6cbb8] flex flex-col justify-center">
                                            <div className="text-xs text-[#8c7b70] font-bold uppercase mb-1">估算售价</div>
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
                                            放弃
                                        </button>
                                        <button 
                                            onClick={handleRealCook}
                                            className="flex-1 py-3 bg-[#382b26] text-[#f0e6d2] font-bold rounded hover:bg-[#4a3b32] shadow-md"
                                        >
                                            制作
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
                                    <h3 className="text-[#f0e6d2] font-bold">批量制作</h3>
                                    <button onClick={() => setCraftingRecipeId(null)} className="text-[#8c7b70] hover:text-white"><i className="fa-solid fa-xmark"></i></button>
                                </div>
                                <div className="p-6 text-[#382b26]">
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-16 bg-[#e0d6c5] rounded border border-[#c7bca8] overflow-hidden">
                                            <img src={resolveImgPath(recipe.imagePath)} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-bold">{recipe.name}</div>
                                            <div className="text-xs text-[#8c7b70]">最大可制作: <span className="font-bold text-[#b45309]">{max}</span></div>
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
                                        <div className="font-bold text-[#8c7b70] mb-1">素材消耗预览:</div>
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
                                        开始烹饪
                                    </button>
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
