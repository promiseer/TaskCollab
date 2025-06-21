import { useSession } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (session) {
      void router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (session) {
    return null; // Will redirect to dashboard
  }

  return (
    <>
      <Head>
        <title>TaskCollab - Project Management Made Simple</title>
        <meta name="description" content="A simple task management and collaboration tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex min-h-screen">
          {/* Left side - Hero content */}
          <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
            <div className="mx-auto w-full max-w-sm lg:w-96">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-gray-900">
                  TaskCollab
                </h2>
                <p className="mt-2 text-lg text-gray-600">
                  Simple task management and collaboration for teams
                </p>
              </div>

              <div className="mt-10">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Key Features
                    </h3>
                    <ul className="space-y-3 text-gray-600">
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Create and manage projects
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Assign tasks to team members
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Track progress and deadlines
                      </li>
                      <li className="flex items-center">
                        <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Collaborate with comments
                      </li>
                    </ul>
                  </div>                  <div className="pt-6">
                    <Link
                      href="/login"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Image/illustration */}
          <div className="relative hidden w-0 flex-1 lg:block">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
              <div className="text-center text-white p-8">
                <svg className="mx-auto h-24 w-24 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h2 className="text-3xl font-bold mb-4">
                  Organize Your Work
                </h2>
                <p className="text-xl opacity-90">
                  Keep your projects on track with our intuitive task management system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
