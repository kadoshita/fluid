import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { Header } from '../../../src/components/header';
import { render } from '../../utils';
import * as useSession from '../../../src/hooks/useSession';
import { vi, MockInstance } from 'vitest';

describe('Header', () => {
  let useSessionMock: MockInstance;

  beforeEach(() => {
    useSessionMock = vi.spyOn(useSession, 'useSession');
    useSessionMock.mockReturnValue([null, vi.fn()]);
  });

  afterEach(() => {
    useSessionMock.mockRestore();
  });

  it('should render', async () => {
    render(<Header />);
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Search')).toBeInTheDocument();
      expect(screen.getByText('Log in')).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });

  it('should render log out button when logged in', async () => {
    useSessionMock.mockReturnValue([{}, vi.fn()]);

    render(<Header />);
    await waitFor(() => {
      expect(screen.getByText('Log out')).toBeInTheDocument();
    });
  });
});
