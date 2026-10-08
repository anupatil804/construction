import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the home page and shared navigation', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /made for living/i })).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
});

test('navigates between the individual pages', () => {
  render(<App />);

  fireEvent.click(screen.getByRole('link', { name: 'About us' }));
  expect(screen.getByRole('heading', { name: /we build places to belong/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Services' }));
  expect(screen.getByRole('heading', { name: /good work, from the ground up/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Properties' }));
  expect(screen.getByRole('heading', { name: /good homes.*good beginnings/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Contact', exact: true }));
  expect(screen.getByRole('heading', { name: /tell us what you’re dreaming up/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: 'Feedback' }));
  expect(screen.getByRole('heading', { name: /good work is better together/i })).toBeInTheDocument();
});

test('filters the property collection by new homes', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: 'Properties' }));
  fireEvent.click(screen.getByRole('button', { name: 'New homes' }));

  expect(screen.getAllByRole('link', { name: /enquire about this home/i })).toHaveLength(2);
  expect(screen.queryByRole('heading', { name: 'The Willow House' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Cedar Ridge' })).toBeInTheDocument();
});

test('allows visitors to select and submit a feedback rating', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: 'Feedback' }));
  fireEvent.click(screen.getByRole('button', { name: '5 stars' }));
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Jordan Lee' } });
  fireEvent.change(screen.getByLabelText('Your feedback'), { target: { value: 'A thoughtful, lovely experience.' } });
  fireEvent.click(screen.getByRole('button', { name: /share your feedback/i }));

  expect(screen.getByRole('status')).toHaveTextContent(/thank you/i);
});
