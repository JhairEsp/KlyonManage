import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProjectModal from './components/ProjectModal';
import CreateProjectModal from './components/CreateProjectModal';
import { Project } from './lib/utils';
import { supabase } from './lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      // Simplificamos la consulta para evitar errores de joins profundos
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      if (!projectsData) return;

      // Obtenemos pings, suscripciones y métricas
      const { data: healthData } = await supabase.from('health_checks').select('*');
      const { data: subsData } = await supabase.from('subscriptions').select('*');
      const { data: metricsData } = await supabase.from('metrics').select('*').order('created_at', { ascending: false });

      const formattedProjects: Project[] = projectsData.map((p: any) => {
        const health = healthData?.find(h => h.project_id === p.id);
        const sub = subsData?.find(s => s.project_id === p.id);
        
        // Obtenemos la última métrica registrada para este proyecto
        const lastMetric = metricsData?.find(m => m.project_id === p.id);
        
        const now = new Date();
        const pingDate = health?.last_ping ? new Date(health.last_ping) : null;
        const isOnline = pingDate && (now.getTime() - pingDate.getTime()) < 300000;

        return {
          id: p.id,
          name: p.name,
          type: p.type,
          url: p.url,
          admin_url: p.admin_url,
          api_key: p.api_key,
          status: p.status,
          health: isOnline ? 'online' : 'offline',
          last_ping: health?.last_ping || p.created_at,
          next_payment: sub?.next_payment_date || 'N/A',
          metrics: { 
            users: lastMetric?.users || 0, 
            sales: parseFloat(lastMetric?.sales || sub?.price || 0), 
            errors: lastMetric?.errors || 0 
          }
        };
      });

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    
    // Auto-actualizar cada 10 segundos para ver cambios de estado
    const interval = setInterval(fetchProjects, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAddProject = async (newProjectData: any) => {
    try {
      // 1. Insert into projects
      const { data: project, error: pError } = await supabase
        .from('projects')
        .insert([{
          name: newProjectData.name,
          type: newProjectData.type,
          url: newProjectData.url,
          admin_url: newProjectData.admin_url,
          status: 'active'
        }])
        .select()
        .single();

      if (pError) throw pError;

      // 2. Create initial subscription record
      await supabase
        .from('subscriptions')
        .insert([{
          project_id: project.id,
          price: 0,
          next_payment_date: newProjectData.next_payment || 'N/A'
        }]);

      // Refresh list
      fetchProjects();
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Error al crear el proyecto. Revisa la consola.');
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans antialiased text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full ml-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Dashboard 
            activeTab={activeTab} 
            projects={projects} 
            onProjectClick={(p) => setSelectedProject(p)}
            onNewProject={() => setIsCreateModalOpen(true)}
          />
        )}
      </main>

      <ProjectModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />

      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleAddProject}
      />
    </div>
  );
}

export default App;
