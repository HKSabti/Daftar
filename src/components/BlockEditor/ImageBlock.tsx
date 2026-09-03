import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Block } from '../../types';

interface ImageBlockProps {
  block: Block;
  onChange: (updated: Partial<Block>) => void;
  isArabic: boolean;
  onFocus?: () => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  onChange,
  isArabic,
  onFocus,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(block.imageUrl || '');
  const [showUrlModal, setShowUrlModal] = useState(!block.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await fetch('/api/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            base64Data,
          }),
        });
        const data = await res.json();
        if (data.url) {
          onChange({
            imageUrl: data.url,
            imageCaption: file.name.replace(/\.[^/.]+$/, ''),
          });
          setShowUrlModal(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className="my-3 p-3 bg-white rounded-lg border border-[#E2E7ED] hover:border-[#0D5C75]/40 transition-colors group"
      onClick={onFocus}
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
    >
      {block.imageUrl ? (
        <div className="space-y-2">
          <div className="relative rounded overflow-hidden bg-[#F4F6F8] flex items-center justify-center max-h-96">
            <img
              src={block.imageUrl}
              alt={block.imageCaption || 'Vault Image'}
              className="max-h-96 w-auto object-contain rounded"
              referrerPolicy="no-referrer"
              onError={e => {
                // Fallback image error
                (e.currentTarget as HTMLElement).style.opacity = '0.5';
              }}
            />
            <button
              type="button"
              onClick={() => onChange({ imageUrl: '', imageCaption: '' })}
              className="absolute top-2 end-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors cursor-pointer"
              title={isArabic ? 'إزالة الصورة' : 'Remove image'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            value={block.imageCaption || ''}
            onChange={e => onChange({ imageCaption: e.target.value })}
            placeholder={isArabic ? 'وصف أو تعليق توثيقي على الصورة...' : 'Image caption or scholarly annotation...'}
            className="w-full text-center text-xs text-[#5C6B7A] bg-transparent focus:outline-none focus:bg-[#F4F6F8] rounded py-1"
          />
        </div>
      ) : (
        <div className="py-6 px-4 border-2 border-dashed border-[#E2E7ED] rounded-lg text-center bg-[#F4F6F8]/50 hover:bg-[#F4F6F8] transition-colors">
          <ImageIcon className="w-8 h-8 mx-auto text-[#5C6B7A] opacity-60 mb-2" />
          <p className="text-xs font-medium text-[#13171C] mb-1">
            {isArabic ? 'إدراج صورة أو وثيقة في المرفقات' : 'Insert image into vault attachments'}
          </p>
          <p className="text-[11px] text-[#5C6B7A] mb-3">
            {isArabic ? 'اسحب الصورة وأفلتها هنا، أو اختر ملفاً' : 'Drag & drop here or choose a file'}
          </p>

          <div className="flex items-center justify-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-[#0D5C75] text-white text-xs font-medium rounded hover:bg-[#083E50] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? (isArabic ? 'جارِ الرفع...' : 'Uploading...') : (isArabic ? 'رفع من الجهاز' : 'Upload file')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlModal(true)}
              className="px-3 py-1.5 bg-white border border-[#E2E7ED] text-[#13171C] text-xs font-medium rounded hover:bg-[#E2E7ED] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#5C6B7A]" />
              <span>{isArabic ? 'رابط خارجي' : 'Image URL'}</span>
            </button>
          </div>

          {showUrlModal && (
            <div className="mt-3 flex items-center gap-2 max-w-sm mx-auto">
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="flex-1 text-xs p-1.5 bg-white border border-[#E2E7ED] rounded focus:outline-none focus:border-[#0D5C75]"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => {
                  if (urlInput.trim()) {
                    onChange({ imageUrl: urlInput.trim() });
                    setShowUrlModal(false);
                  }
                }}
                className="px-2.5 py-1.5 bg-[#0D5C75] text-white text-xs rounded hover:bg-[#083E50] cursor-pointer"
              >
                {isArabic ? 'حفظ' : 'Save'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
