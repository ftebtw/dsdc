export const cmsContentQuery = `{
  "siteSettings": *[_id == "siteSettings"][0],
  "homePage": *[_id == "homePageContent"][0],
  "pricingPage": *[_id == "pricingPageContent"][0],
  "additionalPage": *[_id == "additionalPageContent"][0],
  "teamPage": *[_id == "teamPageContent"][0]{
    ...,
    coaches[]{
      ...,
      "imageUrl": image.asset->url
    }
  }
}`;

export const siteSettingsQuery = `*[_id == "siteSettings"][0]`;

export const homePageQuery = `*[_id == "homePageContent"][0]`;

export const pricingPageQuery = `*[_id == "pricingPageContent"][0]`;

export const additionalPageQuery = `*[_id == "additionalPageContent"][0]`;

export const teamPageQuery = `*[_id == "teamPageContent"][0]{
  ...,
  coaches[]{
    ...,
    "imageUrl": image.asset->url
  }
}`;
