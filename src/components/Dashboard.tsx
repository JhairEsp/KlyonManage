import { Search, Plus, Filter, ArrowUpRight, Users, DollarSign, AlertCircle } from 'lucide-react';
import { Project, cn } from '../lib/utils';
import ProjectCard from './ProjectCard';
import { motion } from 'framer-motion';

interface DashboardProps {
  activeTab: string;
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onNewProject: () => void;
}

const Dashboard = ({ activeTab, projects, onProjectClick, onNewProject }: DashboardProps) => {
  const filteredProjects = projects.filter(p => {
    if (activeTab === 'dashboard') return true;
    if (activeTab === 'web') return p.type === 'web';
    if (activeTab === 'systems') return p.type.startsWith('system');
    if (activeTab === 'university') return p.type === 'university';
    return true;
  });

  // Cálculos reales basados en los proyectos cargados
  const totalUsers = projects.reduce((acc, p) => acc + (p.metrics?.users || 0), 0);
  const totalSales = projects.reduce((acc, p) => acc + (p.metrics?.sales || 0), 0);
  const totalErrors = projects.reduce((acc, p) => acc + (p.metrics?.errors || 0), 0);
  const activeProjects = projects.filter(p => p.health === 'online').length;

  const stats = [
    { label: 'Online Ahora', value: activeProjects, icon: ArrowUpRight, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Usuarios Totales', value: totalUsers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Ingresos Mensuales', value: `$${totalSales.toLocaleString()}`, icon: DollarSign, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Incidencias (Errores)', value: totalErrors, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  const getTitle = () => {
    switch(activeTab) {
      case 'web': return 'Páginas Web';
      case 'systems': return 'Sistemas y Aplicaciones';
      case 'university': return 'Proyectos Universitarios';
      default: return 'Vista General';
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50/50 ml-64 p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{getTitle()}</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestiona y monitorea tus proyectos en tiempo real.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar proyecto..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={onNewProject}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <Plus size={20} />
            Nuevo Proyecto
          </button>
        </div>
      </header>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label} 
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                {i === 0 && <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-lg">+12%</span>}
              </div>
              <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {filteredProjects.length} Proyectos
          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
        </h2>
        <button className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-800 transition-colors">
          <Filter size={18} />
          Filtrar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            key={project.id}
          >
            <ProjectCard 
              project={project} 
              onClick={onProjectClick} 
            />
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Plus className="text-slate-300" size={32} />
          </div>
          <p className="text-slate-500 font-medium text-lg">No hay proyectos en esta categoría</p>
          <button className="mt-4 text-blue-600 font-bold hover:underline">Agregar mi primer proyecto</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
