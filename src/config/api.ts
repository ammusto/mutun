interface APIConfig {
  API_URL: string;
  API_USER: string;
  API_PASS: string;
  INDEX: string;
}

const validateConfig = (
  url?: string,
  user?: string,
  pass?: string,
  index?: string
): APIConfig => {
  if (!url) throw new Error('API_URL environment variable is not defined');
  if (!user) throw new Error('API_USER environment variable is not defined');
  if (!pass) throw new Error('API_PASS environment variable is not defined');
  if (!index) throw new Error('INDEX environment variable is not defined');

  return {
    API_URL: url,
    API_USER: user,
    API_PASS: pass,
    INDEX: index
  };
};

const config = validateConfig(
  process.env.REACT_APP_API_URL,
  process.env.REACT_APP_API_USER,
  process.env.REACT_APP_API_PASS,
  process.env.REACT_APP_API_INDEX || 'default_index'
);

export const { API_URL, API_USER, API_PASS, INDEX } = config;