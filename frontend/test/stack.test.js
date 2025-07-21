describe("stack", () => {
  let stack;
  beforeEach(() => {
    stack = [];
  });
  it("should popitems", () => {
    stack.push(1);
    stack.push(2);
    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
  });
  it("should pushitems", () => {
    const stack = [];
    stack.push(1);
    stack.push(2);
  });
});
