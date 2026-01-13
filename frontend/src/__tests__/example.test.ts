describe('Frontend Example Test', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });

  it('should verify string matching', () => {
    const message = 'Hello, World!';
    expect(message).toContain('Hello');
  });
});
