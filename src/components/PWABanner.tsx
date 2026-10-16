import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';

export const PWABanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already running in standalone mode (fullscreen installed app) or user dismissed it
  if (isInstalled || isDismissed) {
    return null;
  }

  // Handle click on Install button
  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // Fallback for browsers without beforeinstallprompt or desktop
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Banner kecil di bawah header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white px-4 py-2.5 shadow-md border-b border-emerald-700/60 no-print animate-fade-in">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 truncate">
                <span>Gunakan sebagai Aplikasi</span>
                <span className="hidden sm:inline-block bg-amber-400/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full border border-amber-400/30">
                  Full Screen
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 truncate hidden xs:block">
                Pasang di layar utama HP untuk akses instan tanpa bar browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 text-xs font-bold transition shadow-sm transform active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              title="Tutup banner"
              className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-700/50 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Petunjuk Install Khusus iPhone (iOS Safari) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/75 backdrop-blur-xs no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  Pasang di Layar Utama iPhone
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-700/60 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Steps Body */}
            <div className="p-5 text-xs text-slate-700 space-y-3.5">
              <p className="leading-relaxed">
                Untuk menggunakan aplikasi ini secara <strong>Full Screen</strong> seperti aplikasi asli di iPhone atau iPad Anda:
              </p>

              <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    Ketuk tombol <strong>Bagikan (Share)</strong> pada bilah bawah browser Safari:
                    <div className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800 font-medium ml-1 mt-1 shadow-2xs">
                      <Share className="w-3.5 h-3.5 text-blue-600" />
                      <span>Share</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    Gulir ke bawah pada menu lalu pilih:
                    <div className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800 font-medium ml-1 mt-1 shadow-2xs">
                      <PlusSquare className="w-3.5 h-3.5 text-slate-700" />
                      <span>Tambah ke Layar Utama</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    Ketuk <strong>Tambah (Add)</strong> di sudut kanan atas. Selesai!
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800">
                Ikon <strong>Masjid Shalahuddin</strong> akan muncul di layar utama HP Anda dan dapat dibuka langsung dalam mode layar penuh (Full Screen).
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
