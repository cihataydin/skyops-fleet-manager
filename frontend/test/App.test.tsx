import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';
import '@testing-library/jest-dom';

describe('App Component', () => {
  it('renders the Dashboard link in the sidebar', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    const linkElement = screen.getByText(/SkyOps Control/i);
    expect(linkElement).toBeInTheDocument();
  });
});
