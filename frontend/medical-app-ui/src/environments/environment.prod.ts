// Production environment — API URL points to DigitalOcean Droplet via Nginx
// Update YOURDOMAIN.com to your actual domain before deploying
export const environment = {
  production: true,
  apiUrl: 'https://api.YOURDOMAIN.com/api/v1',
  apiGateway: 'https://api.YOURDOMAIN.com'
};
