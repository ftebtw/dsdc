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
