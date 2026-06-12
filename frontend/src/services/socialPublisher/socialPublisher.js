import { publishToFacebook } from './facebookService';
import { publishToInstagram } from './instagramService';
import { publishToTwitter } from './twitterService';

export async function socialPublishAll({ creative }) {
  const [instagram, facebook, twitter] = await Promise.all([
    publishToInstagram(creative),
    publishToFacebook(creative),
    publishToTwitter(creative)
  ]);

  return { instagram, facebook, twitter };
}

