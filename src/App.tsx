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

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    setLoading(true);
    try {
      // We join with health_checks and subscriptions to get the full state
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          health_checks(last_ping, status),
          subscriptions(next_payment_date)
        `);

      if (error) throw error;

      const formattedProjects: Project[] = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        url: p.url,
        admin_url: p.admin_url,
        api_key: p.api_key,
        status: p.status,
        health: p.health_checks?.[0]?.status || 'offline',
        last_ping: p.health_checks?.[0]?.last_ping || p.created_at,
        next_payment: p.subscriptions?.[0]?.next_payment_date || 'N/A',
        metrics: { users: 0, sales: 0, errors: 0 } // Metrics would be fetched from the metrics table in a real scenario
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
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
