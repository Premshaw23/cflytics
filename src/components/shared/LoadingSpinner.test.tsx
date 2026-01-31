import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders without crashing', () => {
        const { container } = render(<LoadingSpinner />);
        expect(container).toBeInTheDocument();
    });

    it('displays the label when provided', () => {
        render(<LoadingSpinner label="Loading data..." />);
        expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<LoadingSpinner className="custom-class" />);
        // The first child is the div wrapper
        expect(container.firstChild).toHaveClass('custom-class');
    });
});
