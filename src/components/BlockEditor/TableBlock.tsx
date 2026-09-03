import React from 'react';
import { Plus, Trash2, Table as TableIcon } from 'lucide-react';
import { Block } from '../../types';

interface TableBlockProps {
  block: Block;
  onChange: (updated: Partial<Block>) => void;
  isArabic: boolean;
  onFocus?: () => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  onChange,
  isArabic,
  onFocus,
}) => {
  const tableData = block.tableData || {
    headers: [
      isArabic ? 'العمود الأول' : 'Column 1',
      isArabic ? 'العمود الثاني' : 'Column 2',
    ],
    rows: [
      [
        isArabic ? 'قيمة 1' : 'Value 1',
        isArabic ? 'قيمة 2' : 'Value 2',
      ],
    ],
  };

  const handleHeaderChange = (index: number, val: string) => {
    const newHeaders = [...tableData.headers];
    newHeaders[index] = val;
    onChange({
      tableData: {
        ...tableData,
        headers: newHeaders,
      },
    });
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const newRows = tableData.rows.map((row, i) =>
      i === rIdx ? row.map((cell, j) => (j === cIdx ? val : cell)) : row
    );
    onChange({
      tableData: {
        ...tableData,
        rows: newRows,
      },
    });
  };

  const addColumn = () => {
    const newHeaders = [
      ...tableData.headers,
      isArabic ? `عمود ${tableData.headers.length + 1}` : `Col ${tableData.headers.length + 1}`,
    ];
    const newRows = tableData.rows.map(row => [...row, '']);
    onChange({
      tableData: {
        headers: newHeaders,
        rows: newRows,
      },
    });
  };

  const removeColumn = (cIdx: number) => {
    if (tableData.headers.length <= 1) return;
    const newHeaders = tableData.headers.filter((_, i) => i !== cIdx);
    const newRows = tableData.rows.map(row => row.filter((_, i) => i !== cIdx));
    onChange({
      tableData: {
        headers: newHeaders,
        rows: newRows,
      },
    });
  };

  const addRow = () => {
    const newRow = new Array(tableData.headers.length).fill('');
    onChange({
      tableData: {
        ...tableData,
        rows: [...tableData.rows, newRow],
      },
    });
  };

  const removeRow = (rIdx: number) => {
    if (tableData.rows.length <= 1) return;
    const newRows = tableData.rows.filter((_, i) => i !== rIdx);
    onChange({
      tableData: {
        ...tableData,
        rows: newRows,
      },
    });
  };

  return (
    <div
      className="my-3 p-3 bg-white rounded-lg border border-[#E2E7ED] hover:border-[#0D5C75]/40 transition-colors overflow-x-auto group"
      onClick={onFocus}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E7ED]/50 text-xs text-[#5C6B7A]">
        <div className="flex items-center gap-1.5 font-medium">
          <TableIcon className="w-3.5 h-3.5 text-[#0D5C75]" />
          <span>{isArabic ? 'جدول مقارنة وبيانات' : 'Data & Comparison Table'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addColumn}
            className="px-2 py-0.5 rounded bg-[#F4F6F8] hover:bg-[#E2E7ED] text-[#13171C] text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 text-[#0D5C75]" />
            <span>{isArabic ? 'إضافة عمود' : 'Add Column'}</span>
          </button>
          <button
            type="button"
            onClick={addRow}
            className="px-2 py-0.5 rounded bg-[#F4F6F8] hover:bg-[#E2E7ED] text-[#13171C] text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3 text-[#0D5C75]" />
            <span>{isArabic ? 'إضافة صف' : 'Add Row'}</span>
          </button>
        </div>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-[#F4F6F8] border-b border-[#E2E7ED]">
            {tableData.headers.map((header, cIdx) => (
              <th key={cIdx} className="p-2 text-start font-semibold text-[#13171C] relative group/col">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={header}
                    onChange={e => handleHeaderChange(cIdx, e.target.value)}
                    className="w-full bg-transparent font-semibold text-[#13171C] focus:outline-none focus:bg-white rounded px-1"
                  />
                  {tableData.headers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColumn(cIdx)}
                      className="opacity-0 group-hover/col:opacity-100 p-0.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                      title={isArabic ? 'حذف العمود' : 'Delete Column'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </th>
            ))}
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E7ED]">
          {tableData.rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-[#F4F6F8]/50 group/row">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="p-1.5">
                  <input
                    type="text"
                    value={cell}
                    onChange={e => handleCellChange(rIdx, cIdx, e.target.value)}
                    className="w-full bg-transparent text-[#13171C] focus:outline-none focus:bg-white border border-transparent focus:border-[#0D5C75] rounded px-1.5 py-1"
                  />
                </td>
              ))}
              <td className="p-1.5 text-center">
                {tableData.rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(rIdx)}
                    className="opacity-0 group-hover/row:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                    title={isArabic ? 'حذف الصف' : 'Delete Row'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
