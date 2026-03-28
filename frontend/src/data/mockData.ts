export type PostCategory = 'lifestory' | 'founder' | 'corporate';

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
