export interface Skill {
  id: string;
  name: string;
  category: string;
}

export const skills: Skill[] = [
  // Programming Languages
  { id: 'javascript', name: 'JavaScript', category: 'Programming Languages' },
  { id: 'typescript', name: 'TypeScript', category: 'Programming Languages' },
  { id: 'python', name: 'Python', category: 'Programming Languages' },
  { id: 'java', name: 'Java', category: 'Programming Languages' },
  { id: 'csharp', name: 'C#', category: 'Programming Languages' },
  { id: 'cpp', name: 'C++', category: 'Programming Languages' },
  { id: 'go', name: 'Go', category: 'Programming Languages' },
  { id: 'rust', name: 'Rust', category: 'Programming Languages' },
  { id: 'php', name: 'PHP', category: 'Programming Languages' },
  { id: 'ruby', name: 'Ruby', category: 'Programming Languages' },
  { id: 'swift', name: 'Swift', category: 'Programming Languages' },
  { id: 'kotlin', name: 'Kotlin', category: 'Programming Languages' },
  { id: 'scala', name: 'Scala', category: 'Programming Languages' },
  { id: 'r', name: 'R', category: 'Programming Languages' },
  
  // Frontend Frameworks & Libraries
  { id: 'react', name: 'React', category: 'Frontend' },
  { id: 'angular', name: 'Angular', category: 'Frontend' },
  { id: 'vue', name: 'Vue.js', category: 'Frontend' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend' },
  { id: 'svelte', name: 'Svelte', category: 'Frontend' },
  { id: 'html', name: 'HTML5', category: 'Frontend' },
  { id: 'css', name: 'CSS3', category: 'Frontend' },
  { id: 'sass', name: 'SASS/SCSS', category: 'Frontend' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend' },
  { id: 'bootstrap', name: 'Bootstrap', category: 'Frontend' },
  { id: 'redux', name: 'Redux', category: 'Frontend' },
  { id: 'webpack', name: 'Webpack', category: 'Frontend' },
  
  // Backend Frameworks
  { id: 'nodejs', name: 'Node.js', category: 'Backend' },
  { id: 'express', name: 'Express.js', category: 'Backend' },
  { id: 'nestjs', name: 'NestJS', category: 'Backend' },
  { id: 'django', name: 'Django', category: 'Backend' },
  { id: 'flask', name: 'Flask', category: 'Backend' },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend' },
  { id: 'spring', name: 'Spring Boot', category: 'Backend' },
  { id: 'dotnet', name: '.NET Core', category: 'Backend' },
  { id: 'rails', name: 'Ruby on Rails', category: 'Backend' },
  { id: 'laravel', name: 'Laravel', category: 'Backend' },
  
  // Databases
  { id: 'mysql', name: 'MySQL', category: 'Databases' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases' },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases' },
  { id: 'redis', name: 'Redis', category: 'Databases' },
  { id: 'elasticsearch', name: 'Elasticsearch', category: 'Databases' },
  { id: 'cassandra', name: 'Cassandra', category: 'Databases' },
  { id: 'dynamodb', name: 'DynamoDB', category: 'Databases' },
  { id: 'oracle', name: 'Oracle DB', category: 'Databases' },
  { id: 'mssql', name: 'MS SQL Server', category: 'Databases' },
  { id: 'sqlite', name: 'SQLite', category: 'Databases' },
  
  // Cloud & DevOps
  { id: 'aws', name: 'AWS', category: 'Cloud & DevOps' },
  { id: 'azure', name: 'Azure', category: 'Cloud & DevOps' },
  { id: 'gcp', name: 'Google Cloud', category: 'Cloud & DevOps' },
  { id: 'docker', name: 'Docker', category: 'Cloud & DevOps' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'Cloud & DevOps' },
  { id: 'jenkins', name: 'Jenkins', category: 'Cloud & DevOps' },
  { id: 'gitlab-ci', name: 'GitLab CI/CD', category: 'Cloud & DevOps' },
  { id: 'github-actions', name: 'GitHub Actions', category: 'Cloud & DevOps' },
  { id: 'terraform', name: 'Terraform', category: 'Cloud & DevOps' },
  { id: 'ansible', name: 'Ansible', category: 'Cloud & DevOps' },
  { id: 'nginx', name: 'Nginx', category: 'Cloud & DevOps' },
  
  // Mobile Development
  { id: 'react-native', name: 'React Native', category: 'Mobile' },
  { id: 'flutter', name: 'Flutter', category: 'Mobile' },
  { id: 'android', name: 'Android Development', category: 'Mobile' },
  { id: 'ios', name: 'iOS Development', category: 'Mobile' },
  { id: 'xamarin', name: 'Xamarin', category: 'Mobile' },
  
  // Data Science & ML
  { id: 'tensorflow', name: 'TensorFlow', category: 'Data Science & ML' },
  { id: 'pytorch', name: 'PyTorch', category: 'Data Science & ML' },
  { id: 'scikit-learn', name: 'Scikit-learn', category: 'Data Science & ML' },
  { id: 'pandas', name: 'Pandas', category: 'Data Science & ML' },
  { id: 'numpy', name: 'NumPy', category: 'Data Science & ML' },
  { id: 'keras', name: 'Keras', category: 'Data Science & ML' },
  { id: 'opencv', name: 'OpenCV', category: 'Data Science & ML' },
  
  // Testing
  { id: 'jest', name: 'Jest', category: 'Testing' },
  { id: 'mocha', name: 'Mocha', category: 'Testing' },
  { id: 'pytest', name: 'Pytest', category: 'Testing' },
  { id: 'junit', name: 'JUnit', category: 'Testing' },
  { id: 'selenium', name: 'Selenium', category: 'Testing' },
  { id: 'cypress', name: 'Cypress', category: 'Testing' },
  
  // Version Control & Tools
  { id: 'git', name: 'Git', category: 'Tools' },
  { id: 'github', name: 'GitHub', category: 'Tools' },
  { id: 'gitlab', name: 'GitLab', category: 'Tools' },
  { id: 'jira', name: 'Jira', category: 'Tools' },
  { id: 'postman', name: 'Postman', category: 'Tools' },
  { id: 'vscode', name: 'VS Code', category: 'Tools' },
  
  // Other
  { id: 'graphql', name: 'GraphQL', category: 'APIs' },
  { id: 'rest', name: 'REST APIs', category: 'APIs' },
  { id: 'grpc', name: 'gRPC', category: 'APIs' },
  { id: 'microservices', name: 'Microservices', category: 'Architecture' },
  { id: 'serverless', name: 'Serverless', category: 'Architecture' },
  { id: 'websockets', name: 'WebSockets', category: 'Real-time' },
  { id: 'rabbitmq', name: 'RabbitMQ', category: 'Message Queues' },
  { id: 'kafka', name: 'Apache Kafka', category: 'Message Queues' },
];
