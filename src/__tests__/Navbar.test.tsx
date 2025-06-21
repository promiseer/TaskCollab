import { render, screen } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import Navbar from '../components/Layout/Navbar';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/dashboard',
    push: jest.fn(),
  }),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Navbar Component', () => {
  const mockSession = {
    user: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    },
    expires: '2024-01-01',
  };

  beforeEach(() => {
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders navigation links', () => {
    render(
      <SessionProvider session={mockSession}>
        <Navbar />
      </SessionProvider>
    );

    expect(screen.getByText('TaskCollab')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('shows user initials when no image is provided', () => {
    render(
      <SessionProvider session={mockSession}>
        <Navbar />
      </SessionProvider>
    );

    // Should show initials "TU" for "Test User"
    expect(screen.getByText('TU')).toBeInTheDocument();
  });

  it('renders user image when provided', () => {
    const sessionWithImage = {
      ...mockSession,
      user: {
        ...mockSession.user,
        image: 'https://example.com/avatar.jpg',
      },
    };

    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({
      data: sessionWithImage,
      status: 'authenticated',
    });

    render(
      <SessionProvider session={sessionWithImage}>
        <Navbar />
      </SessionProvider>
    );

    const avatarImages = screen.getAllByRole('img');
    expect(avatarImages.some(img => img.getAttribute('src') === 'https://example.com/avatar.jpg')).toBe(true);
  });
});
