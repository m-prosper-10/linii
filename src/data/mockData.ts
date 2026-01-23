// Mock data for the social media application

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  coverImage: string;
  verified: boolean;
  followers: number;
  following: number;
  website?: string;
  location?: string;
  joinedDate: string;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  video?: string;
  timestamp: string;
  likes: number;
  comments: number;
  reposts: number;
  saves: number;
  isLiked: boolean;
  isSaved: boolean;
  isReposted: boolean;
  reach: number;
  isAIGenerated?: boolean;
  tags?: string[];
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'system';
  user?: User;
  post?: Post;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface TrendingTopic {
  id: string;
  hashtag: string;
  posts: number;
  category: string;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

// Mock current user
export const currentUser: User = {
  id: '1',
  username: 'alexmorgan',
  displayName: 'Alex Morgan',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400',
  bio: 'Tech enthusiast | AI researcher | Coffee addict ☕',
  coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200',
  verified: true,
  followers: 12453,
  following: 892,
  website: 'alexmorgan.dev',
  location: 'San Francisco, CA',
  joinedDate: 'January 2023'
};

// Mock users
export const mockUsers: User[] = [
  {
    id: '2',
    username: 'sarahchen',
    displayName: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    bio: 'Product designer | UX enthusiast | Building beautiful interfaces',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
    verified: true,
    followers: 8932,
    following: 543,
    website: 'sarahchen.design',
    joinedDate: 'March 2023'
  },
  {
    id: '3',
    username: 'marcusjohnson',
    displayName: 'Marcus Johnson',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Software engineer | Open source contributor',
    coverImage: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200',
    verified: false,
    followers: 3421,
    following: 234,
    joinedDate: 'May 2023'
  },
  {
    id: '4',
    username: 'emilywilson',
    displayName: 'Emily Wilson',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'AI researcher | ML engineer | Tech blogger',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
    verified: true,
    followers: 15672,
    following: 1092,
    website: 'emilywilson.ai',
    location: 'New York, NY',
    joinedDate: 'February 2023'
  },
  {
    id: '5',
    username: 'davidpark',
    displayName: 'David Park',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    bio: 'Startup founder | Tech investor | Mentor',
    coverImage: 'https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=1200',
    verified: false,
    followers: 5234,
    following: 432,
    joinedDate: 'April 2023'
  }
];

// Mock posts
export const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    content: 'Just finished redesigning our mobile app interface. The new design system makes everything so much more consistent and maintainable. Can\'t wait to share the case study soon! 🎨',
    image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800',
    timestamp: '2h ago',
    likes: 342,
    comments: 23,
    reposts: 45,
    saves: 67,
    isLiked: false,
    isSaved: false,
    isReposted: false,
    reach: 8934,
    tags: ['design', 'ui', 'mobile']
  },
  {
    id: '2',
    author: mockUsers[1],
    content: 'Interesting observation about AI-assisted development: It\'s not replacing developers, it\'s making us more productive. The key is knowing when to use it and when to rely on human judgment.',
    timestamp: '4h ago',
    likes: 567,
    comments: 89,
    reposts: 123,
    saves: 234,
    isLiked: true,
    isSaved: false,
    isReposted: false,
    reach: 15234,
    isAIGenerated: false,
    tags: ['ai', 'development', 'tech']
  },
  {
    id: '3',
    author: mockUsers[2],
    content: 'Check out this amazing visualization of our new machine learning model performance. The results exceeded our expectations by 40%! 📊',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    timestamp: '6h ago',
    likes: 789,
    comments: 56,
    reposts: 91,
    saves: 156,
    isLiked: false,
    isSaved: true,
    isReposted: false,
    reach: 21456,
    isAIGenerated: false,
    tags: ['machinelearning', 'ai', 'data']
  },
  {
    id: '4',
    author: mockUsers[3],
    content: 'Had an incredible conversation with our investors today. They\'re as excited as we are about the future of AI-driven productivity tools. Big announcements coming soon! 🚀',
    timestamp: '8h ago',
    likes: 423,
    comments: 67,
    reposts: 78,
    saves: 89,
    isLiked: true,
    isSaved: false,
    isReposted: true,
    reach: 12345,
    tags: ['startup', 'ai', 'business']
  },
  {
    id: '5',
    author: currentUser,
    content: 'Working on an exciting new project that combines natural language processing with real-time collaboration. The possibilities are endless when you combine AI with human creativity.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    timestamp: '12h ago',
    likes: 892,
    comments: 134,
    reposts: 167,
    saves: 289,
    isLiked: false,
    isSaved: true,
    isReposted: false,
    reach: 28934,
    isAIGenerated: true,
    tags: ['nlp', 'ai', 'collaboration']
  },
  {
    id: '6',
    author: mockUsers[0],
    content: 'Design systems are more than just component libraries. They\'re about creating a shared language between designers and developers.',
    timestamp: '1d ago',
    likes: 234,
    comments: 45,
    reposts: 34,
    saves: 78,
    isLiked: false,
    isSaved: false,
    isReposted: false,
    reach: 6234,
    tags: ['design', 'designsystems']
  }
];

// Mock conversations
export const mockConversations: Conversation[] = [
  {
    id: '1',
    participants: [currentUser, mockUsers[0]],
    lastMessage: {
      id: 'm1',
      sender: mockUsers[0],
      content: 'Thanks for the feedback on the design! I\'ll implement those changes.',
      timestamp: '10m ago',
      read: false
    },
    unreadCount: 2
  },
  {
    id: '2',
    participants: [currentUser, mockUsers[1]],
    lastMessage: {
      id: 'm2',
      sender: currentUser,
      content: 'Let me know when you\'re free to discuss the AI integration.',
      timestamp: '2h ago',
      read: true
    },
    unreadCount: 0
  },
  {
    id: '3',
    participants: [currentUser, mockUsers[2]],
    lastMessage: {
      id: 'm3',
      sender: mockUsers[2],
      content: 'The ML model training is complete. Results look promising!',
      timestamp: '5h ago',
      read: false
    },
    unreadCount: 1
  }
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    user: mockUsers[0],
    content: 'liked your post',
    timestamp: '5m ago',
    read: false
  },
  {
    id: '2',
    type: 'comment',
    user: mockUsers[1],
    content: 'commented on your post',
    timestamp: '15m ago',
    read: false
  },
  {
    id: '3',
    type: 'follow',
    user: mockUsers[2],
    content: 'started following you',
    timestamp: '1h ago',
    read: false
  },
  {
    id: '4',
    type: 'mention',
    user: mockUsers[3],
    content: 'mentioned you in a post',
    timestamp: '2h ago',
    read: true
  },
  {
    id: '5',
    type: 'system',
    content: 'Your post reached 10K views!',
    timestamp: '3h ago',
    read: true
  },
  {
    id: '6',
    type: 'like',
    user: mockUsers[2],
    content: 'liked your comment',
    timestamp: '4h ago',
    read: true
  }
];

// Mock trending topics
export const mockTrendingTopics: TrendingTopic[] = [
  {
    id: '1',
    hashtag: '#AIRevolution',
    posts: 45678,
    category: 'Technology'
  },
  {
    id: '2',
    hashtag: '#WebDevelopment',
    posts: 23456,
    category: 'Programming'
  },
  {
    id: '3',
    hashtag: '#DesignThinking',
    posts: 18934,
    category: 'Design'
  },
  {
    id: '4',
    hashtag: '#StartupLife',
    posts: 15678,
    category: 'Business'
  },
  {
    id: '5',
    hashtag: '#MachineLearning',
    posts: 34567,
    category: 'Technology'
  }
];

// Mock comments for posts
export const mockComments: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      author: mockUsers[1],
      content: 'This looks amazing! Can you share more details about the design system?',
      timestamp: '1h ago',
      likes: 12,
      isLiked: false,
    },
    {
      id: 'c2',
      author: currentUser,
      content: 'Great work! Looking forward to the case study.',
      timestamp: '45m ago',
      likes: 8,
      isLiked: true,
    },
    {
      id: 'c3',
      author: mockUsers[2],
      content: 'The consistency improvements are really noticeable. Well done!',
      timestamp: '30m ago',
      likes: 5,
      isLiked: false,
    },
  ],
  '2': [
    {
      id: 'c4',
      author: mockUsers[0],
      content: 'Completely agree! AI is a tool, not a replacement.',
      timestamp: '3h ago',
      likes: 24,
      isLiked: true,
    },
    {
      id: 'c5',
      author: mockUsers[3],
      content: 'This is exactly what I\'ve been thinking. Great perspective!',
      timestamp: '2h ago',
      likes: 15,
      isLiked: false,
    },
  ],
  '5': [
    {
      id: 'c6',
      author: mockUsers[0],
      content: 'This sounds fascinating! Would love to learn more about the NLP integration.',
      timestamp: '10h ago',
      likes: 34,
      isLiked: false,
    },
    {
      id: 'c7',
      author: mockUsers[1],
      content: 'The combination of AI and human creativity is where the magic happens.',
      timestamp: '8h ago',
      likes: 28,
      isLiked: true,
    },
  ],
};

// Analytics data
export const mockAnalytics = {
  totalPosts: 156,
  totalLikes: 34567,
  totalComments: 5678,
  totalFollowers: 12453,
  followerGrowth: 15.3,
  engagementRate: 8.7,
  postPerformance: [
    { date: 'Mon', views: 2400, engagement: 400, likes: 240 },
    { date: 'Tue', views: 1398, engagement: 300, likes: 220 },
    { date: 'Wed', views: 9800, engagement: 900, likes: 650 },
    { date: 'Thu', views: 3908, engagement: 500, likes: 380 },
    { date: 'Fri', views: 4800, engagement: 700, likes: 520 },
    { date: 'Sat', views: 3800, engagement: 600, likes: 450 },
    { date: 'Sun', views: 4300, engagement: 650, likes: 480 }
  ],
  audienceGrowth: [
    { month: 'Jan', followers: 8500 },
    { month: 'Feb', followers: 9200 },
    { month: 'Mar', followers: 10100 },
    { month: 'Apr', followers: 10800 },
    { month: 'May', followers: 11500 },
    { month: 'Jun', followers: 12453 }
  ],
  topPosts: mockPosts.slice(0, 3)
};
