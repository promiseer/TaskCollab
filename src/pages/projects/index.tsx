import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { PlusIcon, FolderIcon, UsersIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";
import { formatRelativeTime } from "~/utils/helpers";

const Projects: NextPage = () => {
  const { data: projects, isLoading } = api.project.getAll.useQuery();

  return (
    <>
      <Head>
        <title>Projects - TaskCollab</title>
        <meta name="description" content="Manage your projects" />
      </Head>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Projects
            </h1>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/projects/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              New Project
            </Link>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mt-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div
                          className="h-12 w-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: project.color ?? "#3B82F6" }}
                        >
                          <FolderIcon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 truncate">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatRelativeTime(project.updatedAt)}
                          </p>
                        </div>
                      </div>
                      
                      {project.description && (
                        <p className="mt-4 text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          {project.members.length} members
                        </div>
                        <div className="text-sm text-gray-500">
                          {project._count.tasks} tasks
                        </div>
                      </div>
                      
                      {/* Member avatars */}
                      <div className="mt-4 flex -space-x-2">
                        {project.members.slice(0, 4).map((member) => (
                          <div
                            key={member.id}
                            className="relative h-8 w-8 rounded-full border-2 border-white"
                          >
                            {member.user.image ? (
                              <Image
                                className="h-8 w-8 rounded-full"
                                src={member.user.image}
                                alt={member.user.name ?? "User"}
                                width={32}
                                height={32}
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700">
                                {member.user.name?.charAt(0) ?? "U"}
                              </div>
                            )}
                          </div>
                        ))}
                        {project.members.length > 4 && (
                          <div className="relative h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              +{project.members.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new project.
              </p>
              <div className="mt-6">
                <Link
                  href="/projects/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                  New Project
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Projects;
