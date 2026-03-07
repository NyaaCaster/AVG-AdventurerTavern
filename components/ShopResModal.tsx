/**
 * ShopResModal - 市集食材购买模态框
 * 功能：
 * - 「食材购入」页签：展示 ITEM_RES_SHOP 中定义的食材商品，无库存限制
 * - 购物车结算：批量操作，减少数据库写入次数
 *
 * 响应式说明：
 * - 桌面端（md+）：左侧商品列表 + 右侧购物车侧栏
 * - 移动端：商品列表全宽，底部折叠式购物车栏
 *
 * 扩展说明：
 * - 商品数据源在 data/item-res-shop.ts 中维护
 * - 定价规则在 data/item-value-table.ts 中维护
 */
import React, { useState, useMemo, useEffect } from 'react';
import { ItemData, CartItem } from '../types';
import { ITEMS_RES } from '../data/item-res';
import { ITEM_RES_SHOP, getResShopItemPrice } from '../data/item-res-shop';
import { ITEM_TAGS, ITEM_CATEGORIES } from '../data/item-type';
import { resolveImgPath } from '../utils/imagePath';
import QuantityControl from './QuantityControl';

interface ShopResModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: Record<string, number>;
  currentGold: number;
  onTransaction?: (changes: {
    goldChange: number;
    inventoryChanges: Record<string, number>;
  }) => void;
}

const ShopResModal: React.FC<ShopResModalProps> = ({
  isOpen,
  onClose,
  inventory,
  currentGold,
  onTransaction
}) => {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartExpanded, setCartExpanded] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCart({});
      setCartExpanded(false);
    }
  }, [isOpen]);

  const getTagIcon = (tagId?: string) => {
    const tag = ITEM_TAGS.find(t => t.id === (tagId || 'non'));
    return tag?.icon ?? '📦';
  };

  const renderStarBadge = (item: ItemData) => (
    <span className="text-[10px] px-1.5 py-0.5 text-yellow-400 font-bold bg-black/40 rounded border border-yellow-600/30 flex items-center gap-0.5 shrink-0">
      <i className="fa-solid fa-star text-[8px]"></i>
      {item.star || '?'}
    </span>
  );

  const addToCart = (itemId: string, price: number) => {
    setCart(prev => {
      const cur = prev[itemId] as CartItem | undefined;
      const next = cur ? cur.quantity + 1 : 1;
      return { ...prev, [itemId]: { itemId, quantity: next, price } as CartItem };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const cur = prev[itemId];
      if (!cur) return prev;
      if (cur.quantity <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { ...cur, quantity: cur.quantity - 1 } };
    });
  };

  const setCartQty = (itemId: string, price: number, qty: number) => {
    if (qty <= 0) {
      setCart(prev => { const { [itemId]: _, ...rest } = prev; return rest; });
    } else {
      setCart(prev => ({ ...prev, [itemId]: { itemId, quantity: qty, price } as CartItem }));
    }
  };

  const clearCart = () => setCart({});

  const cartTotal = useMemo(
    () => (Object.values(cart) as CartItem[]).reduce((s, i) => s + i.quantity * i.price, 0),
    [cart]
  );

  const cartItemCount = useMemo(
    () => (Object.values(cart) as CartItem[]).reduce((s, i) => s + i.quantity, 0),
    [cart]
  );

  const buyItems = useMemo(
    () => ITEM_RES_SHOP
      .map(s => ({ shopItem: s, item: ITEMS_RES[s.resId] }))
      .filter(s => s.item !== undefined),
    []
  );

  const selectedItem = useMemo(() => selectedItemId ? ITEMS_RES[selectedItemId] : null, [selectedItemId]);

  const handleCheckout = () => {
    if (cartItemCount === 0 || currentGold < cartTotal) return;
    const inventoryChanges: Record<string, number> = {};
    (Object.values(cart) as CartItem[]).forEach(ci => {
      inventoryChanges[ci.itemId] = (inventory[ci.itemId] || 0) + ci.quantity;
    });
    onTransaction?.({ goldChange: -cartTotal, inventoryChanges });
    setCart({});
  };

  const renderItemIcon = (tagId: string | undefined, holdCount: number, itemId: string) => (
    <div
      className="flex flex-col items-center gap-1 shrink-0 cursor-pointer hover:scale-105 transition-transform"
      onClick={() => setSelectedItemId(itemId)}
    >
      <div className="w-11 h-11 md:w-13 md:h-13 bg-[#e0d6c5] border border-[#c7bca8] rounded flex items-center justify-center text-xl shadow-inner overflow-hidden">
        {ITEMS_RES[itemId]?.imagePath ? (
          <img
            src={resolveImgPath(ITEMS_RES[itemId].imagePath)}
            alt={ITEMS_RES[itemId].name}
            className="w-full h-full object-cover"
          />
        ) : (
          getTagIcon(tagId)
        )}
      </div>
      <span className="text-[9px] text-[#8c7b70] font-bold whitespace-nowrap leading-none">
        持有 <span className="text-[#5c4d45]">{holdCount}</span>
      </span>
    </div>
  );

  const renderCartPanel = () => (
    <>
      {/* 购物车头部：标题 + 金币 */}
      <div className="p-3 border-b border-[#9b7a4c]/30 flex items-center justify-between gap-2 shrink-0">
        <h3 className="text-[#f0e6d2] font-bold text-sm tracking-wider flex items-center gap-2">
          <i className="fa-solid fa-cart-shopping text-[#9b7a4c]" />
          购物车
          {cartItemCount > 0 && (
            <span className="bg-[#b45309] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
              {cartItemCount > 9 ? '9+' : cartItemCount}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-1.5 bg-[#1a1512] px-2 py-1 rounded-lg border border-[#9b7a4c]/40">
          <i className="fa-solid fa-coins text-amber-400 text-xs" />
          <span className="text-[#f0e6d2] font-bold font-mono text-xs">{currentGold.toLocaleString()}</span>
          <span className="text-[#9b7a4c] text-[10px] font-bold">G</span>
        </div>
      </div>

      {/* 购物车列表 */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar min-h-0">
        {cartItemCount === 0 ? (
          <div className="h-full min-h-[80px] flex flex-col items-center justify-center text-[#8c7b70] opacity-60 gap-2 py-4">
            <i className="fa-solid fa-shopping-basket text-3xl" />
            <span className="text-xs font-bold">购物车为空</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {(Object.values(cart) as CartItem[]).map(ci => {
              const item = ITEMS_RES[ci.itemId];
              if (!item) return null;
              return (
                <div key={ci.itemId} className="bg-[#2c241b] border border-[#9b7a4c]/30 rounded-lg p-2">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-[#f0e6d2] font-bold text-xs truncate flex-1 leading-tight">{item.name}</span>
                    <span className="text-[#9b7a4c] font-mono text-xs ml-1.5 shrink-0">x{ci.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold font-mono text-amber-400">
                      -{(ci.quantity * ci.price).toLocaleString()} G
                    </span>
                    <button
                      onClick={() => { const { [ci.itemId]: _, ...rest } = cart; setCart(rest); }}
                      className="text-red-400 hover:text-red-300 transition-colors p-0.5"
                      title="移除"
                    >
                      <i className="fa-solid fa-trash text-[10px]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 结算区 */}
      <div className="p-3 border-t border-[#9b7a4c]/30 bg-[#2c241b] shrink-0">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[#8c7b70] font-bold text-xs">总计</span>
          <span className="text-lg font-black font-mono text-amber-400">
            -{cartTotal.toLocaleString()} G
          </span>
        </div>

        {cartItemCount > 0 && (
          <div className={`text-[10px] mb-2 font-bold ${
            currentGold < cartTotal ? 'text-red-400' : 'text-emerald-400'
          }`}>
            {currentGold < cartTotal
              ? `资金不足（差 ${(cartTotal - currentGold).toLocaleString()} G）`
              : `结算后剩余 ${(currentGold - cartTotal).toLocaleString()} G`}
          </div>
        )}

        <div className="space-y-1.5">
          <button
            onClick={handleCheckout}
            disabled={cartItemCount === 0 || currentGold < cartTotal}
            className={`w-full py-2 rounded-lg font-bold tracking-wider transition-all border-2 flex items-center justify-center gap-2 text-xs ${
              cartItemCount > 0 && currentGold >= cartTotal
                ? 'bg-[#9b7a4c] text-[#1a1512] border-[#f0e6d2]/50 hover:bg-[#b45309] shadow-lg'
                : 'bg-[#4a3b32] text-[#8c7b70] border-transparent cursor-not-allowed'
            }`}
          >
            <i className="fa-solid fa-check" />
            确认结算
          </button>
          <button
            onClick={clearCart}
            disabled={cartItemCount === 0}
            className={`w-full py-1.5 rounded-lg font-bold text-[10px] transition-all ${
              cartItemCount > 0
                ? 'bg-[#382b26] text-[#9b7a4c] hover:bg-[#4a3b32]'
                : 'bg-transparent text-[#5c4d45] cursor-not-allowed'
            }`}
          >
            <i className="fa-solid fa-rotate-right mr-1" />
            清空购物车
          </button>
        </div>
      </div>
    </>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 md:p-4 animate-fadeIn">
      <div className="w-full max-w-5xl h-[92vh] md:h-[90vh] flex flex-col md:flex-row bg-[#e8dfd1] rounded-r-xl rounded-l-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">

        {/* 书脊 */}
        <div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 bg-gradient-to-r from-[#2c241b] via-[#3d3226] to-[#2c241b] z-20 shadow-xl border-r border-[#1a1512]" />

        {/* 外框装饰 */}
        <div className="absolute inset-0 border-[6px] md:border-[8px] border-[#382b26] rounded-r-xl pointer-events-none z-10 border-l-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]" />

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-[calc(16rem+0.5rem)] lg:right-[calc(18rem+0.5rem)] z-30 w-7 h-7 flex items-center justify-center text-[#5c4d45] hover:text-[#b45309] transition-colors rounded-full hover:bg-[#d6cbb8]/50"
          title="关闭"
        >
          <i className="fa-solid fa-xmark text-base" />
        </button>

        {/* ── 主内容区 ── */}
        <div className="flex-1 flex flex-col pl-5 md:pl-8 pr-2 md:pr-3 pt-3 pb-2 relative w-full min-h-0 overflow-hidden">

          {/* 账本横线背景 */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: 'linear-gradient(#9b7a4c 1px, transparent 1px)', backgroundSize: '100% 2.5rem', marginTop: '3rem' }}
          />

          {/* 标题 */}
          <div className="pb-1.5 border-b border-[#9b7a4c]/30 mb-2 relative z-10 shrink-0">
            <h2 className="text-center text-base md:text-xl font-bold text-[#382b26] tracking-[0.2em] flex items-center justify-center gap-2">
              <i className="fa-solid fa-basket-shopping text-[#9b7a4c]" />
              市集食材店
            </h2>
          </div>

          {/* 页签（仅食材购入，单页签样式保持一致） */}
          <div className="flex justify-center gap-6 md:gap-10 mb-2 relative z-10 shrink-0">
            <button
              className="pb-0.5 border-b-2 border-[#b45309] text-[#b45309] scale-105 px-2 flex items-center gap-1.5 text-xs md:text-sm font-bold whitespace-nowrap"
            >
              <i className="fa-solid fa-bag-shopping" />
              食材购入
            </button>
          </div>

          {/* 商品列表 */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar relative z-10 min-h-0">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3 py-1 pb-3">
              {buyItems.map(({ shopItem, item }) => {
                const cartItem = cart[shopItem.resId];
                const holdCount = inventory[shopItem.resId] || 0;
                const actualPrice = getResShopItemPrice(shopItem);
                return (
                  <div key={shopItem.id} className="bg-[#f5f0e6] border border-[#d6cbb8] p-2 md:p-3 rounded-lg shadow-sm hover:shadow-md hover:border-[#9b7a4c] transition-all group">
                    <div className="flex gap-2">
                      {renderItemIcon(item.tag, holdCount, shopItem.resId)}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h4
                            className="font-bold text-[#2c241b] truncate pr-1 text-xs md:text-sm group-hover:text-[#9b7a4c] transition-colors leading-tight cursor-pointer hover:underline"
                            onClick={() => setSelectedItemId(shopItem.resId)}
                          >
                            {item.name}
                          </h4>
                          {renderStarBadge(item)}
                        </div>
                        <p
                          className="text-[9px] md:text-[10px] text-[#6e5d52] line-clamp-2 leading-tight mb-1.5 cursor-pointer hover:text-[#4a3b32]"
                          onClick={() => setSelectedItemId(shopItem.resId)}
                        >
                          {item.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#b45309] font-mono text-xs md:text-sm">{actualPrice} G</span>
                          <QuantityControl
                            value={cartItem?.quantity || 0}
                            onIncrease={() => addToCart(shopItem.resId, actualPrice)}
                            onDecrease={() => removeFromCart(shopItem.resId)}
                            onChange={qty => setCartQty(shopItem.resId, actualPrice, qty)}
                            btnClassName={enabled => `w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center font-bold text-xs transition-all ${enabled ? 'bg-[#9b7a4c] text-[#1a1512] hover:bg-[#b45309]' : 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 移动端：底部折叠购物车 ── */}
          <div className="md:hidden shrink-0 relative z-10 border-t border-[#9b7a4c]/30">
            <button
              onClick={() => setCartExpanded(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 bg-[#382b26] text-[#f0e6d2]"
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-cart-shopping text-[#9b7a4c] text-sm" />
                <span className="font-bold text-xs tracking-wider">购物车</span>
                {cartItemCount > 0 && (
                  <span className="bg-[#b45309] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-[#1a1512] px-2 py-0.5 rounded border border-[#9b7a4c]/40">
                  <i className="fa-solid fa-coins text-amber-400 text-[10px]" />
                  <span className="text-[#f0e6d2] font-mono font-bold text-[10px]">{currentGold.toLocaleString()} G</span>
                </div>
                {cartItemCount > 0 && (
                  <span className="font-mono font-bold text-xs text-amber-400">
                    -{cartTotal.toLocaleString()} G
                  </span>
                )}
                <i className={`fa-solid fa-chevron-${cartExpanded ? 'down' : 'up'} text-[#9b7a4c] text-xs`} />
              </div>
            </button>

            {cartExpanded && (
              <div className="bg-[#382b26] flex flex-col max-h-[45vh] overflow-hidden">
                {renderCartPanel()}
              </div>
            )}
          </div>
        </div>

        {/* ── 桌面端：右侧购物车侧栏 ── */}
        <div className="hidden md:flex w-64 lg:w-72 bg-[#382b26] border-l border-[#9b7a4c]/30 flex-col rounded-r-lg overflow-hidden shrink-0">
          {renderCartPanel()}
        </div>
      </div>

      {/* 商品详情弹窗 */}
      {selectedItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn" onClick={() => setSelectedItemId(null)}>
          <div
            className="bg-[#2c241b] border-2 border-[#9b7a4c] rounded-xl shadow-2xl max-w-lg w-full relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItemId(null)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-[#382b26] rounded-full text-[#9b7a4c] hover:bg-white/10 hover:text-white transition-colors z-10"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="bg-gradient-to-b from-[#3d3226] to-[#2c241b] p-6 flex flex-col items-center justify-center border-b border-[#9b7a4c]/30 relative">
              <div className="w-24 h-24 bg-[#e0d6c5] border-4 border-[#c7bca8] rounded-2xl flex items-center justify-center text-5xl shadow-xl z-10 overflow-hidden">
                {selectedItem.imagePath ? (
                  <img
                    src={resolveImgPath(selectedItem.imagePath)}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getTagIcon(selectedItem.tag)
                )}
              </div>
              <h2 className="text-2xl font-bold text-[#f0e6d2] mt-4 tracking-wider text-shadow-sm text-center">{selectedItem.name}</h2>

              <div className="flex items-center gap-3 mt-2">
                {renderStarBadge(selectedItem)}
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#9b7a4c]/20 text-[#9b7a4c] border border-[#9b7a4c]/30 uppercase tracking-widest">
                  {ITEM_CATEGORIES.find(c => c.id === selectedItem.category)?.name || '食材'}
                </span>
                {selectedItem.tag && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-700/50 text-slate-300 border border-slate-600/30 uppercase tracking-widest">
                    {ITEM_TAGS.find(t => t.id === selectedItem.tag)?.name || selectedItem.tag}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 bg-[#e8dfd1] text-[#2c241b]">
              {selectedItem.stats && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(selectedItem.stats).map(([stat, val]) => (
                    <div key={stat} className="bg-[#d6cbb8] border border-[#c7bca8] px-3 py-1.5 rounded flex items-center gap-2 shadow-sm">
                      <span className="text-[10px] font-bold text-[#6e5d52] uppercase">{stat}</span>
                      <span className={`font-mono font-bold ${(val as number) > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {(val as number) > 0 ? `+${val}` : val}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-[#f5f0e6] border border-[#d6cbb8] p-4 rounded-lg shadow-inner mb-4">
                <div className="text-sm md:text-base leading-relaxed font-medium text-[#4a3b32] whitespace-pre-wrap">
                  {selectedItem.description}
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-[#8c7b70] font-mono border-t border-[#d6cbb8] pt-3">
                <span>ID: {selectedItem.id}</span>
                <span>持有数量: <strong className="text-[#2c241b] text-base">{inventory[selectedItem.id] || 0}</strong> / {selectedItem.maxStack || 99}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopResModal;