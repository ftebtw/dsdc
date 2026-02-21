export const cmsContentQuery = `{
  "siteSettings": coalesce(
    *[_id == "drafts.siteSettings"][0],
    *[_id == "siteSettings"][0]
  ),
  "homePage": coalesce(
    *[_id == "drafts.homePageContent"][0],
    *[_id == "homePageContent"][0]
  ),
  "pricingPage": coalesce(
    *[_id == "drafts.pricingPageContent"][0],
    *[_id == "pricingPageContent"][0]
  ),
  "teamPage": coalesce(
    *[_id == "drafts.teamPageContent"][0]{
      ...,
      coaches[]{
        ...,
        "imageUrl": image.asset->url
      }
    },
    *[_id == "teamPageContent"][0]{
      ...,
      coaches[]{
        ...,
        "imageUrl": image.asset->url
      }
    }
  )
}`;

export const siteSettingsQuery = `coalesce(
  *[_id == "drafts.siteSettings"][0],
  *[_id == "siteSettings"][0]
)`;

export const homePageQuery = `coalesce(
  *[_id == "drafts.homePageContent"][0],
  *[_id == "homePageContent"][0]
)`;

export const pricingPageQuery = `coalesce(
  *[_id == "drafts.pricingPageContent"][0],
  *[_id == "pricingPageContent"][0]
)`;

export const teamPageQuery = `coalesce(
  *[_id == "drafts.teamPageContent"][0]{
    ...,
    coaches[]{
      ...,
      "imageUrl": image.asset->url
    }
  },
  *[_id == "teamPageContent"][0]{
    ...,
    coaches[]{
      ...,
      "imageUrl": image.asset->url
    }
  }
)`;
