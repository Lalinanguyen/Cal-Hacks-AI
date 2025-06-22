// Import the JSON data directly
import berkeleyData from './berkeleyData.json';

// --- Configuration ---
const DUPLICATE_CHECK_COLUMN = 'Name'; 
const SORT_BY_COLUMN = 'Name'; 
const SORT_ORDER = 'asc';

/**
 * Data service for managing user data
 */
class DataService {
  constructor() {
    this.data = berkeleyData || [];
  }

  /**
   * Get all users with optional sorting
   */
  getUsers(sortBy = 'rank', sortOrder = 'asc') {
    try {
      let sortedData = [...this.data];

      // Apply sorting
      sortedData.sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];

        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Handle string values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          if (sortOrder === 'asc') {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }

        return 0;
      });

      return sortedData;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  /**
   * Get user by name
   */
  getUserByName(name) {
    return this.data.find(user => user.Name === name);
  }

  /**
   * Get top performers
   */
  getTopPerformers(count = 10) {
    return this.data.slice(0, count);
  }

  /**
   * Search users by name, company, or skills
   */
  searchUsers(query) {
    if (!query) return this.data;

    const searchTerm = query.toLowerCase();
    return this.data.filter(user => 
      user.Name?.toLowerCase().includes(searchTerm) ||
      user.Company?.toLowerCase().includes(searchTerm) ||
      user.Skills?.toLowerCase().includes(searchTerm) ||
      user.Title?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get users by score range
   */
  getUsersByScoreRange(minScore = 0, maxScore = 100) {
    return this.data.filter(user => 
      user.calculatedScore >= minScore && user.calculatedScore <= maxScore
    );
  }

  /**
   * Get statistics about the data
   */
  getStatistics() {
    if (this.data.length === 0) return null;

    const scores = this.data.map(user => user.calculatedScore);
    const companies = this.data.map(user => user.Company).filter(Boolean);
    const locations = this.data.map(user => user.Location).filter(Boolean);

    return {
      totalUsers: this.data.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      uniqueCompanies: [...new Set(companies)].length,
      uniqueLocations: [...new Set(locations)].length,
      topCompanies: this.getTopCompanies(5),
      scoreDistribution: this.getScoreDistribution()
    };
  }

  /**
   * Get top companies by number of employees
   */
  getTopCompanies(count = 5) {
    const companyCounts = {};
    this.data.forEach(user => {
      if (user.Company) {
        companyCounts[user.Company] = (companyCounts[user.Company] || 0) + 1;
      }
    });

    return Object.entries(companyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
      .map(([company, count]) => ({ company, count }));
  }

  /**
   * Get score distribution
   */
  getScoreDistribution() {
    const distribution = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '50-59': 0,
      '40-49': 0,
      '30-39': 0,
      '20-29': 0,
      '10-19': 0,
      '0-9': 0
    };

    this.data.forEach(user => {
      const score = user.calculatedScore;
      if (score >= 90) distribution['90-100']++;
      else if (score >= 80) distribution['80-89']++;
      else if (score >= 70) distribution['70-79']++;
      else if (score >= 60) distribution['60-69']++;
      else if (score >= 50) distribution['50-59']++;
      else if (score >= 40) distribution['40-49']++;
      else if (score >= 30) distribution['30-39']++;
      else if (score >= 20) distribution['20-29']++;
      else if (score >= 10) distribution['10-19']++;
      else distribution['0-9']++;
    });

    return distribution;
  }
}

export default new DataService(); 