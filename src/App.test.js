import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the task dashboard', () => {
  render(<App />);
  expect(screen.getByText('Tasklist')).toBeInTheDocument();
  expect(screen.getByLabelText('New task name')).toBeInTheDocument();
  expect(screen.getAllByText('New Projects').length).toBeGreaterThan(0);
});
