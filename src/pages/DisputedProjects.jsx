import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalState, setGlobalState, truncate } from "../store";
import { getDisputedJobs } from "../services/blockchain";
import Header from "../components/Header";
import {
  FaShieldAlt,
  FaGithub,
  FaUserCircle,
  FaTag,
  FaCoins,
  FaRobot,
} from "react-icons/fa";

const DisputedProjects = () => {
  const [isAdmin] = useGlobalState("isAdmin");
  const [disputedJobs] = useGlobalState("disputedJobs");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
    } else {
      getDisputedJobs();
    }
  }, [isAdmin, navigate]);

  const handleResolveClick = (job) => {
    setGlobalState("job", job);
    setGlobalState("resolveDisputeModal", "scale-100");
  };

  const handleResolveDisputeClick = () => {
    window.open(
      "https://project-completion-alith-ai-agent.vercel.app/",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-12">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-accent-100 rounded-full text-accent-600 shadow-sm mb-4">
            <FaShieldAlt className="text-2xl" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent-600 to-primary-600 text-transparent bg-clip-text text-center mb-2">
            Disputed Projects
          </h1>
          <p className="text-gray-600 max-w-2xl text-center mb-6">
            Review and resolve disputes between clients and freelancers. As an
            admin, you have the authority to make final decisions.
          </p>

          <button
            className="py-3 px-6 bg-gradient-to-r from-accent-500 to-blue-500 hover:from-accent-600 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg mb-8"
            onClick={handleResolveDisputeClick}
          >
            <FaRobot className="text-white" />
            <span>Resolve Disputes with AI</span>
          </button>
        </div>

        {disputedJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {disputedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="bg-gradient-to-r from-accent-500/10 to-primary-500/10 p-4 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">
                    {job.jobTitle}
                  </h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaCoins className="text-secondary-500" />
                      <span className="font-semibold text-secondary-700">
                        {job.finalBudget} USDT
                      </span>
                    </div>
                    <div className="bg-accent-100 text-accent-700 text-xs font-medium px-2 py-1 rounded-full">
                      Disputed
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {job.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 bg-primary-100 rounded-full">
                      <FaUserCircle className="text-primary-600" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Client:</span>
                      <span className="ml-1 font-medium text-gray-700">
                        {truncate(job.owner, 4, 4, 11)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <div className="p-1.5 bg-secondary-100 rounded-full">
                      <FaUserCircle className="text-secondary-600" />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Freelancer:</span>
                      <span className="ml-1 font-medium text-gray-700">
                        {truncate(job.freelancer, 4, 4, 11)}
                      </span>
                    </div>
                  </div>

                  {job.githubUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1.5 bg-gray-100 rounded-full">
                        <FaGithub className="text-gray-700" />
                      </div>
                      <a
                        href={job.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[200px]"
                      >
                        {job.githubUrl.replace(
                          /^https?:\/\/github\.com\//i,
                          ""
                        )}
                      </a>
                    </div>
                  )}

                  {job.tags && job.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {job.tags.map((tag, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-xs rounded-full border border-gray-200"
                        >
                          <FaTag className="text-gray-400 text-[10px]" />
                          <span className="text-gray-700">{tag}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
                  <button
                    onClick={() => handleResolveClick(job)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-accent-500 to-primary-500 hover:from-accent-600 hover:to-primary-600 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md group-hover:scale-[1.02] transform"
                  >
                    <FaShieldAlt className="text-white" />
                    <span>Resolve Dispute</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="p-6 bg-gray-50 rounded-full mb-4">
              <FaShieldAlt className="text-4xl text-gray-300" />
            </div>
            <p className="text-xl text-gray-500 font-medium">
              No disputed projects at the moment.
            </p>
            <p className="text-gray-400 mt-2">
              When disputes arise, they will appear here for resolution.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputedProjects;
