import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { api } from "~/utils/api";

const EditProject: NextPage = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: project, isLoading } = api.project.getById.useQuery(
    { id },
    { enabled: !!id }
  );

  const updateProject = api.project.update.useMutation({
    onSuccess: () => {
      router.push(`/projects/${id}`);
    },
    onError: (error) => {
      setErrors({ general: error.message });
    },
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        color: project.color || "#3B82F6",
      });
    }
  }, [project]);

  const colorOptions = [
    { value: "#3B82F6", name: "Blue" },
    { value: "#10B981", name: "Green" },
    { value: "#F59E0B", name: "Yellow" },
    { value: "#EF4444", name: "Red" },
    { value: "#8B5CF6", name: "Purple" },
    { value: "#06B6D4", name: "Cyan" },
    { value: "#F97316", name: "Orange" },
    { value: "#84CC16", name: "Lime" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.name.trim()) {
      setErrors({ name: "Project name is required" });
      return;
    }

    updateProject.mutate({
      id,
      ...formData,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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
        <title>Edit {project.name} - TaskCollab</title>
        <meta name="description" content="Edit project details" />
      </Head>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/projects/${id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Project
          </Link>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Edit Project
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}            {/* Project Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`block w-full px-4 py-3 text-sm border-2 rounded-xl bg-gray-50 transition-all duration-200 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-0 ${
                  errors.name 
                    ? "border-red-300 focus:border-red-500 bg-red-50" 
                    : "border-gray-200 focus:border-blue-500 hover:border-gray-300"
                }`}
                placeholder="Enter project name"
                maxLength={100}
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
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
                placeholder="Describe your project..."
              />
            </div>            {/* Color */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Project Color
              </label>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`relative h-12 w-12 rounded-xl border-3 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30 hover:scale-105 ${
                      formData.color === color.value
                        ? "border-gray-900 shadow-lg scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {formData.color === color.value && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-5 w-5 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href={`/projects/${id}`}
                className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-500/30 transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={updateProject.isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {updateProject.isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProject;
