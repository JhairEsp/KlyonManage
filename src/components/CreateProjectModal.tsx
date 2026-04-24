import { X, Globe, Cpu, GraduationCap, Save } from 'lucide-react';
import { useState } from 'react';
import { Project, ProjectType, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id' | 'api_key' | 'health' | 'last_ping'>) => void;
}

const CreateProjectModal = ({ isOpen, onClose, onSave }: CreateProjectModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'web' as ProjectType,
    url: '',
    admin_url: '',
    next_payment: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      status: 'active',
      next_payment: formData.next_payment || 'N/A'
    });
    setFormData({ name: '', type: 'web', url: '', admin_url: '', next_payment: '' });
    onClose();
  };

  const types: { id: ProjectType; label: string; icon: any; color: string }[] = [
    { id: 'web', label: 'Página Web', icon: Globe, color: 'bg-blue-500' },
    { id: 'system_web', label: 'Sistema Web', icon: Cpu, color: 'bg-indigo-500' },
    { id: 'system_app', label: 'Aplicación Móvil', icon: Cpu, color: 'bg-purple-500' },
    { id: 'university', label: 'Universidad', icon: GraduationCap, color: 'bg-orange-500' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800">Nuevo Proyecto</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Nombre del Proyecto</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej. Mi SaaS Increíble"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-3">Tipo de Proyecto</label>
              <div className="grid grid-cols-2 gap-3">
                {types.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t.id })}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                      formData.type === t.id 
                        ? "border-blue-600 bg-blue-50 text-blue-700" 
                        : "border-slate-100 hover:border-slate-200 text-slate-600"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg text-white", t.color)}>
                      <t.icon size={18} />
                    </div>
                    <span className="text-xs font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">URL Pública</label>
                <input 
                  type="url" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">URL Admin</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  placeholder="/admin"
                  value={formData.admin_url}
                  onChange={e => setFormData({ ...formData, admin_url: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Próxima Fecha de Pago</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Ej. 15 de cada mes"
                value={formData.next_payment}
                onChange={e => setFormData({ ...formData, next_payment: e.target.value })}
              />
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Save size={20} />
              Crear Proyecto
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateProjectModal;
