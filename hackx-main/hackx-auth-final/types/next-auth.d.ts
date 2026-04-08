import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id:              string;
      name?:           string | null;
      email?:          string | null;
      image?:          string | null;
      role:            string;
      phone:           string;
      village:         string;
      age:             string;
      gender:          string;
      bloodGroup:      string;
      conditions:      string;
      specialization:  string;
      hospital:        string;
      storeName:       string;
      villages:        string;
    };
  }

  interface User {
    id:              string;
    role:            string;
    phone?:          string;
    village?:        string;
    age?:            string;
    gender?:         string;
    bloodGroup?:     string;
    conditions?:     string;
    specialization?: string;
    hospital?:       string;
    storeName?:      string;
    villages?:       string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:              string;
    role:            string;
    phone:           string;
    village:         string;
    age:             string;
    gender:          string;
    bloodGroup:      string;
    conditions:      string;
    specialization:  string;
    hospital:        string;
    storeName:       string;
    villages:        string;
    provider:        string;
  }
}
