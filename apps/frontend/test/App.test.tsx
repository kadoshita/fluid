import { screen, render, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('should render', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('App')).toBeInTheDocument();
    });
  });
});
