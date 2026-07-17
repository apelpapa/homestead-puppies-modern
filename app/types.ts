export type Puppy = {
  id: number;
  name: string;
  breed: string;
  gender: string | null;
  dateOfBirth: string | null;
  mother: string | null;
  father: string | null;
  akcRegistrable: boolean;
  price: number | null;
  images: string[];
};

export type Parent = {
  id: number;
  name: string;
  breed: string;
  gender: string | null;
  dateOfBirth: string | null;
  akcRegistered: boolean;
  championBloodline: boolean;
  description: string | null;
  images: string[];
};

export type PuppiesResponse = { puppies: Puppy[] };
export type ParentsResponse = { parents: Parent[] };
