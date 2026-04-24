import { Globe, ExternalLink, Settings, AlertCircle, Clock } from 'lucide-react';
import { cn, Project } from '../lib/utils';
import { motion } from 'framer-motion';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const isOnline = project.health === 'online';
  
  const statusColors = {
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    suspended: 'bg-amber-500',
  };

  const healthColors = {
    online: 'bg-emerald-500 shadow-emerald-500/50',
    offline: 'bg-red-500 shadow-red-500/50',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={() => onClick(project)}
      className="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-white",
            project.type === 'web' ? 'bg-blue-500' : 
            project.type.includes('system') ? 'bg-indigo-500' : 'bg-orange-500'
          )}>
            {project.type === 'web' ? <Globe size={24} /> : 
             project.type === 'university' ? <AlertCircle size={24} /> : <Settings size={24} />}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">{project.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", healthColors[project.health])} />
              <span className={cn("text-xs font-medium uppercase tracking-wider", isOnline ? "text-emerald-600" : "text-red-600")}>
                {project.health}
              </span>
            </div>
          </div>
        </div>
        <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", statusColors[project.status], "text-white")}>
          {project.status}
        </div>
      </div>

      {project.metrics && (
        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 p-3 rounded-xl">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Users</p>
            <p className="font-bold text-slate-800">{project.metrics.users}</p>
          </div>
          <div className="text-center border-x border-slate-200">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Sales</p>
            <p className="font-bold text-slate-800">${project.metrics.sales}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Errors</p>
            <p className={cn("font-bold", project.metrics.errors > 0 ? "text-red-500" : "text-slate-800")}>
              {project.metrics.errors}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-slate-500">
          <Clock size={14} />
          <span className="text-xs">Pago: {project.next_payment}</span>
        </div>
        <a 
          href={project.url} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ExternalLink size={16} />
        </a>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
