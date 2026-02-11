interface RichContentRendererProps {
  htmlContent: string;
}

export default function RichContentRenderer({ htmlContent }: RichContentRendererProps) {
  return (
    <div
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        lineHeight: '1.75',
      }}
    />
  );
}
