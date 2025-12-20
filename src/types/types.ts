// biography
export type TItem = {
  _id?: string;
  action?: "add" | "update" | "delete";
  itemTitle: string;
  itemDescription: string;
  updatedAt: string;
};

export type TBiography = {
  _id: string;
  imageUrl: string;
  title: string;
  shortDescription: string;
  items: TItem[];
  updatedAt: string;
};

export type THeroSection = {
  _id: string;
  category: string;
  title: string;
  subTitle: string;
  bgImageForLg: string;
  bgImageForSm: string;
  updatedAt: string;
};

export type TJourneyToPolitics = {
  _id: string;
  title: string;
  shortDescription: string;
  createdAt: string;
};

export type TPhoto = {
  _id?: string;
  imageUrl: string;
  folder: string;
};

export type TVideo = {
  _id: string;
  folder: string;
  videoUrl: string; 
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type TEvent = {
  _id: string;
  imageUrl: string;
  title: string;
  location: string;
  shortDescription: string;
  description: string;
  date: string;
  createdAt: string;
};

export type TArticle = {
  _id: string;
  imageUrl: string;
  title: string;
  shortDescription: string;
  description: string;
  publishedDate: string;
  createdAt: string;
};

export type TGallery = {
  _id: string;
  imageUrl: string;
  title: string;
  date: string;
  createdAt: string;
};

export type TVoiceOnMedia = {
  _id: string;
  videoUrl: string;
  title: string;
  // date: string;
  createdAt: string;
};

export type TBanner = {
  name: string;
  designation: string;
  imageUrl: string;
  // partyname: string;
  updatedAt: string;
};
export type TConcernIssues = {
  issue1: string;
  issue2: string;
  issue3: string;
  issue4: string;
  issue5: string;
  issue6: string;
};
export type TOurConcernIssue = {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  ourConcernIssues: TConcernIssues;
  createdAt: string;
};
export type TWhoWeAre = {
  _id: string;
  title: string;
  description: string;
  videourl: string;
  updatedAt: string;
};

export type TElectionCampaign = {
  title: string;
  description: string;
  bgImageUrl: string;
  constituency: string;
  electionDate: Date;
  createdAt: string;
};

export type TMission = {
  title: string;
  description: string;
  imageUrl: string;
  updatedAt: string;
};
export type TVision = {
  title: string;
  description: string;
  imageUrl: string;
  updatedAt: string;
};
export type TCompany = {
  companyName: string;
  title: string;
  address: string;
  phone: string;
  email: string;
  websiteUrl: string;
  bgImageUrl: string;
  logoUrl: string;
  updatedAt: string;
};

export type TContact = {
  address: string;
  phone: string;
  email: string;
  bgImageUrl: string;
  updatedAt: string;
  facebookUrl: string;
  youTubeUrl: string;
  LinkedInUrl: string;
};

export type TFeatures = {
  _id: string;
  logo: string;
  banner: TBanner;
  whoWeAre: TWhoWeAre;
  ourConcernIssue: TOurConcernIssue;
  electionCampaign: TElectionCampaign;
  homepageArticleBG: string;
  mission: TMission;
  vision: TVision;
  company: TCompany;
  contact: TContact;
  createdAt: string;
};
