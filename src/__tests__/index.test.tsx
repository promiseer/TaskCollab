import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { useRouter } from 'next/router';
import Home from '../pages/index';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('Home Page', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      pathname: '/',
      query: {},
      asPath: '/',
      route: '/',
      basePath: '',
      isLocaleDomain: false,
      isReady: true,
      isPreview: false,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders landing page for unauthenticated users', () => {
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <SessionProvider session={null}>
        <Home />
      </SessionProvider>
    );

    expect(screen.getByText('TaskCollab')).toBeInTheDocument();
    expect(screen.getByText('Simple task management and collaboration for teams')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('shows loading state when session is loading', () => {
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(
      <SessionProvider session={null}>
        <Home />
      </SessionProvider>
    );

    // Should show loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('displays key features', () => {
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <SessionProvider session={null}>
        <Home />
      </SessionProvider>
    );

    expect(screen.getByText('Create and manage projects')).toBeInTheDocument();
    expect(screen.getByText('Assign tasks to team members')).toBeInTheDocument();
    expect(screen.getByText('Track progress and deadlines')).toBeInTheDocument();
    expect(screen.getByText('Collaborate with comments')).toBeInTheDocument();
  });
});
