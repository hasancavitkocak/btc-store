import EmailTemplateForm from '@/views/admin/EmailTemplateForm';

interface Props {
  params: {
    code: string;
  };
}

export default function EditEmailTemplatePage({ params }: Props) {
  return <EmailTemplateForm templateCode={params.code} />;
}
