import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Smart City Complaint Portal header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Smart City Complaint Portal/i);
  expect(headerElement).toBeInTheDocument();
});