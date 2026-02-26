/**
 * ShopItemModal - 道具商店模态框
 *
 * 功能：
 * - 「道具购入」页签：展示 ITEM_RES_SHOP 中定义的商品，无库存限制
 * - 「素材出售」页签：展示玩家持有的所有 item-res 素材，出售价格 = 星级基准价 / 2
 * - 购物车结算：批量操作，减少数据库写入次数
 *
 * 扩展说明：
 * - 若需新增其他商店类型（武器店、防具店等），复用此组件并传入不同的商品数据源即可
 * - 商品数据源在 data/item-res-shop.ts 中维护
 * - 出售价格规则在 data/item-value-table.ts 中维护
 */
import React, { useState, useMemo, useEffect } from 'react';
import { ShopItemModalProps, ShopTab, ItemData } from '../types';
import { ITEMS_RES } from '../data/item-res';
import { ITEM_RES_SHOP } from '../data/item-res-shop';
import { getResValue } from '../data/item-value-table';
import { ITEM_TAGS } from '../data/item-type';

const ShopItemModal: React.FC<ShopItemModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'buy',
  inventory,
  currentGold,
  onTransaction
}) => {
  const [activeTab, setActiveTab] = useState<ShopTab>(initialTab);
  // cart: key = itemId, value = { itemId, quantity, price }
  const [cart, setCart] = useState<Record<string, { itemId: string; quantity: number; price: number }>>({}); 

  // 每次打开时重置页签和购物车
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCart({});
    }
  }, [isOpen, initialTab]);

  const getTagIcon = (tagId?: string) => {
    if (!tagId) return null;
    const tag = ITEM_TAGS.find(t => t.id === tagId);
    return tag?.icon ?? null;
  };

  const renderStarBadge = (item: ItemData) => (
    <span className="text-xs px-2 py-0.5 text-yellow-400 font-bold bg-black/40 rounded border border-yellow-600/30 shadow-sm flex items-center gap-1">
      <i className="fa-solid fa-star text-[10px]"></i>
      {item.star || '?'}
    </span>
  );

  // 出售价格 = 星级基准价的一半（向下取整）
  const calcSellPrice = (item: ItemData) =>
    Math.floor(getResValue(item.star) / 2);

  // maxQty: 出售时传入持有数量上限，购入时不传（无上限）
  const addToCart = (itemId: string, price: number, maxQty?: number) => {
    setCart(prev => {
      const cur = prev[itemId];
      const next = cur ? cur.quantity + 1 : 1;
      if (maxQty !== undefined && next > maxQty) return prev;
      return { ...prev, [itemId]: { itemId, quantity: next, price } };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const cur = prev[itemId];
      if (!cur) return prev;
      if (cur.quantity <= 1) {
        // 数量归零时从购物车移除
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { ...cur, quantity: cur.quantity - 1 } };
    });
  };

  const clearCart = () => setCart({});

  const cartTotal = useMemo(
    () => Object.values(cart).reduce((s, i) => s + i.quantity * i.price, 0),
    [cart]
  );

  const cartItemCount = useMemo(
    () => Object.values(cart).reduce((s, i) => s + i.quantity, 0),
    [cart]
  );

  // 购入列表：从 ITEM_RES_SHOP 读取，过滤掉 ITEMS_RES 中不存在的条目
  const buyItems = useMemo(
    () => ITEM_RES_SHOP
      .map(s => ({ shopItem: s, item: ITEMS_RES[s.resId] }))
      .filter(s => s.item !== undefined),
    []
  );

  // 出售列表：玩家持有的所有 item-res 素材（数量 > 0）
  const sellItems = useMemo(
    () => Object.entries(inventory)
      .filter(([id, cnt]) => cnt > 0 && ITEMS_RES[id])
      .map(([id, cnt]) => ({
        itemId: id,
        item: ITEMS_RES[id],
        count: cnt,
        price: calcSellPrice(ITEMS_RES[id])
      })),
    [inventory]
  );

  /**
   * 结算购物车
   * - 购入：goldChange 为负数，inventoryChanges 增加对应数量
   * - 出售：goldChange 为正数，inventoryChanges 减少对应数量
   * 通过 onTransaction 回调一次性提交，减少数据库写入次数
   */
  const handleCheckout = () => {
    if (cartItemCount === 0) return;
    const inventoryChanges: Record<string, number> = {};
    let goldChange = 0;
    if (activeTab === 'buy') {
      if (currentGold < cartTotal) return;
      goldChange = -cartTotal;
      Object.values(cart).forEach(ci => {
        inventoryChanges[ci.itemId] = (inventory[ci.itemId] || 0) + ci.quantity;
      });
    } else {
      goldChange = cartTotal;
      Object.values(cart).forEach(ci => {
        inventoryChanges[ci.itemId] = Math.max(0, (inventory[ci.itemId] || 0) - ci.quantity);
      });
    }
    onTransaction?.({ goldChange, inventoryChanges });
    setCart({});
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-6xl h-[90vh] flex bg-[#e8dfd1] rounded-r-xl rounded-l-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">

        {/* 书脊 */}
        <div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 bg-gradient-to-r from-[#2c241b] via-[#3d3226] to-[#2c241b] z-20 shadow-xl border-r border-[#1a1512]" />

        {/* 外框装饰 */}
        <div className="absolute inset-0 border-[8px] border-[#382b26] rounded-r-xl pointer-events-none z-10 border-l-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]" />

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 z-30 w-7 h-7 flex items-center justify-center text-[#5c4d45] hover:text-[#b45309] transition-colors rounded-full hover:bg-[#d6cbb8]/50"
          title="关闭"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>

        <div className="flex-1 flex flex-col pl-6 md:pl-8 pr-3 md:pr-4 py-3 relative w-full">
          {/* 账本横线背景 */}
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: 'linear-gradient(#9b7a4c 1px, transparent 1px)', backgroundSize: '100% 2.5rem', marginTop: '3rem' }}
          />

          {/* 标题栏 */}
          <div className="flex items-center justify-between pb-1 border-b border-[#9b7a4c]/30 mb-2 relative z-10 shrink-0">
            <h2 className="flex-1 text-center text-lg md:text-xl font-bold text-[#382b26] tracking-[0.2em] flex items-center justify-center gap-2">
              <i className="fa-solid fa-store text-[#9b7a4c]" />
              道具商店
            </h2>
            <div className="flex items-center gap-2 bg-[#f5f0e6] px-3 py-1.5 rounded-lg border border-[#d6cbb8]">
              <i className="fa-solid fa-coins text-amber-400" />
              <span className="text-[#382b26] font-bold font-mono text-sm">{currentGold.toLocaleString()}</span>
              <span className="text-[#9b7a4c] text-xs font-bold">G</span>
            </div>
          </div>

          {/* 页签 */}
          <div className="flex justify-center gap-8 mb-2 relative z-10 shrink-0">
            {(['buy', 'sell'] as ShopTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); clearCart(); }}
                className={`pb-0.5 border-b-2 transition-all px-2 flex items-center gap-1.5 text-xs md:text-sm font-bold whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[#b45309] text-[#b45309] scale-105'
                    : 'border-transparent text-[#5c4d45] hover:text-[#8c7b70]'
                }`}
              >
                <i className={`fa-solid ${tab === 'buy' ? 'fa-bag-shopping' : 'fa-coins'}`} />
                {tab === 'buy' ? '道具购入' : '素材出售'}
              </button>
            ))}
          </div>
          {/* 主体区域 */}
          <div className="flex-1 flex overflow-hidden relative z-10 gap-3">

            {/* 商品列表 */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 py-1">

                {activeTab === 'buy' && buyItems.map(({ shopItem, item }) => {
                  const cartItem = cart[shopItem.resId];
                  return (
                    <div key={shopItem.id} className="bg-[#f5f0e6] border border-[#d6cbb8] p-3 rounded-lg shadow-sm hover:shadow-lg hover:border-[#9b7a4c] transition-all group">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 bg-[#e0d6c5] border border-[#c7bca8] rounded flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                          {getTagIcon(item.tag) || <i className="fa-solid fa-box text-[#9b7a4c]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-[#2c241b] truncate pr-2 text-sm group-hover:text-[#9b7a4c] transition-colors">{item.name}</h4>
                            {renderStarBadge(item)}
                          </div>
                          <p className="text-[10px] text-[#6e5d52] line-clamp-2 leading-tight mb-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#b45309] font-mono text-sm">{shopItem.price} G</span>
                            <div className="flex items-center gap-1">
                              <button onClick={() => removeFromCart(shopItem.resId)} disabled={!cartItem}
                                className={`w-6 h-6 rounded flex items-center justify-center font-bold text-sm transition-all ${
                                  cartItem ? 'bg-[#382b26] text-[#f0e6d2] hover:bg-[#2c241b]' : 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed'
                                }`}>-</button>
                              <span className="w-7 text-center font-bold text-[#382b26] text-sm">{cartItem?.quantity || 0}</span>
                              <button onClick={() => addToCart(shopItem.resId, shopItem.price)}
                                className="w-6 h-6 rounded flex items-center justify-center font-bold text-sm bg-[#9b7a4c] text-[#1a1512] hover:bg-[#b45309] transition-all">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {activeTab === 'sell' && (
                  sellItems.length === 0
                    ? (
                      <div className="col-span-full flex flex-col items-center justify-center text-[#5c4d45] opacity-60 gap-4 py-16">
                        <i className="fa-solid fa-box-open text-5xl" />
                        <span className="text-lg font-bold tracking-widest">暂无素材可出售</span>
                      </div>
                    )
                    : sellItems.map(({ itemId, item, count, price }) => {
                        const cartItem = cart[itemId];
                        return (
                          <div key={itemId} className="bg-[#f5f0e6] border border-[#d6cbb8] p-3 rounded-lg shadow-sm hover:shadow-lg hover:border-[#9b7a4c] transition-all group">
                            <div className="flex gap-3">
                              <div className="w-14 h-14 bg-[#e0d6c5] border border-[#c7bca8] rounded flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                                {getTagIcon(item.tag) || <i className="fa-solid fa-box text-[#9b7a4c]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-bold text-[#2c241b] truncate pr-2 text-sm group-hover:text-[#9b7a4c] transition-colors">{item.name}</h4>
                                  {renderStarBadge(item)}
                                </div>
                                <p className="text-[10px] text-[#6e5d52] line-clamp-2 leading-tight mb-2">{item.description}</p>
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-emerald-600 font-mono text-sm">+{price} G / 个</span>
                                    <span className="text-[10px] text-[#8c7b70]">持有: {count}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => removeFromCart(itemId)} disabled={!cartItem}
                                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-sm transition-all ${
                                        cartItem ? 'bg-[#382b26] text-[#f0e6d2] hover:bg-[#2c241b]' : 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed'
                                      }`}>-</button>
                                    <span className="w-7 text-center font-bold text-[#382b26] text-sm">{cartItem?.quantity || 0}</span>
                                    <button onClick={() => addToCart(itemId, price, count)}
                                      disabled={!!(cartItem && cartItem.quantity >= count)}
                                      className={`w-6 h-6 rounded flex items-center justify-center font-bold text-sm transition-all ${
                                        (!cartItem || cartItem.quantity < count)
                                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                          : 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed'
                                      }`}>+</button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                )}
              </div>
            </div>
{/* 购物车侧栏 */}
            <div className="w-64 md:w-72 bg-[#382b26] border-l border-[#9b7a4c]/30 flex flex-col rounded-r-lg overflow-hidden shrink-0">
              <div className="p-3 border-b border-[#9b7a4c]/30">
                <h3 className="text-[#f0e6d2] font-bold text-base tracking-wider flex items-center gap-2">
                  <i className="fa-solid fa-cart-shopping text-[#9b7a4c]" />
                  购物车
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {cartItemCount === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#8c7b70] opacity-60 gap-2">
                    <i className="fa-solid fa-shopping-basket text-4xl" />
                    <span className="text-sm font-bold">购物车为空</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.values(cart).map(ci => {
                      const item = ITEMS_RES[ci.itemId];
                      if (!item) return null;
                      return (
                        <div key={ci.itemId} className="bg-[#2c241b] border border-[#9b7a4c]/30 rounded-lg p-2.5">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[#f0e6d2] font-bold text-xs truncate flex-1">{item.name}</span>
                            <span className="text-[#9b7a4c] font-mono text-xs ml-2">x{ci.quantity}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-bold font-mono ${activeTab === 'buy' ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {activeTab === 'buy' ? '-' : '+'}{(ci.quantity * ci.price).toLocaleString()} G
                            </span>
                            <button
                              onClick={() => { const { [ci.itemId]: _, ...rest } = cart; setCart(rest); }}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <i className="fa-solid fa-trash text-xs" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-[#9b7a4c]/30 bg-[#2c241b]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[#8c7b70] font-bold text-sm">总计</span>
                  <span className={`text-xl font-black font-mono ${activeTab === 'buy' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {activeTab === 'buy' ? '-' : '+'}{cartTotal.toLocaleString()} G
                  </span>
                </div>

                {activeTab === 'buy' && (
                  <div className={`text-xs mb-2 font-bold ${currentGold < cartTotal ? 'text-red-400' : 'text-emerald-400'}`}>
                    {currentGold < cartTotal ? '资金不足！' : '资金充足'}
                  </div>
                )}

                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    disabled={cartItemCount === 0 || (activeTab === 'buy' && currentGold < cartTotal)}
                    className={`w-full py-2.5 rounded-lg font-bold tracking-wider transition-all border-2 flex items-center justify-center gap-2 text-sm ${
                      cartItemCount > 0 && (activeTab === 'sell' || currentGold >= cartTotal)
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
                    className={`w-full py-1.5 rounded-lg font-bold text-xs transition-all ${
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
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopItemModal;