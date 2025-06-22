// Excel Data Service for React Native
// This service handles reading and processing the Excel data from ALLCSDATA.xlsx

// Mock data structure based on the Excel file columns:
// id, name, location, headline, description, title, profile_picture_url, linkedin_url, experience

// Since React Native can't directly read Excel files, we'll create a processed data structure
// that matches the format expected by the ranking system

const processedExcelData = [
  {
    id: 319271,
    Name: "Suchaaver Chahal",
    Title: "Software Engineer | Founder",
    Company: "DiffZero",
    Major: "Computer Science",
    LinkedInConnections: 850,
    Skills: "Software Engineering, Entrepreneurship, Leadership",
    Location: "San Francisco Bay Area",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/v2/C560BAQEt029Id82U_w/company-logo_400_400/company-logo_400_400/0/1635778196368/rally_health_logo?e=1749686400&v=beta&t=SlL3BlkyLs5x6nqxiOA4RWEDZn6jZoiqCMSg16rHDgw",
        title: "Co-Founder",
        company: "DiffZero",
        duration: "Jan 2023 - Present",
        description: "Leading technology strategy and product development for innovative startup"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/v2/C560BAQEt029Id82U_w/company-logo_400_400/company-logo_400_400/0/1635778196368/rally_health_logo?e=1749686400&v=beta&t=SlL3BlkyLs5x6nqxiOA4RWEDZn6jZoiqCMSg16rHDgw",
        title: "Senior Software Engineer",
        company: "Rally Health",
        duration: "Aug 2016 - Oct 2021",
        description: "Developed scalable healthcare software solutions and led technical initiatives"
      }
    ]),
    GraduationYear: "2023",
    ProfileImageURL: "https://media.licdn.com/dms/image/C5603AQGpCs1ryCurqQ/profile-displayphoto-shrink_400_400/0/1585963027679?e=1727308800&v=beta&t=t-4FDh9Pmhtxtan40I67XKkfBHjFgqrBbYgWQGYhJqI",
    LinkedInURL: "https://www.linkedin.com/in/suchaaver-chahal-125b9716a"
  },
  {
    id: 319272,
    Name: "Alex Rodriguez",
    Title: "Machine Learning Engineer",
    Company: "Google",
    Major: "Computer Science",
    LinkedInConnections: 920,
    Skills: "Python, TensorFlow, PyTorch, Deep Learning, NLP",
    Location: "Mountain View, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Machine Learning Engineer",
        company: "Google",
        duration: "Jan 2024 - Present",
        description: "Developing large-scale ML models for Google's core products"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "ML Research Intern",
        company: "OpenAI",
        duration: "Jun 2023 - Sep 2023",
        description: "Researched transformer architectures and attention mechanisms"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/alex-rodriguez"
  },
  {
    id: 319273,
    Name: "Sarah Kim",
    Title: "Product Manager",
    Company: "Meta",
    Major: "Business Administration",
    LinkedInConnections: 780,
    Skills: "Product Strategy, User Research, Analytics, Leadership",
    Location: "Menlo Park, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Product Manager",
        company: "Meta",
        duration: "Mar 2024 - Present",
        description: "Leading product strategy for Facebook's core features"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Associate PM",
        company: "Uber",
        duration: "Jun 2023 - Feb 2024",
        description: "Owned rider experience features and improved customer satisfaction"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/sarah-kim"
  },
  {
    id: 319274,
    Name: "Michael Chen",
    Title: "Data Scientist",
    Company: "Netflix",
    Major: "Statistics",
    LinkedInConnections: 650,
    Skills: "Python, R, SQL, Machine Learning, A/B Testing",
    Location: "Los Gatos, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Data Scientist",
        company: "Netflix",
        duration: "Jan 2024 - Present",
        description: "Building recommendation algorithms and content optimization models"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Data Analyst",
        company: "Spotify",
        duration: "May 2023 - Dec 2023",
        description: "Analyzed user behavior and music preferences data"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/michael-chen"
  },
  {
    id: 319275,
    Name: "Emily Johnson",
    Title: "Frontend Engineer",
    Company: "Apple",
    Major: "Computer Science",
    LinkedInConnections: 720,
    Skills: "React, TypeScript, JavaScript, CSS, UI/UX",
    Location: "Cupertino, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Frontend Engineer",
        company: "Apple",
        duration: "Feb 2024 - Present",
        description: "Building responsive UI components for iOS applications"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "UI Engineer",
        company: "Airbnb",
        duration: "May 2023 - Jan 2024",
        description: "Developed design system components and maintained code quality"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/emily-johnson"
  },
  {
    id: 319276,
    Name: "David Wang",
    Title: "Backend Engineer",
    Company: "Amazon",
    Major: "Computer Science",
    LinkedInConnections: 890,
    Skills: "Java, Spring Boot, AWS, Microservices, SQL",
    Location: "Seattle, WA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Backend Engineer",
        company: "Amazon",
        duration: "Apr 2024 - Present",
        description: "Building scalable microservices for Amazon's e-commerce platform"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Software Engineer",
        company: "Microsoft",
        duration: "Jul 2023 - Mar 2024",
        description: "Developed Azure-based cloud solutions and APIs"
      }
    ]),
    GraduationYear: "2023",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/david-wang"
  },
  {
    id: 319277,
    Name: "Jessica Lee",
    Title: "DevOps Engineer",
    Company: "Microsoft",
    Major: "Computer Science",
    LinkedInConnections: 680,
    Skills: "Docker, Kubernetes, Azure, CI/CD, Python",
    Location: "Redmond, WA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "DevOps Engineer",
        company: "Microsoft",
        duration: "Mar 2024 - Present",
        description: "Managing cloud infrastructure and implementing CI/CD pipelines"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Cloud Engineer",
        company: "Google",
        duration: "Aug 2023 - Feb 2024",
        description: "Designed and implemented GCP-based solutions"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/jessica-lee"
  },
  {
    id: 319278,
    Name: "Ryan Thompson",
    Title: "UX Designer",
    Company: "Adobe",
    Major: "Design",
    LinkedInConnections: 750,
    Skills: "Figma, Sketch, User Research, Prototyping, Design Systems",
    Location: "San Jose, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "UX Designer",
        company: "Adobe",
        duration: "Jan 2024 - Present",
        description: "Designing user interfaces for Adobe Creative Suite applications"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Product Designer",
        company: "IDEO",
        duration: "Jun 2023 - Dec 2023",
        description: "Led design thinking workshops and created innovative product concepts"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/ryan-thompson"
  },
  {
    id: 319279,
    Name: "Maria Garcia",
    Title: "Security Engineer",
    Company: "Palantir",
    Major: "Computer Science",
    LinkedInConnections: 820,
    Skills: "Cybersecurity, Python, Network Security, Penetration Testing",
    Location: "Palo Alto, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Security Engineer",
        company: "Palantir",
        duration: "Feb 2024 - Present",
        description: "Implementing security protocols and threat detection systems"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Security Analyst",
        company: "CrowdStrike",
        duration: "May 2023 - Jan 2024",
        description: "Analyzed security threats and developed incident response procedures"
      }
    ]),
    GraduationYear: "2023",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/maria-garcia"
  },
  {
    id: 319280,
    Name: "Alex Kumar",
    Title: "Quantitative Analyst",
    Company: "Goldman Sachs",
    Major: "Mathematics",
    LinkedInConnections: 950,
    Skills: "Python, R, Financial Modeling, Statistics, Risk Management",
    Location: "New York, NY",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Quantitative Analyst",
        company: "Goldman Sachs",
        duration: "Jan 2024 - Present",
        description: "Developing quantitative models for risk assessment and trading strategies"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Risk Analyst",
        company: "Morgan Stanley",
        duration: "Jun 2023 - Dec 2023",
        description: "Analyzed market risks and developed risk management frameworks"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/alex-kumar"
  },
  {
    id: 319281,
    Name: "Sophie Wilson",
    Title: "Research Scientist",
    Company: "DeepMind",
    Major: "Computer Science",
    LinkedInConnections: 780,
    Skills: "Python, PyTorch, Research, Machine Learning, AI Ethics",
    Location: "London, UK",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Research Scientist",
        company: "DeepMind",
        duration: "Mar 2024 - Present",
        description: "Conducting cutting-edge research in artificial intelligence and machine learning"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Research Intern",
        company: "Stanford AI Lab",
        duration: "Sep 2023 - Feb 2024",
        description: "Researched transformer architectures and published papers in top conferences"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/sophie-wilson"
  },
  {
    id: 319282,
    Name: "Kevin Zhang",
    Title: "Blockchain Developer",
    Company: "Coinbase",
    Major: "Computer Science",
    LinkedInConnections: 650,
    Skills: "Solidity, Ethereum, Web3, Smart Contracts, DeFi",
    Location: "San Francisco, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Blockchain Developer",
        company: "Coinbase",
        duration: "Jan 2024 - Present",
        description: "Developing smart contracts and DeFi protocols for cryptocurrency platform"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Web3 Developer",
        company: "OpenSea",
        duration: "May 2023 - Dec 2023",
        description: "Built NFT marketplace features and smart contract integrations"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/kevin-zhang"
  },
  {
    id: 319283,
    Name: "Lisa Park",
    Title: "Technical Program Manager",
    Company: "Salesforce",
    Major: "Engineering Management",
    LinkedInConnections: 720,
    Skills: "Project Management, Agile, Technical Leadership, Cross-functional Coordination",
    Location: "San Francisco, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Technical Program Manager",
        company: "Salesforce",
        duration: "Feb 2024 - Present",
        description: "Leading technical programs and coordinating cross-functional teams"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Product Manager",
        company: "Slack",
        duration: "Jun 2023 - Jan 2024",
        description: "Managed product roadmap and led feature development initiatives"
      }
    ]),
    GraduationYear: "2023",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/lisa-park"
  },
  {
    id: 319284,
    Name: "Daniel Brown",
    Title: "Game Developer",
    Company: "Riot Games",
    Major: "Computer Science",
    LinkedInConnections: 680,
    Skills: "Unity, C#, Game Development, 3D Graphics, Game Design",
    Location: "Los Angeles, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Game Developer",
        company: "Riot Games",
        duration: "Mar 2024 - Present",
        description: "Developing gameplay mechanics and features for popular video games"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Game Programmer",
        company: "Electronic Arts",
        duration: "May 2023 - Feb 2024",
        description: "Implemented game systems and optimized performance for AAA titles"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/daniel-brown"
  },
  {
    id: 319285,
    Name: "Rachel Green",
    Title: "Data Engineer",
    Company: "Uber",
    Major: "Computer Science",
    LinkedInConnections: 750,
    Skills: "Python, Spark, SQL, Data Pipelines, ETL",
    Location: "San Francisco, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Data Engineer",
        company: "Uber",
        duration: "Jan 2024 - Present",
        description: "Building scalable data pipelines and infrastructure for ride-sharing platform"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Data Analyst",
        company: "Lyft",
        duration: "Jun 2023 - Dec 2023",
        description: "Analyzed transportation data and built reporting dashboards"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/rachel-green"
  },
  {
    id: 319286,
    Name: "Tom Anderson",
    Title: "Cloud Architect",
    Company: "Oracle",
    Major: "Computer Science",
    LinkedInConnections: 820,
    Skills: "AWS, Azure, GCP, Cloud Architecture, Infrastructure as Code",
    Location: "Austin, TX",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Cloud Architect",
        company: "Oracle",
        duration: "Feb 2024 - Present",
        description: "Designing cloud-native architectures and migration strategies"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Solutions Architect",
        company: "IBM",
        duration: "May 2023 - Jan 2024",
        description: "Designed enterprise solutions and cloud migration strategies"
      }
    ]),
    GraduationYear: "2023",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/tom-anderson"
  },
  {
    id: 319287,
    Name: "Nina Patel",
    Title: "AI Ethics Researcher",
    Company: "Stanford",
    Major: "Computer Science",
    LinkedInConnections: 650,
    Skills: "AI Ethics, Research, Policy, Machine Learning, Social Impact",
    Location: "Stanford, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "AI Ethics Researcher",
        company: "Stanford",
        duration: "Jan 2024 - Present",
        description: "Researching ethical implications of AI and developing responsible AI frameworks"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Research Assistant",
        company: "UC Berkeley",
        duration: "Sep 2023 - Dec 2023",
        description: "Conducted research on algorithmic bias and fairness in machine learning"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/nina-patel"
  },
  {
    id: 319288,
    Name: "Chris Martinez",
    Title: "Robotics Engineer",
    Company: "Boston Dynamics",
    Major: "Mechanical Engineering",
    LinkedInConnections: 780,
    Skills: "Robotics, Control Systems, Computer Vision, Python, ROS",
    Location: "Boston, MA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Robotics Engineer",
        company: "Boston Dynamics",
        duration: "Mar 2024 - Present",
        description: "Developing advanced robotics systems and autonomous navigation algorithms"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Control Systems Engineer",
        company: "Tesla",
        duration: "Jun 2023 - Feb 2024",
        description: "Worked on autonomous vehicle control systems and sensor fusion"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/chris-martinez"
  },
  {
    id: 319289,
    Name: "Amanda Foster",
    Title: "Bioinformatics Scientist",
    Company: "23andMe",
    Major: "Bioinformatics",
    LinkedInConnections: 720,
    Skills: "Python, R, Genomics, Machine Learning, Statistical Analysis",
    Location: "Mountain View, CA",
    Experience: JSON.stringify([
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Bioinformatics Scientist",
        company: "23andMe",
        duration: "Jan 2024 - Present",
        description: "Analyzing genetic data and developing algorithms for personalized medicine"
      },
      {
        company_logo: "https://media.licdn.com/dms/image/C560BAQHhqXgKqXqXqQ/company-logo_400_400/0/1234567890?e=1727308800&v=beta&t=example",
        title: "Research Scientist",
        company: "Genentech",
        duration: "May 2023 - Dec 2023",
        description: "Conducted research on drug discovery and genetic disease mechanisms"
      }
    ]),
    GraduationYear: "2024",
    ProfileImageURL: null,
    LinkedInURL: "https://www.linkedin.com/in/amanda-foster"
  }
];

// Function to get all Excel data
export const getExcelData = () => {
  return processedExcelData;
};

// Function to get top N students from Excel data
export const getTopStudentsFromExcel = (limit = 19) => {
  // Sort by LinkedIn connections (as a proxy for network strength)
  const sortedData = [...processedExcelData].sort((a, b) => 
    (b.LinkedInConnections || 0) - (a.LinkedInConnections || 0)
  );
  
  return sortedData.slice(0, limit);
};

// Function to clean and format Excel data for ranking
export const cleanExcelDataForRanking = (data) => {
  return data.map(student => ({
    Name: student.Name || 'Unknown',
    Title: student.Title || 'Student',
    Company: student.Company || student.Major || 'UC Berkeley',
    LinkedInConnections: student.LinkedInConnections || 0,
    Skills: student.Skills || '',
    Location: student.Location || '',
    Experience: student.Experience || '',
    GraduationYear: student.GraduationYear || '',
    ProfileImageURL: student.ProfileImageURL || '',
    LinkedInURL: student.LinkedInURL || '',
    // Add scoring fields for compatibility with existing ranking system
    Score: calculateStudentScore(student),
    Rank: 0 // Will be set by ranking algorithm
  }));
};

// Calculate a score for each student based on various factors
const calculateStudentScore = (student) => {
  let score = 0;
  
  // Base score from LinkedIn connections (0-50 points)
  const connections = student.LinkedInConnections || 0;
  score += Math.min(connections / 20, 50);
  
  // Company prestige bonus (0-30 points)
  const prestigiousCompanies = ['Google', 'Meta', 'Apple', 'Amazon', 'Microsoft', 'Netflix', 'OpenAI', 'DeepMind', 'Palantir'];
  if (prestigiousCompanies.some(company => 
    (student.Company || '').toLowerCase().includes(company.toLowerCase())
  )) {
    score += 30;
  }
  
  // Skills diversity bonus (0-20 points)
  const skills = student.Skills || '';
  const skillCount = skills.split(',').length;
  score += Math.min(skillCount * 2, 20);
  
  return Math.round(score);
};

// Function to get students for Claude ranking (top 19 + user profile)
export const getStudentsForClaudeRanking = (userProfile, limit = 19) => {
  const topStudents = getTopStudentsFromExcel(limit);
  const cleanedStudents = cleanExcelDataForRanking(topStudents);
  
  // Add user profile if not already in the list
  if (userProfile) {
    const userInList = cleanedStudents.some(student => 
      student.Name.toLowerCase() === userProfile.Name?.toLowerCase()
    );
    
    if (!userInList) {
      const userAsStudent = {
        Name: userProfile.Name || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User',
        Title: userProfile.Title || userProfile.headline || 'Student',
        Company: userProfile.Company || userProfile.major || 'UC Berkeley',
        LinkedInConnections: userProfile.LinkedInConnections || userProfile.connections || 0,
        Skills: Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : (userProfile.skills || ''),
        Location: userProfile.Location || userProfile.location || '',
        Experience: Array.isArray(userProfile.experience) 
          ? JSON.stringify(userProfile.experience.map(e => ({
              title: e.text || e.title || '',
              company: e.company || '',
              duration: e.duration || '',
              description: e.description || ''
            })))
          : '',
        GraduationYear: userProfile.GraduationYear || userProfile.graduationYear || '',
        ProfileImageURL: userProfile.ProfileImageURL || userProfile.profilePicture || '',
        LinkedInURL: userProfile.LinkedInURL || '',
        Score: calculateStudentScore({
          LinkedInConnections: userProfile.LinkedInConnections || userProfile.connections || 0,
          Company: userProfile.Company || userProfile.major || '',
          Skills: Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : (userProfile.skills || '')
        }),
        Rank: 0
      };
      cleanedStudents.push(userAsStudent);
    }
  }
  
  return cleanedStudents;
}; 