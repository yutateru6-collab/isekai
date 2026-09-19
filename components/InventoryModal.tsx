import React from 'react';
import { Item } from '../types';
import { X, Box } from 'lucide-react';
import { useDialog } from './useDialog';

interface InventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: Item[];
    onUseItem: (item: Item) => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({
    isOpen,
    onClose,
    inventory,
    onUseItem
}) => {
    const dialog = useDialog(isOpen);
    if (!isOpen) return null;

    return (
        <div ref={dialog} role="dialog" aria-modal="true" aria-label="バッグ" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in text-left">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 border-4 border-white relative font-maru">
                <button
                    aria-label="バッグを閉じる"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-black text-kids-text mb-4 flex items-center gap-2">
                    <Box className="w-6 h-6 text-pop-blue" />
                    バッグ
                </h2>

                {inventory.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-2xl">
                        <p>からっぽ</p>
                        <p className="text-xs mt-1">探索してアイテムを探そう</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {inventory.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex items-center gap-3">
                                <div className="text-3xl bg-white w-12 h-12 flex items-center justify-center rounded-lg shadow-sm">
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-gray-800">{item.name}</div>
                                    <div className="text-xs text-gray-500 line-clamp-1">{item.description}</div>
                                </div>
                                <button
                                    onClick={() => onUseItem(item)}
                                    className="bg-pop-blue text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm ml-2 shrink-0"
                                >
                                    わたす
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 px-4">
                        アイテムを相棒にあげると、シンクロ率が上がります。ログインボーナスや探索中に見つかることがあります。
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InventoryModal;
