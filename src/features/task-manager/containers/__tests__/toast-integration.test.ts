import { useToastStore } from '../../store/toast.store';

describe('Toast integration', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('can add a success toast for task creation', () => {
    const { addToast } = useToastStore.getState();

    addToast('Task created', 'success');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Task created');
    expect(toasts[0].type).toBe('success');
  });

  it('can add a success toast for task update', () => {
    const { addToast } = useToastStore.getState();

    addToast('Task updated', 'success');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Task updated');
    expect(toasts[0].type).toBe('success');
  });

  it('can add a success toast for task deletion', () => {
    const { addToast } = useToastStore.getState();

    addToast('Task deleted', 'success');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Task deleted');
    expect(toasts[0].type).toBe('success');
  });

  it('can add an error toast for failed operations', () => {
    const { addToast } = useToastStore.getState();

    addToast('Failed to create task', 'error');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Failed to create task');
    expect(toasts[0].type).toBe('error');
  });
});
