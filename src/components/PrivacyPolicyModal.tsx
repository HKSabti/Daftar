import React, { useState } from 'react';
import {
  Shield,
  Lock,
  FileText,
  Globe,
  CheckCircle2,
  ExternalLink,
  X,
  Building,
  Mail,
  Scale
} from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  isArabic,
}) => {
  const [langTab, setLangTab] = useState<'ar' | 'en'>('ar');

  if (!isOpen) return null;

  return (
    <div
      id="privacy-policy-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      dir={langTab === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="bg-[#FFFFFF] text-[#13171C] border border-[#E2E7ED] rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E7ED] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0D5C75]/10 text-[#0D5C75]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#13171C]">
                {langTab === 'ar' ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy Policy & Data Security'}
              </h2>
              <p className="text-xs text-[#5C6B7A]">
                دفتر (Dftr) • RootKw • المطور: حسن السبتي (Hassan Al-Sabti)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switch */}
            <div className="flex items-center bg-[#E2E7ED]/50 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setLangTab('ar')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  langTab === 'ar' ? 'bg-white text-[#0D5C75] shadow-xs' : 'text-[#5C6B7A]'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setLangTab('en')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  langTab === 'en' ? 'bg-white text-[#0D5C75] shadow-xs' : 'text-[#5C6B7A]'
                }`}
              >
                English
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#5C6B7A] hover:text-[#13171C] hover:bg-[#E2E7ED]/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#334155] leading-relaxed">
          {langTab === 'ar' ? (
            <>
              {/* Kuwaiti & Arabic Plain Tone Box */}
              <div className="p-4 rounded-xl bg-[#0D5C75]/5 border border-[#0D5C75]/20 text-[#0D5C75]">
                <h3 className="font-bold text-base mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>مبدأنا الأساسي: بياناتك بيدك وجهازك هو الأصل!</span>
                </h3>
                <p className="text-xs leading-relaxed text-[#13171C]">
                  بتطبيق <strong>«دفتر»</strong>، كل وثائقك ومذكراتك وتسجيلاتك الصوتية تتخزن محلياً على جهازك. إحنا ما نقرأ بياناتك ولا نبيعها لأي طرف، والسحابة (سواءً Google Drive أو iCloud) مجرد نسخة احتياطية إنت اللي تتحكم فيها بالكامل.
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <h4 className="font-bold text-[#13171C] text-base mb-2">١. جمع البيانات وتخزينها</h4>
                <p className="mb-2">
                  يقوم تطبيق دفتر بتخزين النصوص، المخطوطات، الملفات الصوتية، والوسوم في المجلد المحلي لجهاز المستخدم (Local Vault). لا يتم رفع أي ملف إلى السحابة إلا عند قيام المستخدم بتسجيل الدخول واختيار المزامنة السحابية الصريحة.
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h4 className="font-bold text-[#13171C] text-base mb-2">٢. التكامل مع Google Drive و Apple iCloud</h4>
                <p className="mb-2">
                  - <strong>Google Drive:</strong> نستخدم بروتوكول OAuth 2.0 المعتمد مع تشفير PKCE مع طلب نطاق ضيق مخصص لملفات التطبيق فقط (<code>drive.file</code>). لا نستطيع الوصول إلى أي ملفات أخرى في حسابك.
                </p>
                <p>
                  - <strong>iCloud Drive:</strong> يعتمد التطبيق على المجلد المحلي لـ iCloud على نظامك مع معالجة الملفات المُفرغة (<code>.icloud</code>) وتحديثها محلياً دون أي خوادم وسيطة طرف ثالث.
                </p>
              </div>

              {/* Section 3 */}
              <div>
                <h4 className="font-bold text-[#13171C] text-base mb-2">٣. التشفير والنسخ الاحتياطي</h4>
                <p>
                  النسخ الاحتياطية المشفرة تستخدم خوارزمية <strong>AES-256-GCM</strong> المعتمدة قياسياً، وتكون المفاتيح مشتقة بكلمة المرور الخاصة بك دون حفظها في خوادمنا المركزية.
                </p>
              </div>

              {/* Section 4: Developer & Legal Contact */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E7ED] space-y-2 text-xs">
                <div className="font-bold text-[#13171C] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#0D5C75]" />
                  <span>معلومات المطور والجهة المالكة:</span>
                </div>
                <p><strong>المطور:</strong> حسن السبتي (Hassan Al-Sabti)</p>
                <p><strong>البريد الإلكتروني للدعم الفني والخصوصية:</strong> <a href="mailto:alien@rootkw.com" className="text-[#0D5C75] underline">alien@rootkw.com</a></p>
                <p><strong>الموقع الرسمي:</strong> <a href="https://dftr.rootkw.com" target="_blank" rel="noreferrer" className="text-[#0D5C75] underline">dftr.rootkw.com</a></p>
                <p className="text-[#5C6B7A] pt-2 border-t border-[#E2E7ED]">
                  © 2026 RootKw. جميع الحقوق محفوظة لشركة RootKw.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-[#0D5C75]/5 border border-[#0D5C75]/20 text-[#0D5C75]">
                <h3 className="font-bold text-base mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Core Philosophy: Local Stays the Truth, Cloud is a Copy</span>
                </h3>
                <p className="text-xs leading-relaxed text-[#13171C]">
                  In <strong>Daftar (Dftr)</strong>, your codex notes, manuscripts, and audio recordings remain strictly stored on your local disk. We do not inspect, monetize, or harvest your scholarship. Cloud providers (Google Drive, iCloud) are optional client-controlled mirrors.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#13171C] text-base mb-2">1. Data Storage & Ownership</h4>
                <p className="mb-2">
                  All Markdown files, audio captures, and marginalia indices reside locally within your designated filesystem vault. Zero telemetry is collected on your scholarly content.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#13171C] text-base mb-2">2. Cloud Integration (Google Drive & iCloud)</h4>
                <p className="mb-2">
                  - <strong>Google Drive:</strong> Authentication is handled strictly via OAuth 2.0 with PKCE directly inside your system browser, scoping only to the app folder (<code>drive.file</code>).
                </p>
                <p>
                  - <strong>Apple iCloud:</strong> Operates directly on the native macOS file tree with proactive placeholder (<code>.icloud</code>) detection.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#13171C] text-base mb-2">3. End-to-End Backup Encryption</h4>
                <p>
                  Local backups offer military-grade AES-256-GCM symmetric encryption using user-chosen passwords.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E7ED] space-y-2 text-xs">
                <div className="font-bold text-[#13171C] flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[#0D5C75]" />
                  <span>Developer & Legal Ownership:</span>
                </div>
                <p><strong>Developer:</strong> Hassan Al-Sabti</p>
                <p><strong>Support & Privacy Email:</strong> <a href="mailto:alien@rootkw.com" className="text-[#0D5C75] underline">alien@rootkw.com</a></p>
                <p><strong>Official Web Domain:</strong> <a href="https://dftr.rootkw.com" target="_blank" rel="noreferrer" className="text-[#0D5C75] underline">dftr.rootkw.com</a></p>
                <p className="text-[#5C6B7A] pt-2 border-t border-[#E2E7ED]">
                  © 2026 RootKw. All rights reserved.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E7ED] bg-[#F8FAFC]">
          <span className="text-xs text-[#5C6B7A]">
            {langTab === 'ar' ? 'آخر تحديث: أغسطس ٢٠٢٦' : 'Last updated: August 2026'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#0D5C75] hover:bg-[#0E6C8A] text-white text-xs font-bold shadow-xs transition-colors"
          >
            {langTab === 'ar' ? 'فهمت وموافق' : 'I Understand & Agree'}
          </button>
        </div>
      </div>
    </div>
  );
};
