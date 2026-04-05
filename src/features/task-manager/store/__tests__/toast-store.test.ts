import { useToastStore } from '../toast.store';

describe('useToastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('starts with an empty toasts array', () => {
    const { toasts } = useToastStore.getState();

    expect(toasts).toEqual([]);
  });

  it('adds a toast with correct message and type', () => {
    const { addToast } = useToastStore.getState();

    addToast('Task created', 'success');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Task created');
    expect(toasts[0].type).toBe('success');
  });

  it('generates a unique id for each toast', () => {
    const { addToast } = useToastStore.getState();

    const firstId = addToast('First toast', 'info');
    const secondId = addToast('Second toast', 'info');

    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
  });

  it('adds multiple toasts and stacks them in order', () => {
    const { addToast } = useToastStore.getState();

    addToast('First', 'info');
    addToast('Second', 'success');
    addToast('Third', 'error');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(3);
    expect(toasts[0].message).toBe('First');
    expect(toasts[1].message).toBe('Second');
    expect(toasts[2].message).toBe('Third');
  });

  it('removes a specific toast by id', () => {
    const { addToast } = useToastStore.getState();

    const idToRemove = addToast('Remove me', 'error');
    addToast('Keep me', 'success');

    useToastStore.getState().removeToast(idToRemove);

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Keep me');
  });

  it('does nothing when removing a non-existent id', () => {
    const { addToast, removeToast } = useToastStore.getState();

    addToast('Existing toast', 'info');
    removeToast('non-existent-id-xyz');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
  });

  it('clears all toasts at once', () => {
    const { addToast } = useToastStore.getState();

    addToast('Toast one', 'success');
    addToast('Toast two', 'error');
    addToast('Toast three', 'info');

    useToastStore.getState().clearAll();

    const { toasts } = useToastStore.getState();
    expect(toasts).toEqual([]);
  });

  it('supports success, error, and info types', () => {
    const { addToast } = useToastStore.getState();

    addToast('Success message', 'success');
    addToast('Error message', 'error');
    addToast('Info message', 'info');

    const { toasts } = useToastStore.getState();
    expect(toasts[0].type).toBe('success');
    expect(toasts[1].type).toBe('error');
    expect(toasts[2].type).toBe('info');
  });
});
