import { CLAUDE_API_KEY, LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET } from '@env';

export const config = {
  CLAUDE_API_KEY: CLAUDE_API_KEY || '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',
};

// Export LinkedIn credentials separately for direct import
export const CLIENT_ID = LINKEDIN_CLIENT_ID || '86oooqmr9lq9yx';
export const CLIENT_SECRET = LINKEDIN_CLIENT_SECRET || 'WPL_AP1.jc81D0BMBFHTLZN6.ec2oKg=='; 