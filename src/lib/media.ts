// Centralized imagery (Unsplash, non-expiring) + Gooday mock data.
// Community names & microcopy sourced from the product briefing.

const u = (id: string, w = 900, h?: number) =>
  `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=${w}${
    h ? `&h=${h}` : ''
  }`

export const avatar = (id: string) => u(id, 160, 160)

/** Portrait pool for avatars. */
export const faces = {
  bruna: avatar('1494790108377-be9c29b29330'),
  marcos: avatar('1500648767791-00dcc994a43e'),
  jake: avatar('1580489944761-15a19d654956'),
  joseph: avatar('1507003211169-0a1dd7228f2d'),
  troy: avatar('1701096351544-7de3c7fa0272'),
  zoran: avatar('1651684215020-f7a5b6610f23'),
  jorik: avatar('1604072366595-e75dc92d6bdc'),
  studio: avatar('1589729132389-8f0e0b55b91e'),
  diego: avatar('1568602471122-7832951cc4c5'),
  fernanda: avatar('1438761681033-6461ffad8d80'),
  gabriel: avatar('1506794778202-cad84cf45f1d'),
  helena: avatar('1544005313-94ddf0286df2'),
  otavio: avatar('1519085360753-af0119f7cbe7'),
  patricia: avatar('1487412720507-e7ab37603c6f'),
}

export const photo = {
  saladBowl: u('1512621776951-a57141f2eefd'),
  saladClose: u('1540420773420-3366772f4999'),
  blueBowl: u('1623428187969-5da2dcea5ebf'),
  trailRun: u('1530143311094-34d807799e8f'),
  running: u('1498581444814-7e44d2fbe0e2'),
  runningEdge: u('1504025468847-0e438279542c'),
  hiking: u('1533240332313-0db49b459ad6'),
  cycling: u('1606224547099-b15c94ca5ef2'),
  cycling2: u('1615845522846-02f89af04c2e'),
  smoothie: u('1610970881699-44a5587cabec', 1080),
  shakes: u('1522924280870-56438a558308'),
  yoga: u('1544367567-0f2fcb009e0b'),
  cafeWoman: u('1533777857889-4be7c70b33f7', 1200, 1400),
  fruitsWoman: u('1511226616573-0937ad7da1d8', 1200, 1400),
  // Unsplash extras for story carousel
  wellnessWoman: 'https://images.unsplash.com/photo-1518708909080-704599b19972?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=700',
  stretchWoman: 'https://images.unsplash.com/photo-1567013514336-6de53c9e7e63?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=700',
  runnerWoman: 'https://images.unsplash.com/photo-1480179087180-d9f0ec044897?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=700',
  mealPrep: 'https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=700',
  yogaMeditation: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=700',
  mountainSit: 'https://images.unsplash.com/photo-1522075782449-e45a34f1ddfb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=700',
  sprintTrack: 'https://images.unsplash.com/photo-1744060204728-f68e434a3edf?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=700',
  pinkTank: 'https://images.unsplash.com/photo-1759476530066-94bee6a30c40?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=700',
  orangeSlice: 'https://images.unsplash.com/photo-1606858374191-c18040e98ad7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=400&h=700',
  swimming: u('1530549387789-4c1017266635'),
  meditation: u('1506126613408-eca07ce68773'),
  climbing: u('1522163186145-024defcf126d'),
  pilates: u('1518611012118-696072aa579a'),
  veganBowl: u('1512621776951-a57141f2eefd'),
  morningWalk: u('1476480862126-209faa2f0b4e'),
}

export const currentUser = {
  name: 'Marcos Vinícius',
  handle: '@marcos_v',
  avatar: faces.marcos,
}

export type Story = { name: string; avatar: string; cover: string; seen?: boolean }
export const stories: Story[] = [
  { name: 'Você', avatar: currentUser.avatar, cover: photo.saladBowl, seen: false },
  { name: 'bruna_carla', avatar: faces.bruna, cover: photo.wellnessWoman, seen: true },
  { name: 'lu_trails', avatar: faces.studio, cover: photo.mountainSit, seen: true },
  { name: 'pedro.run', avatar: faces.joseph, cover: photo.sprintTrack, seen: false },
  { name: 'ana_move', avatar: faces.troy, cover: photo.pinkTank, seen: false },
  { name: 'ciclo_urb', avatar: faces.zoran, cover: photo.cycling, seen: true },
  { name: 'joana.k', avatar: faces.jorik, cover: photo.runnerWoman, seen: false },
  { name: 'rafa_fit', avatar: faces.jake, cover: photo.stretchWoman, seen: true },
  { name: 'mind_zen', avatar: faces.bruna, cover: photo.yogaMeditation, seen: false },
  { name: 'verdevida', avatar: faces.studio, cover: photo.mealPrep, seen: false },
  { name: 'carol.fit', avatar: faces.troy, cover: photo.orangeSlice, seen: true },
  { name: 'bike_sp', avatar: faces.zoran, cover: photo.cycling2, seen: false },
  { name: 'hiking_br', avatar: faces.jake, cover: photo.hiking, seen: true },
  { name: 'natfit', avatar: faces.joseph, cover: photo.trailRun, seen: false },
]

export type Group = {
  id: string
  name: string
  cover: string
  groups: number
  members: string
  members_avatars: string[]
}
export const groups: Group[] = [
  {
    id: 'corrida',
    name: 'Corrida para Iniciantes',
    cover: photo.running,
    groups: 18,
    members: '512 membros',
    members_avatars: [faces.joseph, faces.troy, faces.jake],
  },
  {
    id: 'ciclismo',
    name: 'Ciclismo Urbano',
    cover: photo.cycling,
    groups: 43,
    members: '975 membros',
    members_avatars: [faces.zoran, faces.jorik, faces.marcos],
  },
  {
    id: 'nutricao',
    name: 'Nutrição Consciente',
    cover: photo.saladBowl,
    groups: 15,
    members: '396 membros',
    members_avatars: [faces.bruna, faces.studio, faces.troy],
  },
  {
    id: 'vida',
    name: 'Vida Natural',
    cover: photo.saladClose,
    groups: 11,
    members: '304 membros',
    members_avatars: [faces.jorik, faces.jake, faces.bruna],
  },
  {
    id: 'yoga',
    name: 'Yoga & Respiração',
    cover: photo.yoga,
    groups: 9,
    members: '221 membros',
    members_avatars: [faces.bruna, faces.troy],
  },
  {
    id: 'pedal',
    name: 'Pedal de Fim de Semana',
    cover: photo.cycling2,
    groups: 27,
    members: '640 membros',
    members_avatars: [faces.zoran, faces.joseph, faces.marcos],
  },
  {
    id: 'natacao',
    name: 'Natação & Águas Abertas',
    cover: photo.swimming,
    groups: 8,
    members: '287 membros',
    members_avatars: [faces.gabriel, faces.helena, faces.diego],
  },
  {
    id: 'meditacao',
    name: 'Meditação Guiada',
    cover: photo.meditation,
    groups: 5,
    members: '412 membros',
    members_avatars: [faces.helena, faces.fernanda, faces.patricia],
  },
  {
    id: 'escalada',
    name: 'Escalada Indoor',
    cover: photo.climbing,
    groups: 6,
    members: '198 membros',
    members_avatars: [faces.otavio, faces.diego, faces.gabriel],
  },
  {
    id: 'pilates_mat',
    name: 'Pilates Mat',
    cover: photo.pilates,
    groups: 4,
    members: '356 membros',
    members_avatars: [faces.fernanda, faces.helena, faces.bruna],
  },
]

export type Contact = {
  id: string
  name: string
  handle: string
  avatar: string
  online?: boolean
  interests?: number
}

export const contacts: Contact[] = [
  { id: 'renata', name: 'Renata Silva', handle: '@renata_silva', avatar: '/assets/0b179.png', online: true, interests: 3 },
  { id: 'tiago', name: 'Tiago Souza', handle: '@tiago_souza', avatar: '/assets/4b35d.png', online: false, interests: 3 },
  { id: 'nicole', name: 'Nicole Bueno', handle: '@nicole_bueno', avatar: '/assets/7c77a.png', online: false, interests: 3 },
  { id: 'bruno', name: 'Bruno Mendes', handle: '@bruno_mendes', avatar: '/assets/2f96e.png', online: false, interests: 3 },
  { id: 'julia', name: 'Júlia Andrade', handle: '@julia_andrade', avatar: '/assets/a35b8.png', online: true, interests: 3 },
  { id: 'lidiane', name: 'Lidiane Costa', handle: '@lidiane_costa', avatar: '/assets/988ee.png', online: false, interests: 3 },
  { id: 'camila', name: 'Camila Ferreira', handle: '@camila_ferreira', avatar: avatar('1526080652727-5b77f74eacd2'), online: false, interests: 3 },
  { id: 'marina', name: 'Marina Rocha', handle: '@marina_rocha', avatar: avatar('1701096351544-7de3c7fa0272'), online: true, interests: 3 },
  { id: 'diego', name: 'Diego Alves', handle: '@diego_run', avatar: faces.diego, online: true, interests: 4 },
  { id: 'fernanda', name: 'Fernanda Oliveira', handle: '@fe_oliveira', avatar: faces.fernanda, online: false, interests: 5 },
  { id: 'gabriel', name: 'Gabriel Nunes', handle: '@gab_nunes', avatar: faces.gabriel, online: true, interests: 3 },
  { id: 'helena', name: 'Helena Souza', handle: '@helena_souza', avatar: faces.helena, online: false, interests: 4 },
  { id: 'otavio', name: 'Otávio Reis', handle: '@otavio_reis', avatar: faces.otavio, online: true, interests: 2 },
  { id: 'patricia', name: 'Patricia Lima', handle: '@pati_lima', avatar: faces.patricia, online: false, interests: 6 },
]

export type Conversation = {
  contactId: string
  lastMessage: string
  time: string
  unread?: number
  fromMe: boolean
}

export const conversations: Conversation[] = [
  { contactId: 'diego', lastMessage: 'Pista às 6h. Leva o relógio!', time: '12:04', unread: 1, fromMe: false },
  { contactId: 'renata', lastMessage: 'Combinado então 💪', time: '08:16', unread: 2, fromMe: false },
  { contactId: 'fernanda', lastMessage: 'Aula de pilates amanhã às 19h', time: '10:42', unread: 2, fromMe: false },
  { contactId: 'tiago', lastMessage: 'Monstro! Bora domingo?', time: '07:02', fromMe: true },
  { contactId: 'gabriel', lastMessage: 'Água gelada hoje, bora nadar?', time: '09:18', unread: 1, fromMe: false },
  { contactId: 'nicole', lastMessage: 'Recebi, obrigada 🌱', time: 'ter', unread: 1, fromMe: true },
  { contactId: 'helena', lastMessage: 'Sessão de meditação às 7h', time: 'qua', fromMe: false },
  { contactId: 'bruno', lastMessage: '7h no ponto de sempre', time: 'seg', fromMe: false },
  { contactId: 'julia', lastMessage: 'Vamos treinar junto essa semana?', time: '09:31', unread: 3, fromMe: false },
  { contactId: 'otavio', lastMessage: 'Via nova no ginásio, nível V4', time: 'seg', unread: 1, fromMe: false },
  { contactId: 'lidiane', lastMessage: 'Vou estar lá', time: 'dom', fromMe: true },
  { contactId: 'patricia', lastMessage: 'Receita do bowl vegan no chat 🥗', time: 'sex', fromMe: false },
  { contactId: 'camila', lastMessage: 'Adorei seu post do suco', time: 'sex', fromMe: false },
  { contactId: 'marina', lastMessage: 'Bora! 17h?', time: '11:12', fromMe: false },
]

export type ChatMessage = { id: string; text: string; time: string; fromMe: boolean }

export const chatHistory: Record<string, ChatMessage[]> = {
  renata: [
    { id: '1', text: 'Bom dia! Vai correr hoje?', time: '08:12', fromMe: false },
    { id: '2', text: 'Vou sim, saio às 18h', time: '08:15', fromMe: true },
    { id: '3', text: 'Combinado então 💪', time: '08:16', fromMe: false },
  ],
  tiago: [
    { id: '1', text: 'Consegui bater o recorde hoje 🏃', time: '06:55', fromMe: false },
    { id: '2', text: 'Monstro! Bora domingo?', time: '07:02', fromMe: true },
  ],
  julia: [
    { id: '1', text: 'Oi! Tudo bem?', time: '09:28', fromMe: false },
    { id: '2', text: 'Tudo ótimo! 😊', time: '09:29', fromMe: true },
    { id: '3', text: 'Vamos treinar junto essa semana?', time: '09:31', fromMe: false },
  ],
  nicole: [
    { id: '1', text: 'Mandei o plano alimentar', time: 'ter 08:10', fromMe: false },
    { id: '2', text: 'Recebi, obrigada 🌱', time: 'ter 08:14', fromMe: true },
  ],
  lidiane: [
    { id: '1', text: 'A gente se encontra às 7h amanhã?', time: 'dom', fromMe: false },
    { id: '2', text: 'Vou estar lá', time: 'dom', fromMe: true },
  ],
  diego: [
    { id: '1', text: 'Fechou os 8K ontem? Como foi o pace?', time: '11:50', fromMe: false },
    { id: '2', text: 'Ficou em 5:10. Quase bateu!', time: '11:55', fromMe: true },
    { id: '3', text: 'Pista às 6h. Leva o relógio!', time: '12:04', fromMe: false },
  ],
  fernanda: [
    { id: '1', text: 'Vi que você curte pilates. Tem experiência?', time: '10:20', fromMe: false },
    { id: '2', text: 'Comecei faz 2 meses, ainda iniciante', time: '10:28', fromMe: true },
    { id: '3', text: 'Aula de pilates amanhã às 19h', time: '10:42', fromMe: false },
  ],
  gabriel: [
    { id: '1', text: 'Sesc Pinheiros liberou a piscina olimpica', time: '09:05', fromMe: false },
    { id: '2', text: 'Sério? Que horário?', time: '09:10', fromMe: true },
    { id: '3', text: 'Água gelada hoje, bora nadar?', time: '09:18', fromMe: false },
  ],
  helena: [
    { id: '1', text: 'Bom dia 🙏 Como está sua rotina de sono?', time: 'qua 07:00', fromMe: false },
    { id: '2', text: 'Melhorando! Meditei ontem à noite', time: 'qua 07:12', fromMe: true },
    { id: '3', text: 'Sessão de meditação às 7h', time: 'qua 07:20', fromMe: false },
  ],
  otavio: [
    { id: '1', text: 'Subiu o V3 ontem? Parabéns!', time: 'seg 18:00', fromMe: false },
    { id: '2', text: 'Valeu! Quase cai no final 😅', time: 'seg 18:15', fromMe: true },
    { id: '3', text: 'Via nova no ginásio, nível V4', time: 'seg 18:40', fromMe: false },
  ],
  patricia: [
    { id: '1', text: 'Testei o smoothie verde da Bruna. Demais!', time: 'sex 14:00', fromMe: false },
    { id: '2', text: 'Quero a receita também!', time: 'sex 14:20', fromMe: true },
    { id: '3', text: 'Receita do bowl vegan no chat 🥗', time: 'sex 14:35', fromMe: false },
  ],
  bruno: [
    { id: '1', text: 'Trilha no domingo?', time: 'seg 09:00', fromMe: false },
    { id: '2', text: 'Pode ser! Qual horário?', time: 'seg 09:20', fromMe: true },
    { id: '3', text: '7h no ponto de sempre', time: 'seg 09:35', fromMe: false },
  ],
  camila: [
    { id: '1', text: 'Adorei seu post do suco', time: 'sex 16:00', fromMe: false },
    { id: '2', text: 'Obrigado! Foi o da Nicole 🌱', time: 'sex 16:12', fromMe: true },
  ],
  marina: [
    { id: '1', text: 'Bora pedalar depois do trabalho?', time: '11:00', fromMe: false },
    { id: '2', text: 'Topo! Que horas?', time: '11:05', fromMe: true },
    { id: '3', text: 'Bora! 17h?', time: '11:12', fromMe: false },
  ],
}

export type Post = {
  author: string
  avatar: string
  time: string
  text: string
  mention?: string
  tags: string[]
  image: string
  reactions: { emoji: string; count: number }[]
  likes: number
  comments: number
}
export const posts: Post[] = [
  {
    author: '@bruna_carla',
    avatar: faces.bruna,
    time: '5 min',
    text: 'Hoje foi o dia daquela bebida natural',
    mention: '@naturalfit',
    tags: ['#natural', '#suconatural'],
    image: photo.smoothie,
    reactions: [
      { emoji: '💪', count: 6 },
      { emoji: '🌱', count: 4 },
    ],
    likes: 128,
    comments: 25,
  },
  {
    author: '@diego_run',
    avatar: faces.diego,
    time: '18 min',
    text: 'Intervalados na pista: 8x400m. Sensação boa pra começar a semana!',
    tags: ['#corrida', '#intervalados'],
    image: photo.morningWalk,
    reactions: [
      { emoji: '🔥', count: 9 },
      { emoji: '🏃', count: 5 },
    ],
    likes: 96,
    comments: 14,
  },
  {
    author: '@pedro.run',
    avatar: faces.joseph,
    time: '32 min',
    text: 'Fechei os 10K de manhã cedo. Respeite sua mente e trate seu corpo bem!',
    tags: ['#corrida', '#10k'],
    image: photo.trailRun,
    reactions: [
      { emoji: '🔥', count: 12 },
      { emoji: '🏃', count: 8 },
    ],
    likes: 342,
    comments: 41,
  },
  {
    author: '@pati_lima',
    avatar: faces.patricia,
    time: '1 h',
    text: 'Bowl verde do almoço: grão-de-bico, quinoa e tahine. Simples e nutritivo.',
    tags: ['#vegan', '#almoco'],
    image: photo.veganBowl,
    reactions: [
      { emoji: '🌱', count: 11 },
      { emoji: '💪', count: 3 },
    ],
    likes: 210,
    comments: 33,
  },
]
