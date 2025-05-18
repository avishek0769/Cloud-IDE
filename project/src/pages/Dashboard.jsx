import { useCallback, useContext, useEffect, useState } from 'react';
import { SearchBar } from '../components/ui/SearchBar';
import { ProjectCard } from '../components/projects/ProjectCard';
import { PageHeader } from '../components/layout/PageHeader';
import { NewProjectModal } from '../components/projects/NewProjectModal';
import { Navbar } from '../components/layout/Navbar';
import { Context } from '../context/ContextProvider';
import { useNavigate } from 'react-router-dom';
import AlertMessage from '../components/ui/AlertMessage';
import LoadingScreen from '../components/ui/LoadingScreen';
import { SyncLoader } from 'react-spinners';
import NavTab from '../components/layout/NavTab';


function Dashboard() {
  const [projects, setProjects] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState("");
  const { domain, currentUser } = useContext(Context)
  const [activeTab, setActiveTab] = useState('your');
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser == undefined) navigate("/")
  }, [currentUser])

  useEffect(() => {
    setProjects(null)
    fetch(`${domain}/projects/get/${activeTab}`, {
      headers: {
        "Content-type": "application/json"
      },
      credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
      console.log(data.data)
      setProjects(data.data)
    })
  }, [domain, activeTab])

  const filteredProjects = projects && projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOnEdit = (project) => {
    // fetch(`${domain}/projects/edit/${project._id}`, {
    //   headers: {
    //     "Content-type": "application/json"
    //   },
    //   body: JSON.stringify({ name:  }),
    //   credentials: "include"
    // })
  }

  const handleOnDelete = (project) => {
    setIsDeleting(project._id)
    fetch(`${domain}/projects/delete/${project._id}`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json"
      },
      credentials: "include"
    })
      .then(res => {
        console.log(res.status)
        if (res.status > 399) console.log("Error Delete");
        else {
          const updatedProjects = projects.filter(elem => elem._id != project._id)
          setProjects(updatedProjects)
        }
      })
  }

  return (
    <>
      {loading && <LoadingScreen message={"It may take a while..."} />}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black">
        <PageHeader title="My Projects" onNewProject={() => setIsNewProjectModalOpen(true)} />

        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <NavTab activeTab={activeTab} setActiveTab={setActiveTab} />

        {projects == null && <div className='flex justify-center w-full mt-8'>
          <SyncLoader color='white' size={10} />
        </div>}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects != null && projects.length ? filteredProjects.map((project) => (
            <ProjectCard
              activeTab={activeTab}
              isDeleting={isDeleting}
              key={project.id}
              project={project}
              onEdit={handleOnEdit}
              onDelete={handleOnDelete}
            />
          )) :
            <h1 className='text-center text-white font-bold text-2xl'>No Projects yet</h1>
          }
        </div>

        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          setLoading={setLoading}
        />
      </main>
    </>
  );
}

export { Dashboard }