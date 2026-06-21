// Single source of truth for the globe résumé. Drives the 3D pins, the
// terminal company lists, the CV popovers, and the static SEO fallback.

export interface Company {
  name: string;
  title: string;
  dates: string;
  summary: string;
  tech: string[];
  url?: string;
  /** Remote / freelance role — not physically located in the city. */
  remote?: boolean;
  /** Renders a "[ COMING SOON ]" stub; real data pending. */
  placeholder?: boolean;
}

export interface City {
  id: string;
  name: string; // "Miami"
  label: string; // "Miami, FL"
  lat: number;
  lng: number;
  companies: Company[];
}

export interface Award {
  title: string;
  detail: string;
}

export interface Social {
  label: string;
  href: string;
}

export const cities: City[] = [
  {
    id: 'mia',
    name: 'Miami',
    label: 'Miami, FL',
    lat: 25.7617,
    lng: -80.1918,
    companies: [
      {
        name: 'Hazel Health',
        title: 'Senior Software Engineer',
        dates: '2023–Present',
        summary:
          "Building and maintaining Hazel's school-based telehealth platform. Architected an AI-powered insurance-card text-extraction system (LLMs + computer vision) that streamlines patient intake, cuts manual data entry, and improves insurance-verification accuracy. Collaborate across product and engineering to ship scalable, reliable frontend and backend for critical telehealth workflows.",
        tech: ['React', 'TypeScript', 'Java (Spring)', 'LLMs', 'Computer Vision'],
      },
      {
        name: 'eMed',
        title: 'Senior Research Software Engineer',
        dates: '2021–2023',
        summary:
          'Developed AR/CV web-based diagnostic tools for at-home testing using Three.js, A-Frame, WebGL, React, and 8th Wall. Integrated Node.js with AWS for RESTful APIs and backend services, led R&D on emerging AR/CV tech to improve diagnostic accuracy and UX, and designed scalable diagnostic protocols and system architecture.',
        tech: ['Three.js', 'A-Frame', 'WebGL', 'React', '8th Wall', 'Node.js', 'AWS'],
      },
      {
        name: 'Magic Leap',
        title: 'Lead JavaScript Engineer',
        dates: '2017–2020',
        summary:
          'Led development of Prismatic, a declarative 3D JavaScript framework for Magic Leap One. Contributed to the W3C WebXR Device API standard and managed a dev team designing and building experimental AR features. (Plantation, FL — Miami metro.)',
        tech: ['JavaScript', '3D', 'WebXR', 'AR'],
        url: 'https://github.com/magicleap/prismatic',
      },
      {
        name: 'Miami Herald',
        title: 'Data Visualization Engineer',
        dates: '2016–2017',
        summary:
          'Built interactive data visualizations with D3.js and React. Authored Florida/Miami TopoJSON & GeoJSON for storytelling and partnered with journalists to enhance data-driven reporting with visual analytics.',
        tech: ['D3.js', 'React', 'TopoJSON', 'GeoJSON'],
      },
      {
        name: 'Havas',
        title: 'Software Engineer',
        dates: '2020–2021',
        summary:
          'Sole developer launching a new digital-wellness initiative within Havas. Built immersive digital experiences with Three.js, A-Frame, React, and React Three Fiber, and partnered with stakeholders to define and deliver custom technical solutions and campaign strategy.',
        tech: ['Three.js', 'A-Frame', 'React', 'React Three Fiber'],
        remote: true,
      },
      {
        name: 'Webaverse AI',
        title: 'Freelance Senior Software Engineer',
        dates: '2023–2025',
        summary:
          'Built AI chatbots over multiple LLMs (GPT, Claude, Mistral) in a modular React + TypeScript app with dynamic model selection and parameter tuning. Created a node-based visual AI image-generation tool and ported the app to WebXR for immersive 3D chatbot interaction on Apple Vision Pro and Meta Quest.',
        tech: ['LLMs', 'GPT', 'Claude', 'Mistral', 'WebXR', 'React', 'TypeScript'],
        remote: true,
      },
    ],
  },
  {
    id: 'lon',
    name: 'London',
    label: 'London, UK',
    lat: 51.5074,
    lng: -0.1278,
    companies: [
      {
        name: 'Nice & Serious',
        title: 'Web Developer',
        dates: '2014–2016',
        summary:
          'Developed static and dynamic websites with Angular.js and a custom headless CMS. Collaborated across design, dev, and strategy to deliver interactive web content and supported SEO and campaign execution through performant front-end development.',
        tech: ['Angular.js', 'Headless CMS', 'JavaScript', 'SEO'],
      },
      {
        name: 'General Assembly London',
        title: 'Full-Stack Web Development Immersive',
        dates: 'Education',
        summary: 'Full-Stack Web Development Immersive program.',
        tech: ['JavaScript', 'Full-Stack'],
      },
    ],
  },
  {
    id: 'nyc',
    name: 'New York',
    label: 'New York, NY',
    lat: 40.7128,
    lng: -74.006,
    companies: [
      {
        name: 'Apple Inc.',
        title: 'Quality Assurance Engineer',
        dates: '2005–2013',
        summary:
          'Quality assurance testing for retail fulfillment and customer-experience software systems. Wrote and executed test plans, surfaced and tracked defects, and partnered with engineering to validate releases and keep the end-to-end customer experience reliable.',
        tech: ['Quality Assurance', 'Test Planning', 'Software Testing'],
      },
    ],
  },
];

export const awards: Award[] = [
  {
    title: 'Webby Award Winner',
    detail: 'NYT × Magic Leap — David Bowie in 3-Dimensions',
  },
];

export const contact = {
  name: 'Chris Williams',
  role: 'Software Engineer',
  email: 'yeah@chriscancodethat.xyz',
  phone: '+1 (305) 632-8102',
  location: 'Miami, FL',
  socials: [
    { label: 'GitHub', href: 'https://github.com/chrisdubya' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/chrisdubya/' },
  ] as Social[],
};
