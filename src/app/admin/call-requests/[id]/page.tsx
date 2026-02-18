import CallRequestDetail from '@/views/admin/CallRequestDetail';

interface Props {
  params: {
    id: string;
  };
}

export default function CallRequestDetailPage({ params }: Props) {
  return <CallRequestDetail requestId={parseInt(params.id)} />;
}
