import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeftIcon, CalendarIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";

const NewTask: NextPage = () => {
  const router = useRouter();
  const { projectId } = router.query as { projectId?: string };
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: projectId ?? "",
    assignedToId: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    dueDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: projects } = api.project.getAll.useQuery();
  const { data: selectedProject } = api.project.getById.useQuery(
    { id: formData.projectId },
    { enabled: !!formData.projectId }
  );

  const createTask = api.task.create.useMutation({
    onSuccess: (task) => {
      void router.push(`/tasks/${task.id}`);
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
  });

  useEffect(() => {
    if (projectId) {
      setFormData(prev => ({ ...prev, projectId }));
    }
  }, [projectId]);

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

    if (!formData.projectId) {
      setErrors({ projectId: "Please select a project" });
      return;
    }

    const taskData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      assignedToId: formData.assignedToId || undefined,
    };

    createTask.mutate(taskData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const backUrl = formData.projectId ? `/projects/${formData.projectId}` : "/tasks";

  return (
    <>
      <Head>
        <title>New Task - TaskCollab</title>
        <meta name="description" content="Create a new task" />
      </Head>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={backUrl}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            {formData.projectId ? "Back to Project" : "Back to Tasks"}
          </Link>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Create New Task
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}            {/* Project Selection */}
            <div>
              <label htmlFor="projectId" className="block text-sm font-semibold text-gray-900 mb-2">
                Project *
              </label>
              <select
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className={`block w-full px-4 py-3 text-sm border-2 rounded-xl bg-gray-50 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-0 ${
                  errors.projectId 
                    ? "border-red-300 focus:border-red-500 bg-red-50" 
                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                }`}
              >
                <option value="">Select a project</option>
                {projects?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.projectId}
                </p>
              )}
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
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <CalendarIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>            {/* Assignee */}
            {selectedProject && (
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
                  {selectedProject.members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
            )}            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href={backUrl}
                className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/30 transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createTask.isPending}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {createTask.isPending ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewTask;
