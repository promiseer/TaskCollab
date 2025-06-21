import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  FolderIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { api } from "~/utils/api";
import { formatRelativeTime, statusColors, priorityColors } from "~/utils/helpers";

const ProjectDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { data: session } = useSession();
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');

  const { data: project, isLoading, refetch } = api.project.getById.useQuery(
    { id },
    { enabled: !!id }
  );

  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => {
      router.push("/projects");
    },
  });

  const addMember = api.project.addMember.useMutation({
    onSuccess: () => {
      setShowAddMember(false);
      setNewMemberEmail('');
      setNewMemberRole('MEMBER');
      void refetch();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const removeMember = api.project.removeMember.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onError: (error) => {
      alert(error.message);
    },  });
  
  // Get current user's role in this project
  const userRole = project?.members.find(
    (member) => member.user.id === session?.user?.id
  )?.role;

  const canEdit = userRole === "OWNER" || userRole === "ADMIN";
  const canDelete = userRole === "OWNER";

  const handleAddMember = () => {
    if (!newMemberEmail.trim()) return;
    
    addMember.mutate({
      projectId: project!.id,
      email: newMemberEmail.trim(),
      role: newMemberRole,
    });
  };
  const filteredTasks = project?.tasks.filter((task) => {
    if (filter === "mine") {
      return task.assignedTo?.id === session?.user?.id;
    }
    return true;
  });

  const taskStats = {
    total: project?.tasks.length || 0,
    todo: project?.tasks.filter((t) => t.status === "TODO").length || 0,
    inProgress: project?.tasks.filter((t) => t.status === "IN_PROGRESS").length || 0,
    inReview: project?.tasks.filter((t) => t.status === "IN_REVIEW").length || 0,
    done: project?.tasks.filter((t) => t.status === "DONE").length || 0,
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProject.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
          <Link href="/projects" className="text-blue-600 hover:text-blue-500 mt-2 inline-block">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{project.name} - TaskCollab</title>
        <meta name="description" content={project.description || "Project details"} />
      </Head>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/projects"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>          <div className="md:flex md:items-center md:justify-between">
            <div className="min-w-0 flex-1 flex items-center">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center mr-4"
                style={{ backgroundColor: project.color }}
              >
                <FolderIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                  {project.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Created {formatRelativeTime(project.createdAt)} by {project.createdBy.name}
                </p>
                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <div>Current user ID: {session?.user?.id}</div>
                    <div>User role: {userRole || 'None'}</div>
                    <div>Can edit: {canEdit ? 'Yes' : 'No'}</div>
                    <div>Members: {project.members.map(m => `${m.user.name} (${m.role})`).join(', ')}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
              <Link
                href={`/tasks/new?projectId=${project.id}`}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                New Task
              </Link>
              {canEdit && (
                <>
                  <Link
                    href={`/projects/${project.id}/edit`}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    <PencilIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                    Edit
                  </Link>
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="inline-flex items-center rounded-md bg-white px-2 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (                      <button
                        onClick={() => setShowAddMember(true)}
                        className={`${
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        } flex w-full items-center px-4 py-2 text-sm`}
                      >
                        <UserPlusIcon className="mr-3 h-5 w-5" />
                        Add Member
                      </button>
                            )}
                          </Menu.Item>
                          {canDelete && (
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={handleDelete}
                                  className={`${
                                    active ? "bg-gray-100 text-gray-900" : "text-red-700"
                                  } flex w-full items-center px-4 py-2 text-sm`}
                                >
                                  Delete Project
                                </button>
                              )}
                            </Menu.Item>
                          )}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            {project.description && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </div>
            )}

            {/* Task Stats */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Task Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-500">{taskStats.todo}</div>
                  <div className="text-sm text-gray-500">To Do</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
                  <div className="text-sm text-gray-500">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{taskStats.inReview}</div>
                  <div className="text-sm text-gray-500">In Review</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{taskStats.done}</div>
                  <div className="text-sm text-gray-500">Done</div>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Tasks</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilter("all")}
                      className={`px-3 py-1 text-sm rounded-md ${
                        filter === "all"
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      All Tasks
                    </button>
                    <button
                      onClick={() => setFilter("mine")}
                      className={`px-3 py-1 text-sm rounded-md ${
                        filter === "mine"
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      My Tasks
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredTasks && filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="block p-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">                        <div className="flex items-center min-w-0 flex-1">
                          <div className={`h-3 w-3 rounded-full mr-3 ${
                            task.status === "TODO" ? "bg-gray-400" :
                            task.status === "IN_PROGRESS" ? "bg-yellow-400" :
                            task.status === "IN_REVIEW" ? "bg-purple-400" :
                            "bg-green-400"
                          }`} />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {task.title}
                            </h4>
                            <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
                              <span className={`px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </span>
                              {task.assignedTo && (
                                <span>Assigned to {task.assignedTo.name}</span>
                              )}
                              {task.dueDate && (
                                <span>Due {formatRelativeTime(task.dueDate)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.status === "DONE" ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          ) : task.dueDate && new Date(task.dueDate) < new Date() ? (
                            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                          ) : (
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No tasks found. Create your first task to get started.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">            {/* Project Members */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{project.members.length}</span>
                  <UsersIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              {/* Add Member Form */}
              {showAddMember && (
                <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Member</h4>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="memberEmail" className="block text-xs font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="memberEmail"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="memberRole" className="block text-xs font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        id="memberRole"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value as 'ADMIN' | 'MEMBER')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => {
                          addMember.mutate({
                            projectId: project.id,
                            email: newMemberEmail,
                            role: newMemberRole,
                          });
                        }}
                        disabled={!newMemberEmail || addMember.isLoading}
                        className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addMember.isLoading ? 'Adding...' : 'Add Member'}
                      </button>
                      <button
                        onClick={() => setShowAddMember(false)}
                        className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {project.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      {member.user.image ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={member.user.image}
                          alt={member.user.name || "User"}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                          {member.user.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {member.user.name}
                        </p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    {canEdit && member.role !== 'OWNER' && (
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${member.user.name} from this project?`)) {
                            removeMember.mutate({
                              projectId: project.id,
                              userId: member.user.id,
                            });
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Remove member"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {canEdit && !showAddMember && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="mt-4 w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Add Member
                </button>
              )}
            </div>

            {/* Project Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">
                    {formatRelativeTime(project.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">
                    {formatRelativeTime(project.updatedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="text-sm text-gray-900">{project.createdBy.name}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetail;
