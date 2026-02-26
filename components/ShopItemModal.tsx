
import React, { useState, useMemo, useEffect } from 'react';
import { ShopItemModalProps, ShopTab, CartItem, ItemData } from '../types';
import { ITEMS_RES } from '../data/item-res';
import { ITEM_RES_SHOP, ShopItem } from '../data/item-res-shop';
import { RES_STAR_VALUE } from '../data/item-value-table';
import { ITEM_TAGS } from '../data/items';

const ShopItemModal: React.FC&lt;ShopItemModalProps&gt; = ({ 
  isOpen, 
  onClose, 
  initialTab = 'buy',
  inventory,
  currentGold,
  onTransaction 
}) =&gt; {
  const [activeTab, setActiveTab] = useState&lt;ShopTab&gt;(initialTab);
  const [cart, setCart] = useState&lt;Record&lt;string, CartItem&gt;&gt;({});

  useEffect(() =&gt; {
    if (isOpen) {
      setActiveTab(initialTab);
      setCart({});
    }
  }, [isOpen, initialTab]);

  const getTagIcon = (tagId?: string) =&gt; {
    if (!tagId) return null;
    const tag = ITEM_TAGS.find(t =&gt; t.id === tagId);
    return tag ? tag.icon : null;
  };

  const renderStarBadge = (item: ItemData) =&gt; {
    return (
      &lt;span className="text-xs px-2 py-0.5 text-yellow-400 font-bold bg-black/40 rounded border border-yellow-600/30 shadow-sm flex items-center gap-1"&gt;
        &lt;i className="fa-solid fa-star text-[10px]"&gt;&lt;/i&gt;
        {item.star || '?'}
      &lt;/span&gt;
    );
  };

  const calculateSellPrice = (item: ItemData) =&gt; {
    const baseValue = RES_STAR_VALUE[item.star || '1'] || 0;
    return Math.floor(baseValue / 2);
  };

  const addToCart = (itemId: string, price: number) =&gt; {
    setCart(prev =&gt; {
      const current = prev[itemId];
      const newQuantity = current ? current.quantity + 1 : 1;
      
      return {
        ...prev,
        [itemId]: { itemId, quantity: newQuantity, price }
      };
    });
  };

  const removeFromCart = (itemId: string) =&gt; {
    setCart(prev =&gt; {
      const current = prev[itemId];
      if (!current) return prev;
      
      const newQuantity = current.quantity - 1;
      if (newQuantity &lt;= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [itemId]: { ...current, quantity: newQuantity }
      };
    });
  };

  const clearCart = () =&gt; {
    setCart({});
  };

  const cartTotal = useMemo(() =&gt; {
    return Object.values(cart).reduce((sum, item) =&gt; sum + (item.quantity * item.price), 0);
  }, [cart]);

  const cartItemCount = useMemo(() =&gt; {
    return Object.values(cart).reduce((sum, item) =&gt; sum + item.quantity, 0);
  }, [cart]);

  const buyItems = useMemo(() =&gt; {
    return ITEM_RES_SHOP.map(shopItem =&gt; ({
      ...shopItem,
      item: ITEMS_RES[shopItem.resId]
    })).filter(shop =&gt; shop.item !== undefined);
  }, []);

  const sellItems = useMemo(() =&gt; {
    return Object.entries(inventory)
      .filter(([itemId, count]) =&gt; count &gt; 0 &amp;&amp; ITEMS_RES[itemId])
      .map(([itemId, count]) =&gt; ({
        itemId,
        item: ITEMS_RES[itemId],
        count,
        price: calculateSellPrice(ITEMS_RES[itemId])
      }));
  }, [inventory]);

  const handleCheckout = () =&gt; {
    if (cartItemCount === 0) return;

    const inventoryChanges: Record&lt;string, number&gt; = {};
    let goldChange = 0;

    if (activeTab === 'buy') {
      if (currentGold &lt; cartTotal) return;
      
      goldChange = -cartTotal;
      Object.values(cart).forEach(cartItem =&gt; {
        inventoryChanges[cartItem.itemId] = (inventory[cartItem.itemId] || 0) + cartItem.quantity;
      });
    } else {
      goldChange = cartTotal;
      Object.values(cart).forEach(cartItem =&gt; {
        const newCount = (inventory[cartItem.itemId] || 0) - cartItem.quantity;
        if (newCount &gt; 0) {
          inventoryChanges[cartItem.itemId] = newCount;
        } else {
          inventoryChanges[cartItem.itemId] = 0;
        }
      });
    }

    if (onTransaction) {
      onTransaction({ goldChange, inventoryChanges });
    }
    
    setCart({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    &lt;div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"&gt;
      &lt;div className="w-full max-w-6xl h-[90vh] flex bg-[#e8dfd1] rounded-r-xl rounded-l-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden transition-all duration-300"&gt;
        
        &lt;div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 bg-gradient-to-r from-[#2c241b] via-[#3d3226] to-[#2c241b] z-20 shadow-xl border-r border-[#1a1512]"&gt;
          &lt;div className="h-full w-full opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiMwMDAiLz4KPC9zdmc+')]"&gt;&lt;/div&gt;
        &lt;/div&gt;

        &lt;div className="absolute inset-0 border-[8px] md:border-[8px] border-[#382b26] rounded-r-xl pointer-events-none z-10 border-l-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]"&gt;&lt;/div&gt;

        &lt;button 
          onClick={onClose}
          className="absolute top-1.5 right-3 md:top-2 md:right-3 z-30 w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-[#5c4d45] hover:text-[#b45309] transition-colors rounded-full hover:bg-[#d6cbb8]/50"
          title="关闭"
        &gt;
          &lt;i className="fa-solid fa-xmark text-base md:text-lg"&gt;&lt;/i&gt;
        &lt;/button&gt;

        &lt;div className="flex-1 flex flex-col pl-6 md:pl-8 pr-3 md:pr-4 py-3 relative w-full"&gt;
          &lt;div className="absolute inset-0 pointer-events-none opacity-10" 
              style={{ 
                  backgroundImage: `linear-gradient(#9b7a4c 1px, transparent 1px)`,
                  backgroundSize: '100% 2.5rem',
                  marginTop: '3rem'
              }}&gt;
          &lt;/div&gt;

          &lt;div className="flex items-center justify-between pb-1 border-b border-[#9b7a4c]/30 mb-1.5 relative z-10 shrink-0"&gt;
            &lt;div className="text-center flex-1"&gt;
              &lt;h2 className="text-lg md:text-xl font-bold text-[#382b26] tracking-[0.2em] flex items-center justify-center gap-2"&gt;
                &lt;i className="fa-solid fa-store text-[#9b7a4c]"&gt;&lt;/i&gt;
                道具商店
              &lt;/h2&gt;
            &lt;/div&gt;
            &lt;div className="flex items-center gap-2 bg-[#f5f0e6] px-3 py-1.5 rounded-lg border border-[#d6cbb8]"&gt;
              &lt;i className="fa-solid fa-coins text-amber-400"&gt;&lt;/i&gt;
              &lt;span className="text-[#382b26] font-bold font-mono text-sm"&gt;{currentGold.toLocaleString()}&lt;/span&gt;
              &lt;span className="text-[#9b7a4c] text-xs font-bold"&gt;G&lt;/span&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          &lt;div className="flex justify-center gap-6 md:gap-8 mb-2 relative z-10 text-xs md:text-sm font-bold text-[#5c4d45] shrink-0"&gt;
            &lt;button
              onClick={() =&gt; { setActiveTab('buy'); setCart({}); }}
              className={`pb-0.5 border-b-2 transition-all px-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'buy'
                  ? 'border-[#b45309] text-[#b45309] scale-105'
                  : 'border-transparent hover:text-[#8c7b70]'
              }`}
            &gt;
              &lt;i className="fa-solid fa-bag-shopping"&gt;&lt;/i&gt;
              道具购入
            &lt;/button&gt;
            &lt;button
              onClick={() =&gt; { setActiveTab('sell'); setCart({}); }}
              className={`pb-0.5 border-b-2 transition-all px-2 flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'sell'
                  ? 'border-[#b45309] text-[#b45309] scale-105'
                  : 'border-transparent hover:text-[#8c7b70]'
              }`}
            &gt;
              &lt;i className="fa-solid fa-coins"&gt;&lt;/i&gt;
              素材出售
            &lt;/button&gt;
          &lt;/div&gt;

          &lt;div className="flex-1 flex overflow-hidden relative z-10"&gt;
            &lt;div className="flex-1 relative overflow-hidden flex flex-col"&gt;
              &lt;div className="absolute inset-0 opacity-5 pointer-events-none" 
                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23382b26' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}&gt;
              &lt;/div&gt;

              &lt;div className="flex-1 overflow-y-auto pr-1 custom-scrollbar"&gt;
                {activeTab === 'buy' &amp;&amp; (
                  &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 py-1"&gt;
                    {buyItems.map(({ shopItem, item }) =&gt; {
                      const cartItem = cart[shopItem.resId];
                      return (
                        &lt;div 
                          key={shopItem.id} 
                          className="bg-[#f5f0e6] border border-[#d6cbb8] p-3 md:p-4 rounded-lg shadow-sm hover:shadow-lg hover:border-[#9b7a4c] transition-all group"
                        &gt;
                          &lt;div className="flex gap-3"&gt;
                            &lt;div className="w-14 h-14 md:w-16 md:h-16 bg-[#e0d6c5] border border-[#c7bca8] rounded flex items-center justify-center text-2xl md:text-3xl shadow-inner flex-shrink-0"&gt;
                              {getTagIcon(item.tag) || '📦'}
                            &lt;/div&gt;
                            &lt;div className="flex-1 min-w-0"&gt;
                              &lt;div className="flex justify-between items-start mb-1"&gt;
                                &lt;h4 className="font-bold text-[#2c241b] truncate pr-2 text-sm group-hover:text-[#9b7a4c] transition-colors"&gt;{item.name}&lt;/h4&gt;
                                {renderStarBadge(item)}
                              &lt;/div&gt;
                              &lt;p className="text-[10px] text-[#6e5d52] line-clamp-2 leading-tight mb-2"&gt;
                                {item.description}
                              &lt;/p&gt;
                              &lt;div className="flex justify-between items-center"&gt;
                                &lt;span className="font-bold text-[#b45309] font-mono text-sm"&gt;
                                  {shopItem.price} G
                                &lt;/span&gt;
                                &lt;div className="flex items-center gap-1"&gt;
                                  &lt;button
                                    onClick={() =&gt; removeFromCart(shopItem.resId)}
                                    disabled={!cartItem}
                                    className={`w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center font-bold transition-all text-sm ${
                                      cartItem
                                        ? 'bg-[#382b26] text-[#f0e6d2] hover:bg-[#2c241b]'
                                        : 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed'
                                    }`}
                                  &gt;
                                    -
                                  &lt;/button&gt;
                                  &lt;span className="w-6 md:w-8 text-center font-bold text-[#382b26] text-sm"&gt;
                                    {cartItem?.quantity || 0}
                                  &lt;/span&gt;
                                  &lt;button
                                    onClick={() =&gt; addToCart(shopItem.resId, shopItem.price)}
                                    className="w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center font-bold transition-all bg-[#9b7a4c] text-[#1a1512] hover:bg-[#b45309] text-sm"
                                  &gt;
                                    +
                                  &lt;/button&gt;
                                &lt;/div&gt;
                              &lt;/div&gt;
                            &lt;/div&gt;
                          &lt;/div&gt;
                        &lt;/div&gt;
                      );
                    })}
                  &lt;/div&gt;
                )}

                {activeTab === 'sell' &amp;&amp; (
                  &lt;div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 py-1"&gt;
                    {sellItems.length === 0 ? (
                      &lt;div className="col-span-full h-full flex flex-col items-center justify-center text-[#5c4d45] opacity-60 gap-4 py-12"&gt;
                        &lt;i className="fa-solid fa-box-open text-5xl md:text-6xl"&gt;&lt;/i&gt;
                        &lt;span className="text-lg md:text-xl font-bold tracking-widest"&gt;暂无素材可出售&lt;/span&gt;
                      &lt;/div&gt;
                    ) : (
                      sellItems.map(({ itemId, item, count, price }) =&gt; {
                        const cartItem = cart[itemId];
                        const maxSell = count;
                        return (
                          &lt;div 
                            key={itemId} 
                            className="bg-[#f5f0e6] border border-[#d6cbb8] p-3 md:p-4 rounded-lg shadow-sm hover:shadow-lg hover:border-[#9b7a4c] transition-all group"
                          &gt;
                            &lt;div className="flex gap-3"&gt;
                              &lt;div className="w-14 h-14 md:w-16 md:h-16 bg-[#e0d6c5] border border-[#c7bca8] rounded flex items-center justify-center text-2xl md:text-3xl shadow-inner flex-shrink-0"&gt;
                                {getTagIcon(item.tag) || '📦'}
                              &lt;/div&gt;
                              &lt;div className="flex-1 min-w-0"&gt;
                                &lt;div className="flex justify-between items-start mb-1"&gt;
                                  &lt;h4 className="font-bold text-[#2c241b] truncate pr-2 text-sm group-hover:text-[#9b7a4c] transition-colors"&gt;{item.name}&lt;/h4&gt;
                                  {renderStarBadge(item)}
                                &lt;/div&gt;
                                &lt;p className="text-[10px] text-[#6e5d52] line-clamp-2 leading-tight mb-2"&gt;
                                  {item.description}
                                &lt;/p&gt;
                                &lt;div className="flex justify-between items-center"&gt;
                                  &lt;div className="flex flex-col"&gt;
                                    &lt;span className="font-bold text-emerald-600 font-mono text-sm"&gt;
                                      +{price} G
                                    &lt;/span&gt;
                                    &lt;span className="text-[10px] text-[#8c7b70]"&gt;
                                      持有: {count}
                                    &lt;/span&gt;
                                  &lt;/div&gt;
                                  &lt;div className="flex items-center gap-1"&gt;
                                    &lt;button
                                      onClick={() =&gt; removeFromCart(itemId)}
                                      disabled={!cartItem}
                                      className={`w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center font-bold transition-all text-sm ${
                                        cartItem
                                          ? 'bg-[#382b26] text-[#f0e6d2] hover:bg-[#2c241b]'
                                          : 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed'
                                      }`}
                                    &gt;
                                      -
                                    &lt;/button&gt;
                                    &lt;span className="w-6 md:w-8 text-center font-bold text-[#382b26] text-sm"&gt;
                                      {cartItem?.quantity || 0}
                                    &lt;/span&gt;
                                    &lt;button
                                      onClick={() =&gt; addToCart(itemId, price, maxSell)}
                                      disabled={cartItem &amp;&amp; cartItem.quantity &gt;= maxSell}
                                      className={`w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center font-bold transition-all text-sm ${
                                        (!cartItem || cartItem.quantity &lt; maxSell)
                                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                          : 'bg-[#d6cbb8] text-[#8c7b70] cursor-not-allowed'
                                      }`}
                                    &gt;
                                      +
                                    &lt;/button&gt;
                                  &lt;/div&gt;
                                &lt;/div&gt;
                              &lt;/div&gt;
                            &lt;/div&gt;
                          &lt;/div&gt;
                        );
                      })
                    )}
                  &lt;/div&gt;
                )}
              &lt;/div&gt;
            &lt;/div&gt;

            &lt;div className="w-full md:w-72 bg-[#382b26] border-l border-[#9b7a4c]/30 flex flex-col rounded-r-lg overflow-hidden"&gt;
              &lt;div className="p-3 md:p-4 border-b border-[#9b7a4c]/30"&gt;
                &lt;h3 className="text-[#f0e6d2] font-bold text-base md:text-lg tracking-wider flex items-center gap-2"&gt;
                  &lt;i className="fa-solid fa-cart-shopping text-[#9b7a4c]"&gt;&lt;/i&gt;
                  购物车
                &lt;/h3&gt;
              &lt;/div&gt;

              &lt;div className="flex-1 overflow-y-auto p-2 md:p-3 custom-scrollbar"&gt;
                {cartItemCount === 0 ? (
                  &lt;div className="h-full flex flex-col items-center justify-center text-[#8c7b70] opacity-60 gap-2"&gt;
                    &lt;i className="fa-solid fa-shopping-basket text-3xl md:text-4xl"&gt;&lt;/i&gt;
                    &lt;span className="text-xs md:text-sm font-bold"&gt;购物车为空&lt;/span&gt;
                  &lt;/div&gt;
                ) : (
                  &lt;div className="space-y-2"&gt;
                    {Object.values(cart).map(cartItem =&gt; {
                      const item = ITEMS_RES[cartItem.itemId];
                      if (!item) return null;
                      return (
                        &lt;div key={cartItem.itemId} className="bg-[#2c241b] border border-[#9b7a4c]/30 rounded-lg p-2.5 md:p-3"&gt;
                          &lt;div className="flex justify-between items-start mb-1"&gt;
                            &lt;span className="text-[#f0e6d2] font-bold text-xs md:text-sm truncate flex-1"&gt;{item.name}&lt;/span&gt;
                            &lt;span className="text-[#9b7a4c] font-mono text-xs ml-2"&gt;x{cartItem.quantity}&lt;/span&gt;
                          &lt;/div&gt;
                          &lt;div className="flex justify-between items-center"&gt;
                            &lt;span className={`text-xs font-bold font-mono ${activeTab === 'buy' ? 'text-amber-400' : 'text-emerald-400'}`}&gt;
                              {activeTab === 'buy' ? '-' : '+'}{(cartItem.quantity * cartItem.price).toLocaleString()} G
                            &lt;/span&gt;
                            &lt;button
                              onClick={() =&gt; {
                                const { [cartItem.itemId]: _, ...rest } = cart;
                                setCart(rest);
                              }}
                              className="text-red-400 hover:text-red-300 transition-colors text-xs"
                            &gt;
                              &lt;i className="fa-solid fa-trash"&gt;&lt;/i&gt;
                            &lt;/button&gt;
                          &lt;/div&gt;
                        &lt;/div&gt;
                      );
                    })}
                  &lt;/div&gt;
                )}
              &lt;/div&gt;

              &lt;div className="p-3 md:p-4 border-t border-[#9b7a4c]/30 bg-[#2c241b]"&gt;
                &lt;div className="flex justify-between items-center mb-2 md:mb-3"&gt;
                  &lt;span className="text-[#8c7b70] font-bold text-xs md:text-sm"&gt;总计&lt;/span&gt;
                  &lt;span className={`text-lg md:text-xl font-black font-mono ${activeTab === 'buy' ? 'text-amber-400' : 'text-emerald-400'}`}&gt;
                    {activeTab === 'buy' ? '-' : '+'}{cartTotal.toLocaleString()} G
                  &lt;/span&gt;
                &lt;/div&gt;

                {activeTab === 'buy' &amp;&amp; (
                  &lt;div className={`text-xs md:text-sm mb-2 md:mb-3 ${currentGold &lt; cartTotal ? 'text-red-400' : 'text-emerald-400'} font-bold`}&gt;
                    {currentGold &lt; cartTotal ? '资金不足！' : '资金充足'}
                  &lt;/div&gt;
                )}

                &lt;div className="space-y-2"&gt;
                  &lt;button
                    onClick={handleCheckout}
                    disabled={cartItemCount === 0 || (activeTab === 'buy' &amp;&amp; currentGold &lt; cartTotal)}
                    className={`w-full py-2.5 md:py-3 rounded-lg font-bold tracking-wider transition-all border-2 flex items-center justify-center gap-2 text-xs md:text-sm ${
                      cartItemCount &gt; 0 &amp;&amp; (activeTab === 'sell' || currentGold &gt;= cartTotal)
                        ? 'bg-[#9b7a4c] text-[#1a1512] border-[#f0e6d2]/50 hover:bg-[#b45309] shadow-lg'
                        : 'bg-[#4a3b32] text-[#8c7b70] border-transparent cursor-not-allowed'
                    }`}
                  &gt;
                    &lt;i className="fa-solid fa-check"&gt;&lt;/i&gt;
                    确认结算
                  &lt;/button&gt;

                  &lt;button
                    onClick={clearCart}
                    disabled={cartItemCount === 0}
                    className={`w-full py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${
                      cartItemCount &gt; 0
                        ? 'bg-[#382b26] text-[#9b7a4c] hover:bg-[#4a3b32] hover:text-[#c4a473]'
                        : 'bg-transparent text-[#5c4d45] cursor-not-allowed'
                    }`}
                  &gt;
                    &lt;i className="fa-solid fa-rotate-right mr-1"&gt;&lt;/i&gt;
                    清空购物车
                  &lt;/button&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default ShopItemModal;

