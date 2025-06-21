import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { 
  ClockIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  FolderIcon,
  ListBulletIcon
} from "@heroicons/react/24/outline";
import { api } from "~/utils/api";
import { formatRelativeTime, statusColors, priorityColors, isOverdue } from "~/utils/helpers";

const Dashboard: NextPage = () => {
  const { data: projects, isLoading: projectsLoading } = api.project.getAll.useQuery();
  const { data: tasks, isLoading: tasksLoading } = api.task.getAll.useQuery({});
  const { data: stats } = api.task.getStats.useQuery({});
  const { data: myTasks } = api.task.getAll.useQuery({ assignedToMe: true });

  const recentTasks = tasks?.slice(0, 5) || [];
  const upcomingTasks = tasks?.filter(task => 
    task.dueDate && 
    !isOverdue(task.dueDate) && 
    task.status !== "DONE"
  ).slice(0, 5) || [];

  const overdueTasks = tasks?.filter(task => 
    task.dueDate && 
    isOverdue(task.dueDate) && 
    task.status !== "DONE"
  ).length || 0;

  return (
    <>
      <Head>
        <title>Dashboard - TaskCollab</title>
        <meta name="description" content="Task management dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Dashboard
            </h1>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/projects/new"
              className="ml-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              New Project
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ListBulletIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Total Tasks</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.totalTasks || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.doneTasks || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">My Tasks</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats?.myTasks || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">Overdue</dt>
                    <dd className="text-lg font-medium text-gray-900">{overdueTasks}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Projects */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Projects</h3>
                <Link
                  href="/projects"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
              <div className="mt-5">
                {projectsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : projects && projects.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {projects.slice(0, 5).map((project) => (
                      <li key={project.id} className="py-4">
                        <Link href={`/projects/${project.id}`} className="flex items-center hover:bg-gray-50 -m-2 p-2 rounded">
                          <div className="flex-shrink-0">                            <div 
                              className="h-10 w-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: project.color || "#3B82F6" }}
                            >
                              <FolderIcon className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {project.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {project._count.tasks} tasks
                              </p>
                            </div>
                            <div className="flex items-center mt-1">
                              <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <p className="text-sm text-gray-500">
                                {project.members.length} members
                              </p>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
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
          </div>

          {/* Recent Tasks */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Recent Tasks</h3>
                <Link
                  href="/tasks"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all
                </Link>
              </div>
              <div className="mt-5">
                {tasksLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : recentTasks.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {recentTasks.map((task) => (
                      <li key={task.id} className="py-4">
                        <Link href={`/tasks/${task.id}`} className="block hover:bg-gray-50 -m-2 p-2 rounded">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {task.title}
                              </p>
                              <div className="flex items-center mt-1 space-x-2">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                    statusColors[task.status as keyof typeof statusColors]
                                  }`}
                                >
                                  {task.status.replace("_", " ")}
                                </span>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                    priorityColors[task.priority as keyof typeof priorityColors]
                                  }`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {formatRelativeTime(task.createdAt)}
                              </p>
                              {task.assignedTo && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {task.assignedTo.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <ListBulletIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
                    <p className="mt-1 text-sm text-gray-500">Tasks will appear here once you create them.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {upcomingTasks.length > 0 && (
          <div className="mt-8">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Upcoming Deadlines</h3>
                <div className="mt-5">
                  <ul className="divide-y divide-gray-200">
                    {upcomingTasks.map((task) => (
                      <li key={task.id} className="py-4">
                        <Link href={`/tasks/${task.id}`} className="block hover:bg-gray-50 -m-2 p-2 rounded">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-900">
                                {task.title}
                              </p>
                              <p className="text-sm text-gray-500">{task.project.name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-900">
                                {task.dueDate && formatRelativeTime(task.dueDate)}
                              </p>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  priorityColors[task.priority as keyof typeof priorityColors]
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
