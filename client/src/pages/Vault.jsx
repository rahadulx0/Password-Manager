import { useState } from 'react';
import {
  Search, Plus, Key, Star, Shield, Settings as SettingsIcon,
  Sun, Moon, LogOut, Menu, X, ChevronDown, Trash2, CheckSquare,
  ShoppingBag, Mail, Briefcase, Gamepad2, CreditCard, Globe, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePasswords } from '../hooks/usePasswords';
import PasswordCard from '../components/PasswordCard';
import PasswordModal from '../components/PasswordModal';
import PasswordGenerator from '../components/PasswordGenerator';
import Settings from '../components/Settings';
import ConfirmDialog from '../components/ConfirmDialog';

const CATEGORIES = [
  { value: 'all', label: 'All Items', icon: Key },
  { value: 'social', label: 'Social', icon: Globe },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'finance', label: 'Finance', icon: CreditCard },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { value: 'work', label: 'Work', icon: Briefcase },
  { value: 'entertainment', label: 'Entertainment', icon: Gamepad2 },
  { value: 'other', label: 'Other', icon: Lock },
];

const MOBILE_TABS = [
  { id: 'vault', label: 'Vault', icon: Key },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'generator', label: 'Generator', icon: Shield },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Vault() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const {
    allPasswords, passwords, loading, search, setSearch,
    category, setCategory, showFavorites, setShowFavorites,
    addPassword, updatePassword, deletePassword, deleteMultiple, toggleFavorite,
    refresh,
  } = usePasswords();

  const [modalEntry, setModalEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [mobileTab, setMobileTab] = useState('vault');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [desktopSettings, setDesktopSettings] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function exitSelectMode() {
    setSelectMode(false);
    setSelected(new Set());
  }

  function toggleSelect(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === displayPasswords.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(displayPasswords.map((p) => p.id)));
    }
  }

  function handleDeleteSelected() {
    if (selected.size === 0) return;
    setShowDeleteConfirm(true);
  }

  async function confirmDeleteSelected() {
    setDeleteLoading(true);
    try {
      const deleted = await deleteMultiple([...selected]);
      toast.success(`Deleted ${deleted} password${deleted === 1 ? '' : 's'}`);
      setShowDeleteConfirm(false);
      exitSelectMode();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }

  function openNew() {
    setModalEntry(null);
    setShowModal(true);
  }

  function openEdit(entry) {
    setModalEntry(entry);
    setShowModal(true);
  }

  async function handleSave(data, id) {
    if (id) {
      await updatePassword(id, data);
    } else {
      await addPassword(data);
    }
  }

  // Derived data — use allPasswords for counts so they're always correct
  const allFavorites = allPasswords.filter((p) => p.favorite);
  const displayPasswords = mobileTab === 'favorites' || showFavorites
    ? passwords.filter((p) => p.favorite)
    : passwords;

  const currentCategory = CATEGORIES.find((c) => c.value === category);

  // Whether to show settings in the main area (desktop via sidebar button, or mobile tab)
  const showSettingsView = desktopSettings || mobileTab === 'settings';
  // Whether to show the vault/list content
  const showVaultContent = !showSettingsView && (mobileTab === 'vault' || mobileTab === 'favorites' || typeof window !== 'undefined' && window.innerWidth >= 1024);

  return (
    <div className="h-full flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] backdrop-blur-xl shrink-0">
        {/* User section */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user?.username}</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Categories</p>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.value && !showFavorites && !desktopSettings;
            const count = cat.value === 'all'
              ? allPasswords.length
              : allPasswords.filter((p) => p.category === cat.value).length;
            return (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setShowFavorites(false);
                  setDesktopSettings(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span className="flex-1 text-left">{cat.label}</span>
                <span className={`text-xs ${isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`}>{count}</span>
              </button>
            );
          })}

          <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />

          <button
            onClick={() => {
              setShowFavorites(true);
              setCategory('all');
              setDesktopSettings(false);
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${showFavorites && !desktopSettings
                ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
          >
            <Star className={`w-4.5 h-4.5 ${showFavorites && !desktopSettings ? 'fill-yellow-500' : ''}`} />
            <span className="flex-1 text-left">Favorites</span>
            <span className={`text-xs ${showFavorites && !desktopSettings ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'}`}>{allFavorites.length}</span>
          </button>
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-gray-200 dark:border-white/10 space-y-1">
          <button
            onClick={() => setDesktopSettings(true)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${desktopSettings
                ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
          >
            <SettingsIcon className="w-4.5 h-4.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
          >
            {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 min-w-0">
        {/* Top bar — hide search/add when showing settings */}
        <header className="shrink-0 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>

            {selectMode ? (
              <>
                <button
                  onClick={exitSelectMode}
                  className="p-2 -ml-1 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {selected.size} selected
                </span>
                <button
                  onClick={toggleSelectAll}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400 transition-colors"
                  title={selected.size === displayPasswords.length ? 'Deselect all' : 'Select all'}
                >
                  <CheckSquare className={`w-5 h-5 ${selected.size === displayPasswords.length ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selected.size === 0 || deleteLoading}
                  className="p-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {deleteLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </>
            ) : !showSettingsView ? (
              <>
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search passwords..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                  />
                </div>

                {/* Add button */}
                <button
                  onClick={openNew}
                  className="p-2.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 active:scale-95 transition-all shadow-lg shadow-primary-600/20"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white lg:hidden">Settings</h2>
              </div>
            )}
          </div>

          {/* Mobile category filter — only when showing vault */}
          {!showSettingsView && (
            <div className="lg:hidden px-4 pb-3 relative">
              <button
                onClick={() => setShowCatDropdown(!showCatDropdown)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {(() => { const Icon = currentCategory?.icon || Key; return <Icon className="w-4 h-4" />; })()}
                <span>{currentCategory?.label || 'All Items'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCatDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCatDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowCatDropdown(false)} />
                  <div className="absolute top-full left-4 mt-1 z-50 w-48 py-1 bg-white dark:bg-[#2c2c2e] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 animate-scale-in">
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.value}
                          onClick={() => {
                            setCategory(cat.value);
                            setShowFavorites(false);
                            setShowCatDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors
                            ${category === cat.value && !showFavorites
                              ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{cat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-y-auto pb-24 lg:pb-6 overscroll-contain">
          {showSettingsView ? (
            <Settings passwords={allPasswords} favoritePasswords={allFavorites} onRefresh={refresh} />
          ) : showVaultContent ? (
            <div className="p-4 space-y-2 max-w-2xl mx-auto w-full">
              {/* Section header */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {mobileTab === 'favorites' ? 'Favorites' : showFavorites ? 'Favorites' : currentCategory?.label || 'All Items'}
                </h2>
                <div className="flex items-center gap-2">
                  {!selectMode && displayPasswords.length > 0 && (
                    <button
                      onClick={() => setSelectMode(true)}
                      className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Select
                    </button>
                  )}
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {displayPasswords.length} {displayPasswords.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card p-4 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-white/10" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-white/10" />
                          <div className="h-3 w-48 rounded bg-gray-200 dark:bg-white/10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayPasswords.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 mb-4">
                    {mobileTab === 'favorites' || showFavorites ? (
                      <Star className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    ) : (
                      <Key className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {search ? 'No results found' : mobileTab === 'favorites' || showFavorites ? 'No favorites yet' : 'No passwords yet'}
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                    {search ? 'Try a different search term' : 'Tap the + button to add one'}
                  </p>
                  {!search && !(mobileTab === 'favorites' || showFavorites) && (
                    <button onClick={openNew} className="btn-primary text-sm">
                      <Plus className="w-4 h-4 inline mr-1" />
                      Add Password
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {displayPasswords.map((entry) => (
                    <PasswordCard
                      key={entry.id}
                      entry={entry}
                      onEdit={openEdit}
                      onToggleFavorite={toggleFavorite}
                      selectMode={selectMode}
                      isSelected={selected.has(entry.id)}
                      onToggleSelect={toggleSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : mobileTab === 'generator' ? (
            <div className="p-4 max-w-md mx-auto w-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Password Generator</h2>
              <div className="glass-card p-5">
                <PasswordGenerator />
              </div>
            </div>
          ) : null}
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1c1c1e]/80 backdrop-blur-xl border-t border-gray-200 dark:border-white/10 z-30 safe-area-inset-bottom">
          <div className="flex items-center justify-around px-2 py-1">
            {MOBILE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = mobileTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setMobileTab(tab.id);
                    setDesktopSettings(false);
                    if (tab.id === 'favorites') {
                      setShowFavorites(true);
                      setCategory('all');
                    } else if (tab.id === 'vault') {
                      setShowFavorites(false);
                    }
                  }}
                  className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors
                    ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  <Icon className={`w-5 h-5 ${isActive && tab.id === 'favorites' ? 'fill-primary-600 dark:fill-primary-400' : ''}`} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </main>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 animate-fade-in">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#1c1c1e] animate-slide-in-left shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">@{user?.username}</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3 space-y-0.5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">Categories</p>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.value && !showFavorites;
                const count = cat.value === 'all'
                  ? allPasswords.length
                  : allPasswords.filter((p) => p.category === cat.value).length;
                return (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setCategory(cat.value);
                      setShowFavorites(false);
                      setMobileTab('vault');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                      }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className="text-xs text-gray-400">{count}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Password Modal */}
      {showModal && (
        <PasswordModal
          entry={modalEntry}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={deletePassword}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Bulk delete confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Passwords"
          message={`${selected.size} password${selected.size === 1 ? '' : 's'} will be permanently deleted. This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          loading={deleteLoading}
          onConfirm={confirmDeleteSelected}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
