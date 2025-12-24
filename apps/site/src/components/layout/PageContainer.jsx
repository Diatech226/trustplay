export default function PageContainer({ children, as: Component = 'div', className = '' }) {
  return (
    <Component className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </Component>
  );
}
