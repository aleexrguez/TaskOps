import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { Checklist } from '../Checklist';
import { createMockChecklistItem } from '@/test/factories/checklist.factory';
import type { ReorderChecklistItem } from '../../types/checklist.types';

function createDefaultProps(overrides = {}) {
  return {
    items: [],
    onToggle: vi.fn(),
    onCreate: vi.fn(),
    onDelete: vi.fn(),
    onUpdate: vi.fn(),
    onReorder: vi.fn(),
    ...overrides,
  };
}

const item1 = createMockChecklistItem({
  id: 'item-1',
  title: 'Buy milk',
  isCompleted: false,
  position: 0,
});

const item2 = createMockChecklistItem({
  id: 'item-2',
  title: 'Write tests',
  isCompleted: true,
  position: 1,
});

const item3 = createMockChecklistItem({
  id: 'item-3',
  title: 'Deploy app',
  isCompleted: false,
  position: 2,
});

describe('Checklist', () => {
  describe('rendering', () => {
    it('renders list of items with checkboxes and titles', () => {
      render(<Checklist {...createDefaultProps({ items: [item1, item2] })} />);

      expect(screen.getByText('Buy milk')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', {
          name: /mark "buy milk" as complete/i,
        }),
      ).not.toBeChecked();
      expect(
        screen.getByRole('checkbox', {
          name: /mark "write tests" as incomplete/i,
        }),
      ).toBeChecked();
    });

    it('renders loading skeleton when isLoading is true', () => {
      render(
        <Checklist
          {...createDefaultProps({ items: [item1], isLoading: true })}
        />,
      );

      expect(screen.getByTestId('checklist-skeleton')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('toggle', () => {
    it('calls onToggle with (id, true) when uncompleted item checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <Checklist {...createDefaultProps({ items: [item1], onToggle })} />,
      );

      await user.click(
        screen.getByRole('checkbox', {
          name: /mark "buy milk" as complete/i,
        }),
      );

      expect(onToggle).toHaveBeenCalledWith('item-1', true);
    });

    it('calls onToggle with (id, false) when completed item checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <Checklist {...createDefaultProps({ items: [item2], onToggle })} />,
      );

      await user.click(
        screen.getByRole('checkbox', {
          name: /mark "write tests" as incomplete/i,
        }),
      );

      expect(onToggle).toHaveBeenCalledWith('item-2', false);
    });
  });

  describe('create', () => {
    it('calls onCreate with trimmed title on Enter and clears input', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      render(<Checklist {...createDefaultProps({ onCreate })} />);

      const input = screen.getByLabelText('Add checklist item');
      await user.type(input, '  New item  {Enter}');

      expect(onCreate).toHaveBeenCalledWith('New item');
      expect(input).toHaveValue('');
    });

    it('does not call onCreate when input is empty or whitespace', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      render(<Checklist {...createDefaultProps({ onCreate })} />);

      const input = screen.getByLabelText('Add checklist item');
      await user.type(input, '   {Enter}');

      expect(onCreate).not.toHaveBeenCalled();
    });
  });

  describe('inline edit', () => {
    it('enters edit mode when clicking item title', async () => {
      const user = userEvent.setup();
      render(<Checklist {...createDefaultProps({ items: [item1] })} />);

      await user.click(screen.getByText('Buy milk'));

      expect(screen.getByLabelText('Edit item title')).toHaveValue('Buy milk');
    });

    it('saves via onUpdate on Enter with trimmed title', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(
        <Checklist {...createDefaultProps({ items: [item1], onUpdate })} />,
      );

      await user.click(screen.getByText('Buy milk'));
      const editInput = screen.getByLabelText('Edit item title');
      await user.clear(editInput);
      await user.type(editInput, '  Buy oat milk  {Enter}');

      expect(onUpdate).toHaveBeenCalledWith('item-1', 'Buy oat milk');
      expect(
        screen.queryByLabelText('Edit item title'),
      ).not.toBeInTheDocument();
    });

    it('cancels edit on Escape without calling onUpdate', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(
        <Checklist {...createDefaultProps({ items: [item1], onUpdate })} />,
      );

      await user.click(screen.getByText('Buy milk'));
      const editInput = screen.getByLabelText('Edit item title');
      await user.clear(editInput);
      await user.type(editInput, 'Changed title');
      await user.keyboard('{Escape}');

      expect(onUpdate).not.toHaveBeenCalled();
      expect(
        screen.queryByLabelText('Edit item title'),
      ).not.toBeInTheDocument();
      expect(screen.getByText('Buy milk')).toBeInTheDocument();
    });

    it('saves via onUpdate on blur', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(
        <Checklist {...createDefaultProps({ items: [item1], onUpdate })} />,
      );

      await user.click(screen.getByText('Buy milk'));
      const editInput = screen.getByLabelText('Edit item title');
      await user.clear(editInput);
      await user.type(editInput, 'Buy almond milk');
      await user.tab();

      expect(onUpdate).toHaveBeenCalledWith('item-1', 'Buy almond milk');
    });

    it('does NOT save when Escape is pressed then input loses focus', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(
        <Checklist {...createDefaultProps({ items: [item1], onUpdate })} />,
      );

      await user.click(screen.getByText('Buy milk'));
      await user.keyboard('{Escape}');

      // After Escape, edit mode is exited — no blur handler to fire
      expect(onUpdate).not.toHaveBeenCalled();
    });

    it('does not save empty/whitespace title and exits edit mode', async () => {
      const user = userEvent.setup();
      const onUpdate = vi.fn();
      render(
        <Checklist {...createDefaultProps({ items: [item1], onUpdate })} />,
      );

      await user.click(screen.getByText('Buy milk'));
      const editInput = screen.getByLabelText('Edit item title');
      await user.clear(editInput);
      await user.type(editInput, '   {Enter}');

      expect(onUpdate).not.toHaveBeenCalled();
      expect(
        screen.queryByLabelText('Edit item title'),
      ).not.toBeInTheDocument();
    });
  });

  describe('delete', () => {
    it('calls onDelete with item id when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(
        <Checklist {...createDefaultProps({ items: [item1], onDelete })} />,
      );

      await user.click(
        screen.getByRole('button', { name: /delete "buy milk"/i }),
      );

      expect(onDelete).toHaveBeenCalledWith('item-1');
    });
  });

  describe('reorder', () => {
    it('calls onReorder with swapped positions when moving item up', async () => {
      const user = userEvent.setup();
      const onReorder = vi.fn();
      render(
        <Checklist
          {...createDefaultProps({ items: [item1, item2, item3], onReorder })}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: /move "write tests" up/i }),
      );

      expect(onReorder).toHaveBeenCalledWith([
        { id: 'item-2', position: 0 },
        { id: 'item-1', position: 1 },
      ] satisfies ReorderChecklistItem[]);
    });

    it('calls onReorder with swapped positions when moving item down', async () => {
      const user = userEvent.setup();
      const onReorder = vi.fn();
      render(
        <Checklist
          {...createDefaultProps({ items: [item1, item2, item3], onReorder })}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: /move "buy milk" down/i }),
      );

      expect(onReorder).toHaveBeenCalledWith([
        { id: 'item-1', position: 1 },
        { id: 'item-2', position: 0 },
      ] satisfies ReorderChecklistItem[]);
    });

    it('disables move up on first item', () => {
      render(<Checklist {...createDefaultProps({ items: [item1, item2] })} />);

      expect(
        screen.getByRole('button', { name: /move "buy milk" up/i }),
      ).toBeDisabled();
    });

    it('disables move down on last item', () => {
      render(<Checklist {...createDefaultProps({ items: [item1, item2] })} />);

      expect(
        screen.getByRole('button', { name: /move "write tests" down/i }),
      ).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('has role="list" on the container', () => {
      render(<Checklist {...createDefaultProps({ items: [item1] })} />);
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('has role="listitem" on each item', () => {
      render(<Checklist {...createDefaultProps({ items: [item1, item2] })} />);
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('checkboxes have aria-label with item title', () => {
      render(<Checklist {...createDefaultProps({ items: [item1] })} />);
      expect(
        screen.getByRole('checkbox', {
          name: /mark "buy milk" as complete/i,
        }),
      ).toBeInTheDocument();
    });

    it('delete and reorder buttons have descriptive aria-labels', () => {
      render(<Checklist {...createDefaultProps({ items: [item1] })} />);

      expect(
        screen.getByRole('button', { name: /delete "buy milk"/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /move "buy milk" up/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /move "buy milk" down/i }),
      ).toBeInTheDocument();
    });
  });
});
