import { render, screen } from '@testing-library/react';
import PageContainer from '../layout/PageContainer';

describe('PageContainer', () => {
  it('wrappe le contenu avec les classes de mise en page', () => {
    render(
      <PageContainer>
        <span>contenu</span>
      </PageContainer>
    );
    const wrapper = screen.getByText('contenu').parentElement;
    expect(wrapper.className).toMatch(/max-w-6xl/);
    expect(wrapper.className).toMatch(/px-4/);
  });
});
