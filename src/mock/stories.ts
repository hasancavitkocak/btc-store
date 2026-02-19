export interface Story {
  id: string;
  title: { tr: string; en: string; de: string; fr: string; es: string; it: string };
  company: string;
  industry: string;
  image?: string;
  videoUrl?: string;
  htmlContent: { tr: string; en: string; de: string; fr: string; es: string; it: string };
  results?: string[];
  order: number;
  active: boolean;
}

export const stories: Story[] = [
  {
    id: '1',
    title: {
      tr: 'TechCorp Satışlarını %150 Artırdı',
      en: 'How TechCorp Increased Sales by 150%',
      de: 'Wie TechCorp den Umsatz um 150% steigerte',
      fr: 'Comment TechCorp a augmenté ses ventes de 150%',
      es: 'Cómo TechCorp aumentó las ventas en un 150%',
      it: 'Come TechCorp ha aumentato le vendite del 150%'
    },
    company: 'TechCorp',
    industry: 'Technology',
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    htmlContent: {
      tr: `
        <h2>TechCorp Satışlarını %150 Artırdı</h2>
        <p>TechCorp, önde gelen bir teknoloji çözümleri sağlayıcısı, CRM Pro platformumuzu kullanarak satış operasyonlarını dönüştürdü.</p>
        <blockquote>
          "CRM sistemi tüm satış sürecimizi kolaylaştırmamıza yardımcı oldu. Artık aynı ekiple 3 kat daha fazla müşteriyle ilgilenebiliyoruz."
          <cite>- John Smith, TechCorp CEO</cite>
        </blockquote>
        <h3>Sonuçlar</h3>
        <ul>
          <li>Satışlarda %150 artış</li>
          <li>Yanıt süresinde %40 azalma</li>
          <li>%95 müşteri memnuniyeti oranı</li>
        </ul>
      `,
      en: `
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
      de: `
        <h2>Wie TechCorp den Umsatz um 150% steigerte</h2>
        <p>TechCorp, ein führender Anbieter von Technologielösungen, hat seine Vertriebsabläufe mit unserer CRM Pro-Plattform transformiert.</p>
        <blockquote>
          "Das CRM-System hat uns geholfen, unseren gesamten Verkaufsprozess zu optimieren. Wir können jetzt mit demselben Team dreimal mehr Kunden betreuen."
          <cite>- John Smith, CEO von TechCorp</cite>
        </blockquote>
        <h3>Ergebnisse</h3>
        <ul>
          <li>150% Umsatzsteigerung</li>
          <li>40% Reduzierung der Reaktionszeit</li>
          <li>95% Kundenzufriedenheitsrate</li>
        </ul>
      `,
      fr: `
        <h2>Comment TechCorp a augmenté ses ventes de 150%</h2>
        <p>TechCorp, un fournisseur leader de solutions technologiques, a transformé ses opérations de vente en utilisant notre plateforme CRM Pro.</p>
        <blockquote>
          "Le système CRM nous a aidés à rationaliser l'ensemble de notre processus de vente. Nous pouvons maintenant gérer 3 fois plus de clients avec la même équipe."
          <cite>- John Smith, PDG de TechCorp</cite>
        </blockquote>
        <h3>Résultats</h3>
        <ul>
          <li>Augmentation de 150% des ventes</li>
          <li>Réduction de 40% du temps de réponse</li>
          <li>Taux de satisfaction client de 95%</li>
        </ul>
      `,
      es: `
        <h2>Cómo TechCorp aumentó las ventas en un 150%</h2>
        <p>TechCorp, un proveedor líder de soluciones tecnológicas, transformó sus operaciones de ventas utilizando nuestra plataforma CRM Pro.</p>
        <blockquote>
          "El sistema CRM nos ayudó a optimizar todo nuestro proceso de ventas. Ahora podemos atender a 3 veces más clientes con el mismo equipo."
          <cite>- John Smith, CEO de TechCorp</cite>
        </blockquote>
        <h3>Resultados</h3>
        <ul>
          <li>Aumento del 150% en ventas</li>
          <li>Reducción del 40% en tiempo de respuesta</li>
          <li>Tasa de satisfacción del cliente del 95%</li>
        </ul>
      `,
      it: `
        <h2>Come TechCorp ha aumentato le vendite del 150%</h2>
        <p>TechCorp, un fornitore leader di soluzioni tecnologiche, ha trasformato le sue operazioni di vendita utilizzando la nostra piattaforma CRM Pro.</p>
        <blockquote>
          "Il sistema CRM ci ha aiutato a semplificare l'intero processo di vendita. Ora possiamo gestire 3 volte più clienti con lo stesso team."
          <cite>- John Smith, CEO di TechCorp</cite>
        </blockquote>
        <h3>Risultati</h3>
        <ul>
          <li>Aumento del 150% delle vendite</li>
          <li>Riduzione del 40% del tempo di risposta</li>
          <li>Tasso di soddisfazione del cliente del 95%</li>
        </ul>
      `
    },
    order: 1,
    active: true
  },
  {
    id: '2',
    title: {
      tr: 'GlobalSoft İK Operasyonlarını Kolaylaştırdı',
      en: 'GlobalSoft Streamlines HR Operations',
      de: 'GlobalSoft optimiert HR-Abläufe',
      fr: 'GlobalSoft rationalise les opérations RH',
      es: 'GlobalSoft optimiza las operaciones de RRHH',
      it: 'GlobalSoft semplifica le operazioni HR'
    },
    company: 'GlobalSoft',
    industry: 'Software',
    image: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    htmlContent: {
      tr: '<h2>GlobalSoft İK Operasyonlarını Kolaylaştırdı</h2><p>GlobalSoft, İK süreçlerini otomatikleştirdi ve haftada 20 saat idari görevlerden tasarruf etti.</p>',
      en: '<h2>GlobalSoft Streamlines HR Operations</h2><p>GlobalSoft automated their HR processes and saved 20 hours per week in administrative tasks.</p>',
      de: '<h2>GlobalSoft optimiert HR-Abläufe</h2><p>GlobalSoft automatisierte ihre HR-Prozesse und sparte 20 Stunden pro Woche bei Verwaltungsaufgaben.</p>',
      fr: '<h2>GlobalSoft rationalise les opérations RH</h2><p>GlobalSoft a automatisé ses processus RH et économisé 20 heures par semaine en tâches administratives.</p>',
      es: '<h2>GlobalSoft optimiza las operaciones de RRHH</h2><p>GlobalSoft automatizó sus procesos de RRHH y ahorró 20 horas por semana en tareas administrativas.</p>',
      it: '<h2>GlobalSoft semplifica le operazioni HR</h2><p>GlobalSoft ha automatizzato i processi HR e risparmiato 20 ore a settimana in attività amministrative.</p>'
    },
    order: 2,
    active: true
  },
  {
    id: '3',
    title: {
      tr: 'InnovateLab Pazarlama Çalışmalarını Ölçeklendirdi',
      en: 'InnovateLab Scales Marketing Efforts',
      de: 'InnovateLab skaliert Marketingbemühungen',
      fr: 'InnovateLab développe ses efforts marketing',
      es: 'InnovateLab escala los esfuerzos de marketing',
      it: 'InnovateLab scala gli sforzi di marketing'
    },
    company: 'InnovateLab',
    industry: 'Research',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    htmlContent: {
      tr: '<h2>InnovateLab Pazarlama Çalışmalarını Ölçeklendirdi</h2><p>InnovateLab, Marketing Hub\'ımızı kullanarak kampanyalarını ölçeklendirdi ve 10 kat daha fazla müşteriye ulaştı.</p>',
      en: '<h2>InnovateLab Scales Marketing Efforts</h2><p>Watch how InnovateLab used our Marketing Hub to scale their campaigns and reach 10x more customers.</p>',
      de: '<h2>InnovateLab skaliert Marketingbemühungen</h2><p>Sehen Sie, wie InnovateLab unseren Marketing Hub nutzte, um ihre Kampagnen zu skalieren und 10x mehr Kunden zu erreichen.</p>',
      fr: '<h2>InnovateLab développe ses efforts marketing</h2><p>Découvrez comment InnovateLab a utilisé notre Marketing Hub pour développer ses campagnes et atteindre 10 fois plus de clients.</p>',
      es: '<h2>InnovateLab escala los esfuerzos de marketing</h2><p>Vea cómo InnovateLab utilizó nuestro Marketing Hub para escalar sus campañas y llegar a 10 veces más clientes.</p>',
      it: '<h2>InnovateLab scala gli sforzi di marketing</h2><p>Guarda come InnovateLab ha utilizzato il nostro Marketing Hub per scalare le campagne e raggiungere 10 volte più clienti.</p>'
    },
    order: 3,
    active: true
  }
];
