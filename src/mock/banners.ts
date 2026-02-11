export interface Banner {
  id: string;
  titleKey: string;
  subtitleKey: string;
  buttonTextKey?: string;
  buttonLink?: string;
  image: string;
  order: number;
  active: boolean;
}

export const banners: Banner[] = [
  {
    id: '1',
    titleKey: 'banner.hero.title',
    subtitleKey: 'banner.hero.subtitle',
    buttonTextKey: 'banner.hero.button',
    buttonLink: '/products',
    image: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1920',
    order: 1,
    active: true
  },
  {
    id: '2',
    titleKey: 'banner.secondary.title',
    subtitleKey: 'banner.secondary.subtitle',
    buttonTextKey: 'banner.secondary.button',
    buttonLink: '/stories',
    image: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1920',
    order: 2,
    active: true
  }
];
