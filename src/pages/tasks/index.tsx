import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { PlusIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";
import { statusColors, priorityColors, formatRelativeTime, isOverdue } from "~/utils/helpers";

const Tasks: NextPage = () => {
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: tasks, isLoading } = api.task.getAll.useQuery({
    assignedToMe: filter === "mine",
    status: statusFilter === "all" ? undefined : (statusFilter as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"),
  });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "IN_REVIEW", label: "In Review" },
    { value: "DONE", label: "Done" },
  ];

  return (
    <>
      <Head>
        <title>Tasks - TaskCollab</title>
        <meta name="description" content="Manage your tasks" />
      </Head>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Tasks
            </h1>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              href="/tasks/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              New Task
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === "all"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setFilter("mine")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === "mine"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              My Tasks
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tasks List */}
        <div className="mt-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {task.title}
                            </h3>
                            {task.dueDate && isOverdue(task.dueDate) && task.status !== "DONE" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Overdue
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: task.project.color ?? "#3B82F6" }}
                              />
                              {task.project.name}
                            </span>
                            {task.assignedTo && (
                              <span>Assigned to {task.assignedTo.name}</span>
                            )}
                            <span>{formatRelativeTime(task.createdAt)}</span>
                          </div>

                          <div className="mt-3 flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                statusColors[task.status as keyof typeof statusColors]
                              }`}
                            >
                              {task.status.replace("_", " ")}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                priorityColors[task.priority as keyof typeof priorityColors]
                              }`}
                            >
                              {task.priority}
                            </span>
                            {task.tags.length > 0 && (
                              <div className="flex items-center space-x-1">
                                {task.tags.slice(0, 3).map((taskTag) => (
                                  <span
                                    key={taskTag.tag.id}
                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-gray-700"
                                    style={{ backgroundColor: taskTag.tag.color + "20" }}
                                  >
                                    {taskTag.tag.name}
                                  </span>
                                ))}
                                {task.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{task.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          {task.dueDate && (
                            <p className="text-sm text-gray-500">
                              Due {formatRelativeTime(task.dueDate)}
                            </p>
                          )}
                          {task._count.comments > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              {task._count.comments} comments
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12">
              <ListBulletIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === "mine" 
                  ? "You don't have any tasks assigned to you yet."
                  : "Get started by creating a new task."
                }
              </p>
              {filter === "all" && (
                <div className="mt-6">
                  <Link
                    href="/tasks/new"
                    className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                  >
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                    New Task
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Tasks;
