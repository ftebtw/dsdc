export const cmsContentQuery = `{
  "siteSettings": *[_type == "siteSettings"][0],
  "homePage": *[_type == "homePageContent"][0],
  "pricingPage": *[_type == "pricingPageContent"][0],
  "teamPage": *[_type == "teamPageContent"][0]{
    ...,
    coaches[]{
      ...,
      "imageUrl": image.asset->url
    }
  }
}`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0]`;
export const homePageQuery = `*[_type == "homePageContent"][0]`;
export const pricingPageQuery = `*[_type == "pricingPageContent"][0]`;
export const teamPageQuery = `*[_type == "teamPageContent"][0]{
  ...,
  coaches[]{
    ...,
    "imageUrl": image.asset->url
  }
}`;
