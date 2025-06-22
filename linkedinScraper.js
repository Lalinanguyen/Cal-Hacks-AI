/**
 * linkedinScraper.js
 *
 * This file simulates a backend web scraping service. In a real-world application,
 * this logic would live on a server, be written in a language like Python (with
 * libraries like BeautifulSoup or Puppeteer), and would be called via an API endpoint.
 *
 * Why is this not a real scraper?
 * 1.  **Terms of Service:** Directly scraping LinkedIn's website is against their
 *     Terms of Service and can lead to IP bans or legal action.
 * 2.  **Technical Complexity:** Real web scraping is brittle. It requires handling
 *     logins, managing sessions, and parsing HTML that changes frequently.
 *     It cannot be reliably done from a mobile client.
 * 3.  **Security:** Exposing scraping logic on the client-side is insecure.
 *
 * This simulation provides a robust way to demonstrate the app's functionality
 * without violating ToS or building a complex backend.
 */

// Simulates the detailed profile of Marcus Wong
const marcusWongProfile = {
  summary: `I'm a passionate software engineer and Berkeley student with a strong foundation in full-stack development and machine learning. I love building innovative solutions that solve real-world problems.`,
  experience: [
    {
      title: 'Software Engineer Intern',
      company: 'Anthropic',
      duration: 'Summer 2024',
      description: 'Working on cutting-edge AI and machine learning projects. Contributing to the development of advanced language models and AI safety research.',
    },
    {
      title: 'Software Engineer Intern',
      company: 'SJF Ventures',
      duration: 'Summer 2023',
      description: 'Developed software solutions for venture capital operations and portfolio management. Built tools for data analysis and investment tracking.',
    },
  ],
  education: [
    {
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science in Computer Science',
      duration: '2021 - 2025',
    },
  ],
  skills: ['React Native', 'Python', 'JavaScript', 'Machine Learning', 'Node.js', 'AWS', 'TypeScript', 'Git'],
};

// Simulates a generic profile for any other URL
const janeDoeProfile = {
  summary: `Driven and innovative product manager with a track record of launching successful B2B SaaS products. Skilled in agile methodologies, user research, and cross-functional team leadership.`,
  experience: [
    {
      title: 'Senior Product Manager',
      company: 'Innovate Inc.',
      duration: '2022 - Present',
      description: 'Leading product strategy for the flagship cloud analytics platform. Grew user adoption by 40% in the first year.',
    },
    {
      title: 'Product Manager',
      company: 'Solutions Co.',
      duration: '2019 - 2022',
      description: 'Managed the full product lifecycle for a suite of enterprise productivity tools.',
    },
  ],
  education: [
    {
      school: 'Stanford University',
      degree: 'Master of Business Administration (MBA)',
      duration: '2017 - 2019',
    },
  ],
  skills: ['Product Management', 'Agile Methodologies', 'User Research', 'Go-to-market Strategy', 'JIRA', 'SQL'],
};

/**
 * Simulates fetching and scraping a LinkedIn profile.
 * @param {string} profileUrl The public LinkedIn profile URL.
 * @returns {Promise<object>} A promise that resolves to the scraped profile data.
 */
export const scrapeLinkedInProfile = async (profileUrl) => {
  console.log(`[Scraper] Simulating scraping for URL: ${profileUrl}`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (profileUrl.includes('marcus-mh-wong')) {
    console.log('[Scraper] Matched Marcus Wong. Returning his profile.');
    return marcusWongProfile;
  } else {
    console.log('[Scraper] No specific match. Returning generic Jane Doe profile.');
    return janeDoeProfile;
  }
}; 