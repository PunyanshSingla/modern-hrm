export interface Technology {
  id: string;
  name: string;
  category: string;
  icon?: string; // URL to icon or fallback
  iconFallbacks?: string[]; // Array of fallback icon URLs
}

// Icon URLs from multiple sources with fallbacks
const getIconUrls = (name: string, alternatives: string[] = []) => {
  const primary = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`;
  const fallbacks = [
    `https://cdn.simpleicons.org/${name}`,
    `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${name}.svg`,
    ...alternatives
  ];
  return { icon: primary, iconFallbacks: fallbacks };
};

export const technologies: Technology[] = [
  // Frontend
  { id: 'react', name: 'React', category: 'Frontend', ...getIconUrls('react') },
  { id: 'vue', name: 'Vue.js', category: 'Frontend', ...getIconUrls('vuejs', ['https://cdn.simpleicons.org/vuedotjs']) },
  { id: 'angular', name: 'Angular', category: 'Frontend', ...getIconUrls('angularjs', ['https://cdn.simpleicons.org/angular']) },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', ...getIconUrls('nextjs', ['https://cdn.simpleicons.org/nextdotjs']) },
  { id: 'svelte', name: 'Svelte', category: 'Frontend', ...getIconUrls('svelte') },
  { id: 'html', name: 'HTML', category: 'Frontend', ...getIconUrls('html5') },
  { id: 'css', name: 'CSS', category: 'Frontend', ...getIconUrls('css3') },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend', ...getIconUrls('tailwindcss') },
  { id: 'bootstrap', name: 'Bootstrap', category: 'Frontend', ...getIconUrls('bootstrap') },
  { id: 'sass', name: 'Sass', category: 'Frontend', ...getIconUrls('sass') },
  
  // Backend
  { id: 'nodejs', name: 'Node.js', category: 'Backend', ...getIconUrls('nodejs', ['https://cdn.simpleicons.org/nodedotjs']) },
  { id: 'express', name: 'Express.js', category: 'Backend', ...getIconUrls('express') },
  { id: 'nestjs', name: 'NestJS', category: 'Backend', ...getIconUrls('nestjs') },
  { id: 'django', name: 'Django', category: 'Backend', ...getIconUrls('django') },
  { id: 'flask', name: 'Flask', category: 'Backend', ...getIconUrls('flask') },
  { id: 'spring', name: 'Spring Boot', category: 'Backend', ...getIconUrls('spring', ['https://cdn.simpleicons.org/springboot']) },
  { id: 'dotnet', name: '.NET', category: 'Backend', ...getIconUrls('dot-net', ['https://cdn.simpleicons.org/dotnet']) },
  { id: 'laravel', name: 'Laravel', category: 'Backend', ...getIconUrls('laravel') },
  { id: 'rails', name: 'Ruby on Rails', category: 'Backend', ...getIconUrls('rails', ['https://cdn.simpleicons.org/rubyonrails']) },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend', ...getIconUrls('fastapi') },
  
  // Languages
  { id: 'javascript', name: 'JavaScript', category: 'Language', ...getIconUrls('javascript') },
  { id: 'typescript', name: 'TypeScript', category: 'Language', ...getIconUrls('typescript') },
  { id: 'python', name: 'Python', category: 'Language', ...getIconUrls('python') },
  { id: 'java', name: 'Java', category: 'Language', ...getIconUrls('java') },
  { id: 'csharp', name: 'C#', category: 'Language', ...getIconUrls('csharp') },
  { id: 'go', name: 'Go', category: 'Language', ...getIconUrls('go', ['https://cdn.simpleicons.org/go']) },
  { id: 'rust', name: 'Rust', category: 'Language', ...getIconUrls('rust') },
  { id: 'php', name: 'PHP', category: 'Language', ...getIconUrls('php') },
  { id: 'ruby', name: 'Ruby', category: 'Language', ...getIconUrls('ruby') },
  { id: 'kotlin', name: 'Kotlin', category: 'Language', ...getIconUrls('kotlin') },
  { id: 'swift', name: 'Swift', category: 'Language', ...getIconUrls('swift') },
  
  // Databases
  { id: 'mongodb', name: 'MongoDB', category: 'Database', ...getIconUrls('mongodb') },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', ...getIconUrls('postgresql') },
  { id: 'mysql', name: 'MySQL', category: 'Database', ...getIconUrls('mysql') },
  { id: 'redis', name: 'Redis', category: 'Database', ...getIconUrls('redis') },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'Database', ...getIconUrls('elasticsearch') },
  { id: 'firebase', name: 'Firebase', category: 'Database', ...getIconUrls('firebase') },
  { id: 'supabase', name: 'Supabase', category: 'Database', ...getIconUrls('supabase') },
  { id: 'dynamodb', name: 'DynamoDB', category: 'Database', icon: 'https://cdn.simpleicons.org/amazondynamodb', iconFallbacks: [] },
  { id: 'cassandra', name: 'Cassandra', category: 'Database', ...getIconUrls('cassandra', ['https://cdn.simpleicons.org/apachecassandra']) },
  
  // Cloud & DevOps
  { id: 'aws', name: 'AWS', category: 'Cloud', icon: 'https://cdn.simpleicons.org/amazonaws', iconFallbacks: ['https://cdn.simpleicons.org/amazonwebservices'] },
  { id: 'azure', name: 'Azure', category: 'Cloud', icon: 'https://cdn.simpleicons.org/microsoftazure', iconFallbacks: [] },
  { id: 'gcp', name: 'Google Cloud', category: 'Cloud', icon: 'https://cdn.simpleicons.org/googlecloud', iconFallbacks: [] },
  { id: 'docker', name: 'Docker', category: 'DevOps', ...getIconUrls('docker') },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps', ...getIconUrls('kubernetes') },
  { id: 'jenkins', name: 'Jenkins', category: 'DevOps', ...getIconUrls('jenkins') },
  { id: 'gitlab', name: 'GitLab CI/CD', category: 'DevOps', ...getIconUrls('gitlab') },
  { id: 'github-actions', name: 'GitHub Actions', category: 'DevOps', icon: 'https://cdn.simpleicons.org/githubactions', iconFallbacks: [] },
  { id: 'terraform', name: 'Terraform', category: 'DevOps', ...getIconUrls('terraform') },
  { id: 'ansible', name: 'Ansible', category: 'DevOps', ...getIconUrls('ansible') },
  
  // Tools
  { id: 'git', name: 'Git', category: 'Tool', ...getIconUrls('git') },
  { id: 'vscode', name: 'VS Code', category: 'Tool', icon: 'https://cdn.simpleicons.org/visualstudiocode', iconFallbacks: [] },
  { id: 'postman', name: 'Postman', category: 'Tool', ...getIconUrls('postman') },
  { id: 'figma', name: 'Figma', category: 'Tool', ...getIconUrls('figma') },
  { id: 'jira', name: 'Jira', category: 'Tool', ...getIconUrls('jira') },
  { id: 'slack', name: 'Slack', category: 'Tool', ...getIconUrls('slack') },
  { id: 'notion', name: 'Notion', category: 'Tool', icon: 'https://cdn.simpleicons.org/notion', iconFallbacks: [] },
  { id: 'trello', name: 'Trello', category: 'Tool', ...getIconUrls('trello') },
  
  // Mobile
  { id: 'react-native', name: 'React Native', category: 'Mobile', ...getIconUrls('react') },
  { id: 'flutter', name: 'Flutter', category: 'Mobile', ...getIconUrls('flutter') },
  { id: 'ionic', name: 'Ionic', category: 'Mobile', icon: 'https://cdn.simpleicons.org/ionic', iconFallbacks: [] },
  { id: 'xamarin', name: 'Xamarin', category: 'Mobile', icon: 'https://cdn.simpleicons.org/xamarin', iconFallbacks: [] },
  
  // Testing
  { id: 'jest', name: 'Jest', category: 'Testing', ...getIconUrls('jest') },
  { id: 'cypress', name: 'Cypress', category: 'Testing', icon: 'https://cdn.simpleicons.org/cypress', iconFallbacks: [] },
  { id: 'selenium', name: 'Selenium', category: 'Testing', ...getIconUrls('selenium') },
  { id: 'pytest', name: 'Pytest', category: 'Testing', ...getIconUrls('pytest') },
  
  // Other
  { id: 'graphql', name: 'GraphQL', category: 'API', ...getIconUrls('graphql') },
  { id: 'rest', name: 'REST API', category: 'API', icon: 'https://cdn.simpleicons.org/openapi', iconFallbacks: [] },
  { id: 'websocket', name: 'WebSocket', category: 'API', icon: 'https://cdn.simpleicons.org/socketdotio', iconFallbacks: [] },
  { id: 'grpc', name: 'gRPC', category: 'API', icon: 'https://cdn.simpleicons.org/grpc', iconFallbacks: [] },
];

export const getTechnologyById = (id: string): Technology | undefined => {
  return technologies.find(tech => tech.id === id);
};

export const getTechnologiesByCategory = (category: string): Technology[] => {
  return technologies.filter(tech => tech.category === category);
};

export const searchTechnologies = (query: string): Technology[] => {
  const lowerQuery = query.toLowerCase();
  return technologies.filter(tech => 
    tech.name.toLowerCase().includes(lowerQuery) || 
    tech.category.toLowerCase().includes(lowerQuery)
  );
};
