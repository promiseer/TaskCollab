import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  ArrowLeftIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  FolderIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { api } from "~/utils/api";
import { formatRelativeTime, priorityColors } from "~/utils/helpers";

const TaskDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [commentContent, setCommentContent] = useState("");

  const { data: task, isLoading, refetch } = api.task.getById.useQuery(
    { id },
    { enabled: !!id }
  );

  const updateTaskStatus = api.task.update.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const deleteTask = api.task.delete.useMutation({
    onSuccess: () => {
      void router.push(`/projects/${task?.project.id}`);
    },
  });

  const addComment = api.task.addComment.useMutation({
    onSuccess: () => {
      setCommentContent("");
      void refetch();
    },
  });

  const statusOptions = [
    { value: "TODO", label: "To Do", color: "bg-gray-100 text-gray-800" },
    { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-800" },
    { value: "IN_REVIEW", label: "In Review", color: "bg-yellow-100 text-yellow-800" },
    { value: "DONE", label: "Done", color: "bg-green-100 text-green-800" },
  ];

  const priorityLabels = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
  };

  const handleStatusChange = (newStatus: string) => {
    if (task) {
      updateTaskStatus.mutate({
        id: task.id,
        status: newStatus as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
      });
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
      deleteTask.mutate({ id });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim() && task) {
      addComment.mutate({
        taskId: task.id,
        content: commentContent,
      });
    }
  };

  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

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

  if (!task) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Task not found</h3>
          <Link href="/tasks" className="text-blue-600 hover:text-blue-500 mt-2 inline-block">
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{task.title} - TaskCollab</title>
        <meta name="description" content={task.description ?? "Task details"} />
      </Head>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${task.project.id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Project
          </Link>

          <div className="md:flex md:items-start md:justify-between">
            <div className="min-w-0 flex-1">              <div className="flex items-center mb-2">
                <div className={`h-3 w-3 rounded-full mr-3 ${
                  task.status === "TODO" ? "bg-gray-400" :
                  task.status === "IN_PROGRESS" ? "bg-yellow-400" :
                  task.status === "IN_REVIEW" ? "bg-purple-400" :
                  "bg-green-400"
                }`} />
                <Link
                  href={`/projects/${task.project.id}`}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <div
                    className="h-4 w-4 rounded mr-2"
                    style={{ backgroundColor: task.project.color ?? "#3B82F6" }}
                  />
                  {task.project.name}
                </Link>
              </div>
              <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:tracking-tight">
                {task.title}
              </h1>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Created {formatRelativeTime(task.createdAt)} by {task.createdBy.name}</span>
                {isOverdue && (
                  <div className="flex items-center text-red-600">
                    <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                    Overdue
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex space-x-3 md:ml-4 md:mt-0">
              <Link
                href={`/tasks/${task.id}/edit`}
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
                        {({ active }) => (
                          <button
                            onClick={handleDelete}
                            className={`${
                              active ? "bg-gray-100 text-gray-900" : "text-red-700"
                            } flex w-full items-center px-4 py-2 text-sm`}
                          >
                            Delete Task
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Description */}
            {task.description && (
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            )}

            {/* Comments */}
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                  Comments ({task.comments.length})
                </h3>
              </div>
                {/* Add Comment Form */}
              <div className="p-6 border-b border-gray-200">
                <form onSubmit={handleAddComment} className="space-y-4">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    rows={3}
                    className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 transition-all duration-200 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-0 hover:border-gray-300 resize-none"
                    placeholder="Add a comment..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!commentContent.trim() || addComment.isPending}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {addComment.isPending ? "Adding..." : "Add Comment"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Comments List */}
              <div className="divide-y divide-gray-200">
                {task.comments.length > 0 ? (
                  task.comments.map((comment) => (
                    <div key={comment.id} className="p-6">
                      <div className="flex items-start space-x-3">
                        {comment.author.image ? (
                          <Image
                            className="h-8 w-8 rounded-full"
                            src={comment.author.image}
                            alt={comment.author.name ?? "User"}
                            width={32}
                            height={32}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
                            {comment.author.name?.charAt(0) ?? "U"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {comment.author.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatRelativeTime(comment.createdAt)}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status</h3>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    disabled={updateTaskStatus.isPending}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      task.status === status.value
                        ? status.color
                        : "text-gray-700 hover:bg-gray-100"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center">
                      {task.status === status.value ? (
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                      ) : (
                        <div className="h-4 w-4 mr-2" />
                      )}
                      {status.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Task Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Assigned To
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {task.assignedTo ? (
                      <div className="flex items-center">
                        {task.assignedTo.image ? (
                          <Image
                            className="h-6 w-6 rounded-full mr-2"
                            src={task.assignedTo.image}
                            alt={task.assignedTo.name ?? "User"}
                            width={24}
                            height={24}
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700 mr-2">
                            {task.assignedTo.name?.charAt(0) ?? "U"}
                          </div>
                        )}
                        {task.assignedTo.name}
                      </div>
                    ) : (
                      "Unassigned"
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>
                  </dd>
                </div>

                {task.dueDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Due Date
                    </dt>
                    <dd className={`mt-1 text-sm ${isOverdue ? "text-red-600 font-medium" : "text-gray-900"}`}>
                      {formatRelativeTime(task.dueDate)}
                      {isOverdue && " (Overdue)"}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Created
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatRelativeTime(task.createdAt)}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Created By</dt>
                  <dd className="mt-1 text-sm text-gray-900">{task.createdBy.name}</dd>
                </div>
              </dl>
            </div>

            {/* Project Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project</h3>
              <Link
                href={`/projects/${task.project.id}`}
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: task.project.color ?? "#3B82F6" }}
                >
                  <FolderIcon className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium">{task.project.name}</span>
              </Link>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((taskTag) => (
                    <span
                      key={taskTag.tag.id}
                      className="px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: taskTag.tag.color + "20",
                        color: taskTag.tag.color,
                      }}
                    >
                      {taskTag.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetail;
