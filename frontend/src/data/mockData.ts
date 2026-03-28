export type PostCategory = 'lifestory' | 'founder' | 'corporate';
export type UserType = 'kids' | 'adults' | 'founder';

export interface Post {
  id: string;
  category: PostCategory;
  content: string;
  tags: string[];
  attributes: string[];
  similarityScore?: number; // Represented as a percentage (0-100)
  timestamp: string;
}

export const mockPosts: Post[] = [
  // LifeStory Pools
  {
    id: 'ls-1',
    category: 'lifestory',
    content: "Growing up in a small town, there were few opportunities for creative expression. I started drawing murals on abandoned walls, turning them into community art pieces. It saved me, and I'm hoping to connect with others who used art to overcome isolation.",
    tags: ["Art", "Mental Health", "Community"],
    attributes: ["Small Town", "Self-Taught Artist"],
    similarityScore: 94,
    timestamp: "2 hours ago"
  },
  {
    id: 'ls-2',
    category: 'lifestory',
    content: "I recently lost my job of 15 years due to restructuring. The uncertainty was terrifying, but it pushed me to finally launch the bakery I've always dreamed of. Anyone else navigating the scary leap from corporate to small business?",
    tags: ["Career Change", "Entrepreneurship", "Resilience"],
    attributes: ["Mid-Career", "First-Time Founder"],
    similarityScore: 88,
    timestamp: "5 hours ago"
  },
  {
    id: 'ls-3',
    category: 'lifestory',
    content: "Dealing with ADHD in school was tough. I constantly felt like I was falling behind. Discovering coding gave me a hyper-focus outlet that changed my life. Now looking to mentor teens facing similar struggles.",
    tags: ["ADHD", "Education", "Mentorship"],
    attributes: ["Neurodivergent", "Tech Professional"],
    similarityScore: 91,
    timestamp: "1 day ago"
  },

  // Founder Match
  {
    id: 'fm-1',
    category: 'founder',
    content: "Building an iOS app that gamifies physical therapy exercises for kids using AR. The tech is solid, but I'm a solo technical founder seeking a co-founder with pediatric health expertise to ensure clinical relevance.",
    tags: ["HealthTech", "AR", "Pediatrics"],
    attributes: ["Technical Founder", "Pre-Seed"],
    similarityScore: 97,
    timestamp: "3 hours ago"
  },
  {
    id: 'fm-2',
    category: 'founder',
    content: "Started a B2B SaaS platform optimizing supply chains for independent coffee roasters. We have $10k MRR and are looking for seed investment to scale our sales team across the West Coast.",
    tags: ["SaaS", "B2B", "Logistics"],
    attributes: ["Revenue Generating", "Seeking Seed"],
    similarityScore: 82,
    timestamp: "12 hours ago"
  },

  // Corporate Conversations
  {
    id: 'cc-1',
    category: 'corporate',
    content: "We are an eco-friendly packaging company committed to Zero Waste. We're actively looking for e-commerce brands who want to transition away from plastics. Let's work together to reduce our carbon footprints.",
    tags: ["Sustainability", "B2B Partnership", "Packaging"],
    attributes: ["B Corp", "Manufacturing"],
    similarityScore: 95,
    timestamp: "1 day ago"
  },
  {
    id: 'cc-2',
    category: 'corporate',
    content: "A local non-profit focused on after-school STEM programs. Seeking local tech businesses willing to sponsor equipment or offer employee volunteer hours to mentor our students.",
    tags: ["Non-Profit", "Education", "Sponsorship"],
    attributes: ["Community Organization", "Local Impact"],
    similarityScore: 89,
    timestamp: "2 days ago"
  }
];

export const mockTranslations: Record<string, string> = {
  "haiiii": "Hello, how are you?",
  "whats up": "How may I assist you today?",
  "u up for a call?": "Would you be available for a brief meeting?",
  "this is bad": "We should review this to find areas for improvement.",
  "thx": "Thank you for your assistance.",
};

export interface ChatMessage {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  contactName: string;
  avatarInitial: string;
  avatarColor: string;
  online: boolean;
  lastMessagePreview: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export const mockChats: Chat[] = [
  {
    id: 'c1',
    contactName: 'Maya Rodriguez',
    avatarInitial: 'M',
    avatarColor: '#FF6B35',
    online: true,
    lastMessagePreview: 'We need to make sure our privacy policies are air-tight.',
    lastMessageTime: '10:06 AM',
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'other', text: 'Hey, did you see the latest news about the doxxing case?', timestamp: '10:00 AM' },
      { id: 'm2', sender: 'user', text: 'Yeah, it\'s pretty scary stuff.', timestamp: '10:05 AM' },
      { id: 'm3', sender: 'other', text: 'We need to make sure our privacy policies are air-tight.', timestamp: '10:06 AM' },
    ]
  },
  {
    id: 'c2',
    contactName: 'Jordan Chen',
    avatarInitial: 'J',
    avatarColor: '#6366F1',
    online: true,
    lastMessagePreview: 'Let me know if you need anything else.',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: 'm4', sender: 'other', text: 'The paperwork for the business transfer is ready.', timestamp: 'Yesterday' },
      { id: 'm5', sender: 'user', text: 'Excellent. I will review it tonight.', timestamp: 'Yesterday' },
      { id: 'm6', sender: 'other', text: 'Let me know if you need anything else.', timestamp: 'Yesterday' },
    ]
  },
  {
    id: 'c3',
    contactName: 'Aisha Patel',
    avatarInitial: 'A',
    avatarColor: '#10B981',
    online: false,
    lastMessagePreview: 'The pitch deck looks great! Let\'s schedule a call.',
    lastMessageTime: 'Mon',
    unreadCount: 3,
    messages: [
      { id: 'm7', sender: 'other', text: 'Hey! I reviewed the pitch deck you sent over.', timestamp: 'Mon 9:00 AM' },
      { id: 'm8', sender: 'user', text: 'Thanks for taking the time! Any feedback?', timestamp: 'Mon 9:15 AM' },
      { id: 'm9', sender: 'other', text: 'It\'s solid. The market analysis section is really compelling.', timestamp: 'Mon 9:20 AM' },
      { id: 'm10', sender: 'other', text: 'I think we could tighten up the financials slide though.', timestamp: 'Mon 9:22 AM' },
      { id: 'm11', sender: 'other', text: 'The pitch deck looks great! Let\'s schedule a call.', timestamp: 'Mon 9:30 AM' },
    ]
  },
  {
    id: 'c4',
    contactName: 'Liam Nakamura',
    avatarInitial: 'L',
    avatarColor: '#F59E0B',
    online: false,
    lastMessagePreview: 'Sounds good, talk soon!',
    lastMessageTime: 'Last week',
    unreadCount: 0,
    messages: [
      { id: 'm12', sender: 'user', text: 'Hey Liam, are you still interested in the co-founder role?', timestamp: 'Last week' },
      { id: 'm13', sender: 'other', text: 'Absolutely! I\'ve been thinking about it a lot.', timestamp: 'Last week' },
      { id: 'm14', sender: 'user', text: 'Great, let\'s set up a meeting this week.', timestamp: 'Last week' },
      { id: 'm15', sender: 'other', text: 'Sounds good, talk soon!', timestamp: 'Last week' },
    ]
  },
  {
    id: 'c5',
    contactName: 'Sofia Martinez',
    avatarInitial: 'S',
    avatarColor: '#EC4899',
    online: true,
    lastMessagePreview: 'I\'ll send over the contract by end of day.',
    lastMessageTime: '2:30 PM',
    unreadCount: 0,
    messages: [
      { id: 'm16', sender: 'other', text: 'Hi! Following up on our partnership discussion.', timestamp: '2:00 PM' },
      { id: 'm17', sender: 'user', text: 'Yes! We\'re very excited about the collaboration.', timestamp: '2:10 PM' },
      { id: 'm18', sender: 'other', text: 'Same here. Our team has already started on the integration plan.', timestamp: '2:20 PM' },
      { id: 'm19', sender: 'other', text: 'I\'ll send over the contract by end of day.', timestamp: '2:30 PM' },
    ]
  }
];
