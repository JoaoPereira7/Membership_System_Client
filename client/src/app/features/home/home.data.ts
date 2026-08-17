import {
  FamilyValue,
  InstitutionalMoment,
  QuadrangularPillar,
  SystemShortcut,
} from './models/home.models';

export const HISTORY_ITEMS: readonly InstitutionalMoment[] = [
  {
    title: '1923',
    description: 'Início do Movimento',
    icon: 'auto_awesome',
    tone: 'red',
  },
  {
    title: '1951',
    description: 'Chega ao Brasil',
    icon: 'public',
    tone: 'yellow',
  },
  {
    title: '1953',
    description: 'Reconhecimento Oficial',
    icon: 'verified',
    tone: 'blue',
  },
  {
    title: 'Hoje',
    description: 'Um legado que continua',
    icon: 'history_edu',
    tone: 'purple',
  },
];

export const MORADA_NOVA_ITEMS: readonly InstitutionalMoment[] = [
  {
    title: 'Fundação',
    description: 'Anos atrás, um pequeno grupo com um grande propósito.',
    icon: 'diversity_1',
    tone: 'red',
  },
  {
    title: 'Crescimento',
    description: 'Vidas alcançadas, famílias restauradas e novos líderes.',
    icon: 'trending_up',
    tone: 'yellow',
  },
  {
    title: 'Hoje',
    description: 'Uma igreja forte, relevante e comprometida com o Reino de Deus.',
    icon: 'church',
    tone: 'blue',
  },
];

export const QUADRANGULAR_PILLARS: readonly QuadrangularPillar[] = [
  {
    title: 'SALVA',
    description: 'Jesus salva o pecador e dá vida eterna.',
    image: '/images/home/four-gospels/salva.png',
    imageAlt: 'Salva: Jesus salva o pecador e dá vida eterna.',
    tone: 'red',
  },
  {
    title: 'BATIZA',
    description: 'Jesus batiza com o Espírito Santo.',
    image: '/images/home/four-gospels/batiza.png',
    imageAlt: 'Batiza: Jesus batiza com o Espírito Santo.',
    tone: 'yellow',
  },
  {
    title: 'CURA',
    description: 'Jesus cura o doente e restaura vidas.',
    image: '/images/home/four-gospels/cura.png',
    imageAlt: 'Cura: Jesus cura o doente e restaura vidas.',
    tone: 'blue',
  },
  {
    title: 'VOLTARÁ',
    description: 'Jesus voltará como Rei e buscará a Sua Igreja.',
    image: '/images/home/four-gospels/voltara.png',
    imageAlt: 'Voltará: Jesus voltará como Rei e buscará a Sua Igreja.',
    tone: 'purple',
  },
];

export const FAMILY_VALUES: readonly FamilyValue[] = [
  { title: 'Família', description: 'Acolhimento e Amor', icon: 'family_restroom' },
  { title: 'Comunhão', description: 'Unidade e Amizade', icon: 'diversity_1' },
  { title: 'Propósito', description: 'Servir e Transformar', icon: 'volunteer_activism' },
];

export const SYSTEM_SHORTCUTS: readonly SystemShortcut[] = [
  {
    title: 'Membros',
    description: 'Gestão completa dos membros da igreja.',
    icon: 'groups',
    route: '/members',
    permission: 'MEMBER_VIEW',
    tone: 'blue',
  },
  {
    title: 'Igrejas',
    description: 'Organize e acompanhe nossas congregações.',
    icon: 'church',
    route: '/organization/churches',
    permission: 'CHURCH_VIEW',
    tone: 'teal',
  },
  {
    title: 'Departamentos',
    description: 'Estruture ministérios e departamentos.',
    icon: 'diversity_3',
    route: '/organization/departments',
    permission: 'DEPARTMENT_VIEW',
    tone: 'yellow',
  },
  {
    title: 'Lideranças',
    description: 'Apoie e desenvolva nossos líderes.',
    icon: 'record_voice_over',
    route: '/auxiliary-data/leader-types',
    permission: 'LEADER_TYPE_VIEW',
    tone: 'purple',
  },
];
