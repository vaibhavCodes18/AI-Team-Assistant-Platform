import { useParams } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import ChatMainSection from "../../components/chat/ChatMainSection";

const ProjectChat = () => {
  const { id, projectId } = useParams();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area Component */}
      <ChatMainSection id={id} projectId={projectId} />
    </div>
  );
};

export default ProjectChat;
