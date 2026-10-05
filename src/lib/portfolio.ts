import data from "../../data.json";
import type { Portfolio } from "../types/portfolio";

export const portfolio = data as Portfolio;

export const {
  personal_information,
  profile,
  work_experience,
  certifications,
  projects,
  achievements,
  education,
  skills,
} = portfolio;
