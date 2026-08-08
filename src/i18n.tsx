import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'French', nativeName: 'Français', flag: '🇫🇷' },
];

export const translations = {
  en: {
    // Header & Brand
    appTitle: 'CastPilot',
    byCompany: 'by Perp Corp Media',
    tagline: 'Automated Broadcast Operating System',
    authorAndSuite: 'Jesse Lepota & Enterprise Media Suite v2.0',
    versionBadge: 'v2.0 PRO Enterprise',
    streamLabel: 'Stream:',
    primaryServer: 'PRIMARY',
    backupServer: 'BACKUP DR',
    scte35Status: 'SCTE-35:',
    scte35Ready: 'READY',
    broadcastSafe: 'Broadcast Safe',
    alertsCount: 'Alerts',
    selectLanguage: 'Select Language',
    languageName: 'English',
    themeDark: 'Dark Studio',
    themeLight: 'Day Light',

    // Navigation Tabs
    navDashboard: 'Dashboard',
    navScheduler: 'AI Scheduling',
    navPlayout: 'Playout Stream',
    navMam: 'Media Library (MAM)',
    navPrompter: 'Show Scripts & Prompter',
    navEngagement: 'Audience Overlays & Chat',
    navResources: 'Resource Allocator',
    navSyndication: 'Streaming & VOD',
    navSetup: 'Setup & Logins',
    navExport: 'Native Apps & Desktop',
    navManual: 'User Manual & Academy',

    // Dashboard Overview
    dashboardTitle: 'Master Control Station',
    dashboardSubtitle: 'Real-time linear broadcast playout automation and channel health monitoring',
    liveStreamStatus: 'Live Feed Output',
    activeLineup: 'Current Program Matrix',
    nowPlaying: 'Now Playing',
    upNext: 'Up Next',
    totalDuration: 'Total Duration',
    channelHealth: 'Channel Signal Health',
    networkBitrate: 'Target Distribution Bitrate',
    adServerStatus: 'Ad Server Integration',
    monetizationActive: 'Monetization Active',

    // Controls
    failoverToggle: 'Force Manual Failover',
    refreshData: 'Refresh Diagnostics',
    searchPlaceholder: 'Search assets, schedules, or scripts...',
    filterAll: 'All Categories',
    exportReport: 'Export Playout Log',
    
    // Footer
    footerSystem: 'CastPilot Broadcast OS',
    footerCompany: 'Perp Corp Media',
    footerArchitect: 'Architected & Engineered by Jesse Lepota',
    footerRights: 'Perp Corp Media Inc. All broadcast rights reserved worldwide.',
    footerEdition: 'Enterprise Broadcast Operating System • Flagship Edition'
  },
  es: {
    // Header & Brand
    appTitle: 'CastPilot',
    byCompany: 'por Perp Corp Media',
    tagline: 'Sistema Operativo de Emisión Automatizada',
    authorAndSuite: 'Jesse Lepota y Suite Enterprise Media v2.0',
    versionBadge: 'v2.0 PRO Enterprise',
    streamLabel: 'Emisión:',
    primaryServer: 'PRINCIPAL',
    backupServer: 'RESPALDO DR',
    scte35Status: 'SCTE-35:',
    scte35Ready: 'LISTO',
    broadcastSafe: 'Emisión Segura',
    alertsCount: 'Alertas',
    selectLanguage: 'Seleccionar Idioma',
    languageName: 'Español',
    themeDark: 'Estudio Oscuro',
    themeLight: 'Estudio Claro',

    // Navigation Tabs
    navDashboard: 'Panel de Control',
    navScheduler: 'Programación IA',
    navPlayout: 'Transmisión Playout',
    navMam: 'Biblioteca de Medios (MAM)',
    navPrompter: 'Guiones y Teleprónter',
    navEngagement: 'Capas y Chat de Audiencia',
    navResources: 'Asignación de Recursos',
    navSyndication: 'Transmisión y VOD',
    navSetup: 'Configuración y Accesos',
    navExport: 'Apps Nativas y Escritorio',
    navManual: 'Manual de Usuario y Academia',

    // Dashboard Overview
    dashboardTitle: 'Estación de Control Maestro',
    dashboardSubtitle: 'Automatización de emisión lineal e inspección del estado del canal en tiempo real',
    liveStreamStatus: 'Salida de Señal en Vivo',
    activeLineup: 'Matriz de Programación Actual',
    nowPlaying: 'En Transmisión',
    upNext: 'A Continuación',
    totalDuration: 'Duración Total',
    channelHealth: 'Estado de Señal del Canal',
    networkBitrate: 'Tasa de Bits de Distribución',
    adServerStatus: 'Integración de Servidor de Anuncios',
    monetizationActive: 'Monetización Activa',

    // Controls
    failoverToggle: 'Forzar Conmutación Manual',
    refreshData: 'Actualizar Diagnóstico',
    searchPlaceholder: 'Buscar activos, guiones o listas...',
    filterAll: 'Todas las Categorías',
    exportReport: 'Exportar Registro de Emisión',

    // Footer
    footerSystem: 'CastPilot OS de Emisión',
    footerCompany: 'Perp Corp Media',
    footerArchitect: 'Diseñado e Ingeniado por Jesse Lepota',
    footerRights: 'Perp Corp Media Inc. Todos los derechos reservados mundialmente.',
    footerEdition: 'Sistema Operativo de Emisión Empresarial • Edición Insignia'
  },
  fr: {
    // Header & Brand
    appTitle: 'CastPilot',
    byCompany: 'par Perp Corp Media',
    tagline: 'Système d\'Exploitation de Diffusion Automatisée',
    authorAndSuite: 'Jesse Lepota & Suite Media Entreprise v2.0',
    versionBadge: 'v2.0 PRO Enterprise',
    streamLabel: 'Flux:',
    primaryServer: 'PRINCIPAL',
    backupServer: 'SECOURS DR',
    scte35Status: 'SCTE-35:',
    scte35Ready: 'PRÊT',
    broadcastSafe: 'Diffusion Sécurisée',
    alertsCount: 'Alertes',
    selectLanguage: 'Choisir la langue',
    languageName: 'Français',
    themeDark: 'Studio Sombre',
    themeLight: 'Studio Clair',

    // Navigation Tabs
    navDashboard: 'Tableau de bord',
    navScheduler: 'Programmation IA',
    navPlayout: 'Flux Playout',
    navMam: 'Médiathèque (MAM)',
    navPrompter: 'Scripts & Téléprompteur',
    navEngagement: 'Incrustations & Chat',
    navResources: 'Allocation des Ressources',
    navSyndication: 'Streaming & VOD',
    navSetup: 'Configuration & Connexions',
    navExport: 'Apps Natives & Bureau',
    navManual: 'Manuel Utilisateur & Académie',

    // Dashboard Overview
    dashboardTitle: 'Station de Contrôle Principal',
    dashboardSubtitle: 'Automation de diffusion linéaire et surveillance de la santé du canal en temps réel',
    liveStreamStatus: 'Sortie du Flux en Direct',
    activeLineup: 'Grille de Programmation Actuelle',
    nowPlaying: 'En Cours de Diffusion',
    upNext: 'À Suivre',
    totalDuration: 'Durée Totale',
    channelHealth: 'Santé du Signal du Canal',
    networkBitrate: 'Débit de Distribution Cible',
    adServerStatus: 'Intégration Serveur Publicitaire',
    monetizationActive: 'Monétisation Active',

    // Controls
    failoverToggle: 'Basculement Manuel Forcé',
    refreshData: 'Rafraîchir le Diagnostic',
    searchPlaceholder: 'Rechercher des médias, programmes ou scripts...',
    filterAll: 'Toutes les Catégories',
    exportReport: 'Exporter le Journal de Diffusion',

    // Footer
    footerSystem: 'OS de Diffusion CastPilot',
    footerCompany: 'Perp Corp Media',
    footerArchitect: 'Conçu et Développé par Jesse Lepota',
    footerRights: 'Perp Corp Media Inc. Tous droits de diffusion réservés dans le monde entier.',
    footerEdition: 'Système d\'Exploitation de Diffusion Entreprise • Édition Phare'
  }
};

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => translations.en[key] || key
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('castpilot_language') as Language;
    return saved === 'es' || saved === 'fr' ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('castpilot_language', lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
