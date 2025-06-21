import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeftIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";

const EditTask: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO" as "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    assignedToId: "",
    dueDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: task, isLoading } = api.task.getById.useQuery(
    { id },
    { enabled: !!id }
  );

  const { data: project } = api.project.getById.useQuery(
    { id: task?.project.id || "" },
    { enabled: !!task?.project.id }
  );

  const updateTask = api.task.update.useMutation({
    onSuccess: () => {
      router.push(`/tasks/${id}`);
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assignedToId: task.assignedTo?.id || "",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      });
    }
  }, [task]);

  const statusOptions = [
    { value: "TODO", label: "To Do", color: "bg-gray-100 text-gray-800" },
    { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-100 text-blue-800" },
    { value: "IN_REVIEW", label: "In Review", color: "bg-yellow-100 text-yellow-800" },
    { value: "DONE", label: "Done", color: "bg-green-100 text-green-800" },
  ];

  const priorityOptions = [
    { value: "LOW", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "MEDIUM", label: "Medium", color: "bg-blue-100 text-blue-800" },
    { value: "HIGH", label: "High", color: "bg-yellow-100 text-yellow-800" },
    { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-800" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.title.trim()) {
      setErrors({ title: "Task title is required" });
      return;
    }

    const taskData = {
      id,
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      assignedToId: formData.assignedToId || undefined,
    };

    updateTask.mutate(taskData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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
        <title>Edit {task.title} - TaskCollab</title>
        <meta name="description" content="Edit task details" />
      </Head>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/tasks/${id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Task
          </Link>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Task
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            {/* Project Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: task.project.color }}
                >
                  <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{task.project.name}</p>
                  <p className="text-xs text-gray-500">Project</p>
                </div>
              </div>
            </div>            {/* Task Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`block w-full px-4 py-3 text-sm border-2 rounded-xl bg-gray-50 transition-all duration-200 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-0 ${
                  errors.title 
                    ? "border-red-300 focus:border-red-500 bg-red-50" 
                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                }`}
                placeholder="Enter task title"
                maxLength={200}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.title}
                </p>
              )}
            </div>            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 transition-all duration-200 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-0 hover:border-gray-300 resize-none"
                placeholder="Describe the task..."
              />
            </div>            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-0 hover:border-gray-300"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-900 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-0 hover:border-gray-300"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignee */}
              <div>
                <label htmlFor="assignedToId" className="block text-sm font-semibold text-gray-900 mb-2">
                  Assign To
                </label>
                <select
                  id="assignedToId"
                  name="assignedToId"
                  value={formData.assignedToId}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-0 hover:border-gray-300"
                >
                  <option value="">Unassigned</option>
                  {project?.members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-900 mb-2">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 transition-all duration-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-0 hover:border-gray-300"
                  />
                  <CalendarIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href={`/tasks/${id}`}
                className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/30 transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateTask.isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {updateTask.isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditTask;
