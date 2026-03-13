'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Sun, Moon, X, Palette } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* Settings Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-3 bg-accent text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all"
        aria-label="Open settings"
      >
        <Settings size={24} className="animate-spin-slow" style={{ animationDuration: '10s' }} />
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-card border-l border-border shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Palette size={20} className="text-accent" />
                    Customize Theme
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Close settings"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Appearance
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => isDark && toggleTheme()}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                          !isDark
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border hover:border-muted-foreground'
                        )}
                      >
                        <Sun size={18} />
                        Light
                      </button>
                      <button
                        onClick={() => !isDark && toggleTheme()}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
                          isDark
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border hover:border-muted-foreground'
                        )}
                      >
                        <Moon size={18} />
                        Dark
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Preferences are saved automatically
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
