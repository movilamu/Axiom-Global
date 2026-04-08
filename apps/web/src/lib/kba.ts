import { USER_PROFILE } from "./constants";

export const KBA_QUESTIONS = [
  {
    id: 0,
    text: "Which of these cities is your registered home address in?",
    answer: () => USER_PROFILE.homeCity,
    distractors: ["Phoenix", "Denver", "Charlotte"],
  },
  {
    id: 1,
    text: "Which of these is closest to your usual monthly transfer amount?",
    answer: () => USER_PROFILE.monthlyTransferBracket,
    distractors: ["Under $500", "$1,000–$2,000", "Over $2,000"],
  },
  {
    id: 2,
    text: "How long have you held your account with us?",
    answer: () => USER_PROFILE.accountAgeBracket,
    distractors: ["Under 1 year", "1–3 years", "Over 5 years"],
  },
  {
    id: 3,
    text: "Which of these devices have you previously used to log in?",
    answer: () => USER_PROFILE.primaryDevice,
    distractors: ["Android", "Desktop", "Tablet"],
  },
  {
    id: 4,
    text: "Which of these is your registered email domain?",
    answer: () => USER_PROFILE.emailDomain,
    distractors: ["@gmail.com", "@yahoo.com", "@outlook.com"],
  },
  {
    id: 5,
    text: "Which of these merchants appears most frequently in your transaction history?",
    answer: () => USER_PROFILE.mostFrequentMerchant,
    distractors: ["Amazon", "Uber Eats", "Harbor Point Grocery"],
  },
  {
    id: 6,
    text: "Which of these best describes your most common transfer recipient?",
    answer: () => USER_PROFILE.primaryRecipientType,
    distractors: ["Friend", "Business", "Utility provider"],
  },
  {
    id: 7,
    text: "What is the first letter of your registered mother's maiden name?",
    answer: () => USER_PROFILE.mothersMaidenNameInitial,
    distractors: ["R", "T", "S"],
  },
  {
    id: 8,
    text: "Which of these countries have you previously transacted with?",
    answer: () => USER_PROFILE.countryTransacted,
    distractors: ["Canada", "Australia", "Germany"],
  },
  {
    id: 9,
    text: "What type of account do you primarily use for transfers?",
    answer: () => "Checking",
    distractors: ["Savings", "Business", "Joint"],
  },
];
