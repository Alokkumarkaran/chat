const webpush = require('web-push');

const initVapid = () => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    console.warn('VAPID keys are not set in env. Push will not work until configured.');
    return;
  }
  webpush.setVapidDetails('mailto:admin@skillchat.local', publicKey, privateKey);
};

module.exports = initVapid;
