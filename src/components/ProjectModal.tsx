import { X, Globe, Layout, Shield, Activity, Copy, Check } from 'lucide-react';
import { Project, cn } from '../lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onUpdate: (id: string, updates: any) => Promise<void>;
}

const ProjectModal = ({ project, onClose, onUpdate }: ProjectModalProps) => {
  const [copied, setCopied] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!project) return null;

  const handleToggleStatus = async () => {
    setLoadingAction('status');
    const newStatus = project.status === 'active' ? 'suspended' : 'active';
    await onUpdate(project.id, { status: newStatus });
    setLoadingAction(null);
  };

  const handleTogglePopup = async () => {
    setLoadingAction('popup');
    // En un sistema real, aquí podrías abrir otro modal para escribir el mensaje
    // Por ahora alternamos un mensaje por defecto
    const remoteConfig = {
      show_popup: true,
      message: "Atención: Tu suscripción está por vencer. Por favor contacta a soporte.",
      locked: false
    };
    await onUpdate(project.id, { remote_config: remoteConfig });
    setLoadingAction(null);
    alert('Mensaje de alerta activado');
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(project.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="relative h-32 bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90" />
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
              <X size={20} />
            </button>

            <div className="absolute -bottom-6 left-8">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 border-4 border-white">
                <div className={cn(
                  "w-full h-full rounded-lg flex items-center justify-center text-white",
                  project.type === 'web' ? 'bg-blue-500' : 'bg-indigo-500'
                )}>
                  {project.type === 'web' ? <Globe size={32} /> : <Shield size={32} />}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-10 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{project.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500">{project.type.replace('_', ' ')}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className={cn(
                    "text-xs font-bold uppercase",
                    project.health === 'online' ? "text-emerald-500" : "text-red-500"
                  )}>
                    {project.health}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <a 
                  href={project.url} 
                  target="_blank" 
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-100 transition-all"
                >
                  <Globe size={16} />
                  Visitar
                </a>
                <a 
                  href={project.admin_url} 
                  target="_blank" 
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-all"
                >
                  <Layout size={16} />
                  Admin
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Configuración API</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Project ID</label>
                  <code className="text-sm text-slate-700 font-mono">{project.id}</code>
                  
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mt-4 mb-1">API Key</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-slate-700 font-mono bg-white border border-slate-200 rounded-lg p-2 truncate">
                      {project.api_key}
                    </code>
                    <button 
                      onClick={copyApiKey}
                      className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-500"
                    >
                      {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Estado de Salud</h3>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-600">Estado Realtime</span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", project.health === 'online' ? "bg-emerald-500" : "bg-red-500")} />
                      <span className="text-sm font-bold">{project.health.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Último Heartbeat</span>
                    <span className="text-sm font-medium text-slate-800">{new Date(project.last_ping).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Control Remoto</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  disabled={loadingAction !== null}
                  onClick={handleTogglePopup}
                  className="p-4 border-2 border-amber-100 bg-amber-50 rounded-2xl text-amber-700 hover:bg-amber-100 transition-all text-left disabled:opacity-50"
                >
                  <div className="font-bold text-sm mb-1">
                    {loadingAction === 'popup' ? 'Enviando...' : 'Mandar Alerta Pago'}
                  </div>
                  <div className="text-[10px] opacity-70">Muestra un aviso de cobro en la web.</div>
                </button>
                <button 
                  disabled={loadingAction !== null}
                  onClick={handleToggleStatus}
                  className={cn(
                    "p-4 border-2 rounded-2xl text-left transition-all disabled:opacity-50",
                    project.status === 'active' 
                      ? "border-red-100 bg-red-50 text-red-700 hover:bg-red-100" 
                      : "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  )}
                >
                  <div className="font-bold text-sm mb-1">
                    {loadingAction === 'status' ? 'Cambiando...' : (project.status === 'active' ? 'Desactivar Página' : 'Habilitar Página')}
                  </div>
                  <div className="text-[10px] opacity-70">{project.status === 'active' ? 'Bloquea el acceso a la web.' : 'Restaura el acceso normal.'}</div>
                </button>
              </div>
            </div>

            <div className="bg-blue-600 rounded-2xl p-6 text-white overflow-hidden relative">
              <Activity className="absolute -right-4 -bottom-4 text-white/10" size={120} />
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-blue-100 text-sm mb-1 uppercase font-bold tracking-wider">Facturación</p>
                  <p className="text-2xl font-bold">Próximo cobro: {project.next_payment}</p>
                </div>
                <button className="px-6 py-2 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20">
                  Marcar como pagado
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProjectModal;
