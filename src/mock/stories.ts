export interface Story {
  id: string;
  titleKey: string;
  company: string;
  industry: string;
  image?: string;
  videoUrl?: string;
  contentKey: string;
  htmlContent: string;
  order: number;
  active: boolean;
}

export const stories: Story[] = [
  {
    id: '1',
    titleKey: 'story.techcorp.title',
    company: 'TechCorp',
    industry: 'Technology',
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    contentKey: 'story.techcorp.content',
    htmlContent: `
      <h2>How TechCorp Increased Sales by 150%</h2>
      <p>TechCorp, a leading technology solutions provider, transformed their sales operations using our CRM Pro platform.</p>
      <blockquote>
        "The CRM system helped us streamline our entire sales process. We can now handle 3x more customers with the same team."
        <cite>- John Smith, CEO of TechCorp</cite>
      </blockquote>
      <h3>Results</h3>
      <ul>
        <li>150% increase in sales</li>
        <li>40% reduction in response time</li>
        <li>95% customer satisfaction rate</li>
      </ul>
    `,
    order: 1,
    active: true
  },
  {
    id: '2',
    titleKey: 'story.globalsoft.title',
    company: 'GlobalSoft',
    industry: 'Software',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    contentKey: 'story.globalsoft.content',
    htmlContent: `
      <h2>GlobalSoft Streamlines HR Operations</h2>
      <p>GlobalSoft automated their HR processes and saved 20 hours per week in administrative tasks.</p>
      <blockquote>
        "The HR Manager system gave us back valuable time to focus on strategic initiatives."
        <cite>- Sarah Johnson, HR Director</cite>
      </blockquote>
      <h3>Key Benefits</h3>
      <ul>
        <li>20 hours saved per week</li>
        <li>100% paperless processes</li>
        <li>Employee satisfaction up 35%</li>
      </ul>
    `,
    order: 2,
    active: true
  },
  {
    id: '3',
    titleKey: 'story.innovatelab.title',
    company: 'InnovateLab',
    industry: 'Research',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    contentKey: 'story.innovatelab.content',
    htmlContent: `
      <h2>InnovateLab Scales Marketing Efforts</h2>
      <p>Watch how InnovateLab used our Marketing Hub to scale their campaigns and reach 10x more customers.</p>
      <h3>Achievements</h3>
      <ul>
        <li>10x audience reach</li>
        <li>60% cost reduction</li>
        <li>5x campaign ROI</li>
      </ul>
    `,
    order: 3,
    active: true
  }
];
