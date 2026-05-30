import { useTranslation } from 'react-i18next';
import { useSubmitFeedback } from '../hooks/use-submit-feedback';
import { useToastStore } from '@/shared/store/toast.store';
import { trackEvent } from '@/shared/analytics';
import { FeedbackSection } from '../components/FeedbackSection';
import type { SubmitFeedbackInput } from '../types/feedback.types';

export function FeedbackSectionContainer() {
  const { t } = useTranslation('landing');
  const addToast = useToastStore((s) => s.addToast);
  const { mutate, isPending, isSuccess } = useSubmitFeedback();

  function handleSubmit(data: SubmitFeedbackInput): void {
    mutate(data, {
      onSuccess: () => {
        addToast(t('feedback.toast.success'), 'success');
        trackEvent('feedback_submitted', { category: data.category });
      },
      onError: () => {
        addToast(t('feedback.toast.error'), 'error');
      },
    });
  }

  return (
    <FeedbackSection
      onSubmit={handleSubmit}
      isPending={isPending}
      isSuccess={isSuccess}
    />
  );
}
