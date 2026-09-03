import React, { useState } from 'react';
import { Plus, Trash2, MoreHorizontal, Calendar, User, Tag } from 'lucide-react';
import { KanbanData, KanbanColumn, KanbanCard } from '../../types';

interface KanbanBlockProps {
  data?: KanbanData;
  isArabic: boolean;
  onChange: (updated: KanbanData) => void;
}

export const KanbanBlock: React.FC<KanbanBlockProps> = ({
  data,
  isArabic,
  onChange,
}) => {
  const [newCardTitles, setNewCardTitles] = useState<Record<string, string>>({});
  const [addingToCol, setAddingToCol] = useState<string | null>(null);

  const kanban: KanbanData = data || {
    columns: [
      {
        id: 'c-todo',
        title: isArabic ? 'قيد الانتظار ⏳' : 'To Do ⏳',
        cards: [
          { id: '1', title: isArabic ? 'إعداد بنك أسئلة الاختبار الفصلي' : 'Prepare exam question bank', priority: 'high' },
          { id: '2', title: isArabic ? 'استيراد كشوفات الطلاب الجديدة' : 'Import new student rosters', priority: 'medium' },
        ],
      },
      {
        id: 'c-prog',
        title: isArabic ? 'جاري التنفيذ 🚀' : 'In Progress 🚀',
        cards: [
          { id: '3', title: isArabic ? 'رصد درجات المشاركة والأنشطة' : 'Record participation grades', priority: 'high' },
        ],
      },
      {
        id: 'c-done',
        title: isArabic ? 'مكتمل ✅' : 'Completed ✅',
        cards: [
          { id: '4', title: isArabic ? 'اعتماد خطة المنهج الأسبوعية' : 'Curriculum syllabus approval', priority: 'low' },
        ],
      },
    ],
  };

  const handleUpdate = (partial: Partial<KanbanData>) => {
    onChange({ ...kanban, ...partial });
  };

  const handleAddCard = (colId: string) => {
    const title = newCardTitles[colId];
    if (!title || !title.trim()) return;

    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      title: title.trim(),
      priority: 'medium',
    };

    const nextCols = kanban.columns.map(col => {
      if (col.id === colId) {
        return { ...col, cards: [...col.cards, newCard] };
      }
      return col;
    });

    handleUpdate({ columns: nextCols });
    setNewCardTitles(prev => ({ ...prev, [colId]: '' }));
    setAddingToCol(null);
  };

  const handleDeleteCard = (colId: string, cardId: string) => {
    const nextCols = kanban.columns.map(col => {
      if (col.id === colId) {
        return { ...col, cards: col.cards.filter(c => c.id !== cardId) };
      }
      return col;
    });
    handleUpdate({ columns: nextCols });
  };

  const handleMoveCard = (fromColId: string, toColId: string, card: KanbanCard) => {
    if (fromColId === toColId) return;

    const nextCols = kanban.columns.map(col => {
      if (col.id === fromColId) {
        return { ...col, cards: col.cards.filter(c => c.id !== card.id) };
      }
      if (col.id === toColId) {
        return { ...col, cards: [...col.cards, card] };
      }
      return col;
    });

    handleUpdate({ columns: nextCols });
  };

  return (
    <div className="my-4 rounded-xl border border-[#E9E9E8] bg-[#FAF9F7] p-4 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-xs text-[#37352F] flex items-center gap-2">
          <span>📌</span>
          <span>{isArabic ? 'لوحة إدارة المهام والمشاريع (Kanban)' : 'Kanban Task Board'}</span>
        </h4>
      </div>

      {/* Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-x-auto">
        {kanban.columns.map(column => (
          <div
            key={column.id}
            className="bg-[#F7F6F3] rounded-xl border border-[#E9E9E8] p-3 flex flex-col min-h-[220px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="font-semibold text-xs text-[#37352F]">{column.title}</span>
              <span className="text-[10px] font-mono font-bold text-[#787774] px-1.5 py-0.5 rounded-full bg-[#E9E9E8]">
                {column.cards.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-2 flex-1">
              {column.cards.map(card => (
                <div
                  key={card.id}
                  className="p-3 bg-white rounded-lg border border-[#E9E9E8] shadow-2xs hover:shadow-xs transition-shadow group relative text-xs text-[#37352F]"
                >
                  <p className="font-medium mb-1.5 leading-snug">{card.title}</p>

                  <div className="flex items-center justify-between text-[10px] text-[#787774]">
                    {card.priority && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md font-medium ${
                          card.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : card.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {card.priority === 'high'
                          ? isArabic ? 'أولوية عاجلة' : 'High'
                          : card.priority === 'medium'
                          ? isArabic ? 'متوسطة' : 'Medium'
                          : isArabic ? 'منخفضة' : 'Low'}
                      </span>
                    )}

                    {/* Move column quick buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {kanban.columns
                        .filter(c => c.id !== column.id)
                        .map(targetCol => (
                          <button
                            key={targetCol.id}
                            type="button"
                            onClick={() => handleMoveCard(column.id, targetCol.id, card)}
                            className="px-1.5 py-0.5 rounded-sm bg-[#F1F1EF] hover:bg-[#2383E2] hover:text-white transition-colors"
                            title={`Move to ${targetCol.title}`}
                          >
                            →
                          </button>
                        ))}
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(column.id, card.id)}
                        className="text-[#9B9A97] hover:text-rose-500 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Card Button */}
            {addingToCol === column.id ? (
              <div className="mt-2 space-y-1.5">
                <input
                  type="text"
                  autoFocus
                  value={newCardTitles[column.id] || ''}
                  onChange={e => setNewCardTitles(prev => ({ ...prev, [column.id]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddCard(column.id)}
                  placeholder={isArabic ? 'عنوان المهمة...' : 'Card title...'}
                  className="w-full p-2 bg-white border border-[#2383E2] rounded-lg text-xs outline-hidden"
                />
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setAddingToCol(null)}
                    className="px-2 py-1 text-[11px] text-[#787774] hover:bg-[#EFEFEF] rounded-md"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddCard(column.id)}
                    className="px-2.5 py-1 text-[11px] bg-[#2383E2] text-white rounded-md font-medium"
                  >
                    {isArabic ? 'إضافة' : 'Add'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAddingToCol(column.id)}
                className="mt-2 w-full py-1.5 px-2 rounded-lg text-[11px] font-medium text-[#787774] hover:text-[#37352F] hover:bg-[#EFEFEF] flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إضافة بطاقة' : 'Add a card'}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
