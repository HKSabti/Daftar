import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Plus,
  Check,
  BookOpen,
  Layers,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import { VaultInfo } from '../types';

interface VaultSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVault: (vaultId: string) => Promise<void>;
  isArabic: boolean;
  isFirstRun?: boolean;
}

export const VaultSelectorModal: React.FC<VaultSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectVault,
  isArabic,
  isFirstRun = false,
}) => {
  const [vaults, setVaults] = useState<VaultInfo[]>([]);
  const [activeVaultId, setActiveVaultId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultDesc, setNewVaultDesc] = useState('');

  const fetchVaults = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vaults');
      const data = await res.json();
      setVaults(data.vaults || []);
      setActiveVaultId(data.activeVaultId || '');
    } catch (err) {
      console.error('Error fetching vaults:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVaults();
    }
  }, [isOpen]);

  const handleCreateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaultName.trim()) return;

    try {
      const res = await fetch('/api/vaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVaultName.trim(),
          description: newVaultDesc.trim(),
        }),
      });
      const data = await res.json();
      if (data.vault) {
        setNewVaultName('');
        setNewVaultDesc('');
        setIsCreating(false);
        await onSelectVault(data.vault.id);
        onClose();
      }
    } catch (err) {
      console.error('Error creating vault:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E2E7ED] overflow-hidden flex flex-col"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E2E7ED] bg-[#F4F6F8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0D5C75] text-white flex items-center justify-center shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-scholarly font-bold text-lg text-[#13171C]">
                {isArabic ? 'خزائن الدفتر والمخطوطات' : 'Daftar Vaults'}
              </h2>
              <p className="text-xs text-[#5C6B7A]">
                {isArabic
                  ? 'اختر خزانة دراسية أو أنشئ خزانة جديدة لمشاريعك'
                  : 'Choose a scholarly vault or initialize a new study space'}
              </p>
            </div>
          </div>

          {!isFirstRun && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#5C6B7A] hover:text-[#13171C] rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Vault List or Creation Form */}
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {isCreating ? (
            <form onSubmit={handleCreateVault} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#13171C] mb-1">
                  {isArabic ? 'اسم الخزانة الجديدة' : 'Vault Name'}
                </label>
                <input
                  type="text"
                  value={newVaultName}
                  onChange={e => setNewVaultName(e.target.value)}
                  placeholder={
                    isArabic
                      ? 'مثال: خزانة الفلسفة والمنطق، تحقيق ديوان الحماسة'
                      : 'e.g. History of Optics, Codex Studies'
                  }
                  className="w-full text-sm p-2.5 bg-[#F4F6F8] border border-[#E2E7ED] rounded-lg focus:outline-none focus:border-[#0D5C75] text-[#13171C]"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#13171C] mb-1">
                  {isArabic ? 'الوصف (اختياري)' : 'Description (Optional)'}
                </label>
                <textarea
                  value={newVaultDesc}
                  onChange={e => setNewVaultDesc(e.target.value)}
                  placeholder={
                    isArabic
                      ? 'وصف مقتضب لمجال هذه الخزانة وأهداف التحقيق...'
                      : 'Brief description of this study project...'
                  }
                  className="w-full text-xs p-2.5 bg-[#F4F6F8] border border-[#E2E7ED] rounded-lg focus:outline-none focus:border-[#0D5C75] text-[#13171C] resize-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-2 text-xs font-medium text-[#5C6B7A] hover:bg-[#F4F6F8] rounded-lg cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0D5C75] text-white text-xs font-medium rounded-lg hover:bg-[#083E50] transition-colors cursor-pointer"
                >
                  {isArabic ? 'إنشاء وفتح الخزانة' : 'Create & Open Vault'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-[#5C6B7A]">
                  {isArabic ? 'جارِ فحص الخزائن المتاحة...' : 'Loading vaults...'}
                </div>
              ) : (
                vaults.map(v => {
                  const isActive = v.id === activeVaultId;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={async () => {
                        await onSelectVault(v.id);
                        onClose();
                      }}
                      className={`w-full text-start p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                        isActive
                          ? 'bg-[#0D5C75]/10 border-[#0D5C75] shadow-xs'
                          : 'bg-white border-[#E2E7ED] hover:border-[#0D5C75]/40 hover:bg-[#F4F6F8]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            isActive ? 'bg-[#0D5C75] text-white' : 'bg-[#F4F6F8] text-[#5C6B7A]'
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-scholarly font-bold text-sm text-[#13171C]">
                              {v.name}
                            </h3>
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#0D5C75] text-white">
                                {isArabic ? 'الخزانة النشطة' : 'Active'}
                              </span>
                            )}
                          </div>
                          {v.description && (
                            <p className="text-xs text-[#5C6B7A] mt-0.5 line-clamp-1">
                              {v.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-[#5C6B7A] mt-1 font-mono">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {v.noteCount} {isArabic ? 'وثائق' : 'notes'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isActive ? (
                        <Check className="w-5 h-5 text-[#0D5C75]" />
                      ) : (
                        <span className="text-xs text-[#5C6B7A] group-hover:text-[#0D5C75] opacity-0 group-hover:opacity-100 transition-opacity">
                          {isArabic ? 'فتح' : 'Open'}
                        </span>
                      )}
                    </button>
                  );
                })
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full p-3 rounded-lg border border-dashed border-[#E2E7ED] hover:border-[#0D5C75] hover:bg-[#0D5C75]/5 text-[#0D5C75] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isArabic ? 'إنشاء خزانة جديدة' : 'Create New Vault'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
