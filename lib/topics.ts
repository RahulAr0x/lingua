export interface Subcategory {
  label: string;
  questions: string[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: "work",
    label: "Work & Career",
    icon: "💼",
    color: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
    description: "Professional communication, interviews, workplace situations",
    subcategories: [
      {
        label: "Workplace situations",
        questions: [
          "Describe a time you had to explain a complex idea to a colleague who was unfamiliar with it.",
          "Write about a difficult conversation you had at work and how you handled it.",
          "Describe what a productive working day looks like for you and how you organise it.",
          "Write about a time something went wrong at work and the steps you took to fix it.",
          "Describe how you prefer to give and receive feedback from colleagues.",
          "Write about a time you had to work closely with someone whose style was very different from yours.",
          "Describe what professionalism means to you in a workplace setting.",
        ],
      },
      {
        label: "Interviews & job seeking",
        questions: [
          "Describe a professional achievement you are proud of and what made it challenging.",
          "Write about a skill you identified as a gap in your abilities and how you addressed it.",
          "How would you introduce yourself and your experience to a new team on your first day?",
          "Describe the kind of workplace culture where you do your best work.",
          "Write about what you would look for in a job offer beyond just the salary.",
          "Describe a project where you took initiative without being asked to.",
        ],
      },
      {
        label: "Career & growth",
        questions: [
          "Write about where you see yourself professionally in the next three years.",
          "Describe a career decision that was difficult to make and what helped you decide.",
          "What motivates you to keep developing your skills outside of work?",
          "Write about a professional mentor or colleague who influenced how you work.",
          "Describe a moment when you changed your approach to a task because the first attempt did not work.",
        ],
      },
    ],
  },
  {
    id: "uk_life",
    label: "UK Life",
    icon: "🇬🇧",
    color: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
    description: "Daily life, British culture, adapting to life in the UK",
    subcategories: [
      {
        label: "Daily routines & places",
        questions: [
          "Describe a typical weekday morning and how you get to work or start your day.",
          "Write about a local café, park, or area you have discovered and what you like about it.",
          "Describe your experience using public transport in the UK — what works and what frustrates you.",
          "Write about the process of setting up your life in the UK — what was easier or harder than expected.",
          "Describe what you do to relax on an evening or weekend in the UK.",
          "Write about a shop, market, or neighbourhood you enjoy spending time in.",
        ],
      },
      {
        label: "British culture & customs",
        questions: [
          "Describe a British custom or social habit that you find interesting, confusing, or different from home.",
          "Write about the experience of making small talk with British people — what topics come up and how it feels.",
          "Describe your first impressions of British humour and whether it took time to understand.",
          "Write about how British people discuss the weather and why you think it matters so much culturally.",
          "Describe the differences you notice in how people queue, apologise, or say thank you in the UK.",
          "Write about a British tradition or public event you have witnessed or would like to experience.",
        ],
      },
      {
        label: "Adapting to life in the UK",
        questions: [
          "Write about the differences you notice between your home country and the UK in everyday social situations.",
          "Describe what feeling settled in a new place means to you and how you are working towards it.",
          "Write about something you miss from your home country and how you manage that feeling.",
          "Describe how your daily routine has changed since moving to the UK.",
          "Write about a moment when you felt genuinely at home or comfortable in the UK.",
          "Describe how you are building a social life and meeting people in a new country.",
        ],
      },
    ],
  },
  {
    id: "travel",
    label: "Travel & Places",
    icon: "✈️",
    color: "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30",
    description: "Journeys, places you have been, places you want to explore",
    subcategories: [
      {
        label: "Places you have visited",
        questions: [
          "Describe a city or town in the UK you have visited — what stood out and what you would recommend.",
          "Write about a place from your home country that you would like to show a British friend.",
          "Describe a journey that did not go as planned and how you dealt with it.",
          "Write about the most memorable landscape or scenery you have ever seen.",
          "Describe what you look for when choosing where to go for a short trip or holiday.",
        ],
      },
      {
        label: "Exploring your area",
        questions: [
          "Describe a walk, route, or area near where you live that you enjoy exploring.",
          "Write about the best and worst things about the neighbourhood you currently live in.",
          "Describe a day trip from your city that you have taken or would like to take.",
          "Write about how your impression of a place changed once you got to know it better.",
          "Describe a local event, market, or gathering you attended and what the atmosphere was like.",
        ],
      },
    ],
  },
  {
    id: "technology",
    label: "Technology",
    icon: "💻",
    color: "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30",
    description: "Digital habits, remote work, tools that shape daily life",
    subcategories: [
      {
        label: "Everyday tech habits",
        questions: [
          "Describe the apps or tools you use every day and what you would struggle without.",
          "Write about how your use of technology has changed in the past two years.",
          "Describe a time technology let you down at a critical moment and what you did.",
          "Write about your relationship with your phone — do you feel in control of how much you use it?",
          "Describe how you decide whether to trust information you find online.",
        ],
      },
      {
        label: "Working & learning digitally",
        questions: [
          "Write about your experience working or studying remotely — what works well and what is difficult.",
          "Describe how you use digital tools to organise your time and stay on top of tasks.",
          "Write about a tool or platform that has genuinely improved how you learn or work.",
          "Describe what a good video call or online meeting looks and feels like to you.",
          "Write about how you balance being connected to work messages outside of working hours.",
        ],
      },
    ],
  },
  {
    id: "health",
    label: "Health & Wellbeing",
    icon: "🌿",
    color: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
    description: "Physical health, mental wellbeing, habits and routines",
    subcategories: [
      {
        label: "Physical habits & routines",
        questions: [
          "Describe a habit related to health or fitness that you have built and how you maintain it.",
          "Write about how the change in climate and seasons in the UK affects how you feel physically.",
          "Describe your relationship with food — how you eat, what you cook, and what you miss from home.",
          "Write about how you stay active in a city environment.",
          "Describe a time you made a significant change to your lifestyle and what prompted it.",
        ],
      },
      {
        label: "Mental wellbeing",
        questions: [
          "Write about what you do when you feel stressed and whether it actually helps.",
          "Describe how you recharge after a long or difficult week.",
          "Write about the relationship between your language learning and your confidence in daily life.",
          "Describe a moment when you felt proud of how you handled a stressful situation.",
          "Write about how you maintain a sense of routine and structure that supports your wellbeing.",
        ],
      },
    ],
  },
  {
    id: "learning",
    label: "Learning & Growth",
    icon: "📚",
    color: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
    description: "Language learning, skills, education, self-improvement",
    subcategories: [
      {
        label: "Language learning journey",
        questions: [
          "Describe the moment you realised your English was improving and what made you notice.",
          "Write about a situation where your English was not good enough and how it made you feel.",
          "Describe the most useful thing you have ever done to improve your English.",
          "Write about the difference between understanding English and feeling confident speaking it.",
          "Describe how your relationship with the English language has changed since moving to the UK.",
          "Write about a word, phrase, or expression in English that you find particularly useful or elegant.",
        ],
      },
      {
        label: "Skills & education",
        questions: [
          "Describe a skill you are currently working on and the progress you have made so far.",
          "Write about the most valuable thing you have ever learned — inside or outside of formal education.",
          "Describe your approach to learning something completely new.",
          "Write about a time you taught someone else something and what you learned from doing it.",
          "Describe how you decide which skills are worth investing time into.",
        ],
      },
    ],
  },
  {
    id: "people",
    label: "People & Relationships",
    icon: "🤝",
    color: "border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950/30",
    description: "Friendships, family, social life, meeting people in a new country",
    subcategories: [
      {
        label: "Friendships & social life",
        questions: [
          "Describe how you go about making friends in a new city or country.",
          "Write about what makes a friendship last over time and across distance.",
          "Describe a friendship that started in an unexpected way.",
          "Write about the challenges and rewards of maintaining friendships from your home country.",
          "Describe what kind of social events or activities help you feel most comfortable meeting new people.",
        ],
      },
      {
        label: "Family & home",
        questions: [
          "Describe what home means to you and whether that feeling has changed since you moved.",
          "Write about a family tradition or habit that you have kept even after moving abroad.",
          "Describe how you stay connected with family and friends who are far away.",
          "Write about a conversation with a family member that changed how you see something.",
          "Describe what you think your family or close friends would say about who you are becoming.",
        ],
      },
    ],
  },
  {
    id: "opinion",
    label: "Opinion & Debate",
    icon: "💬",
    color: "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30",
    description: "Share and defend your views on culture, society, and everyday topics",
    subcategories: [
      {
        label: "Culture & society",
        questions: [
          "Write about something you think is often misunderstood about the country you come from.",
          "Describe whether you think it is important to adapt your accent or speech style when living in a new country.",
          "Write about a cultural difference between your home country and the UK that you find interesting or surprising.",
          "Describe your view on whether people should try to fully integrate into a new culture or maintain their own.",
          "Write about whether you think social media helps or hinders people who are living abroad.",
        ],
      },
      {
        label: "Personal values & beliefs",
        questions: [
          "Write about a belief you hold that has been challenged since moving to the UK.",
          "Describe something you think most people get wrong about success.",
          "Write about what you think the most important quality in a person is and why.",
          "Describe a time you changed your mind about something significant and what caused the change.",
          "Write about whether ambition is always a positive quality or whether it has a downside.",
          "Describe what fairness means to you in a practical, everyday sense.",
        ],
      },
    ],
  },
];

function dateIndex(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export function getTodayQuestion(questions: string[]): string {
  return questions[dateIndex() % questions.length];
}

export function getRandomPrompt(): { category: Category; subcategory: Subcategory; question: string } {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const subcategory = category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
  const question = subcategory.questions[Math.floor(Math.random() * subcategory.questions.length)];
  return { category, subcategory, question };
}
