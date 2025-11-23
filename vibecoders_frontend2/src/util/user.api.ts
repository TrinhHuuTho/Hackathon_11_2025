import axios from "./axios.customize";

export interface PersonalRequest {
  numberOfYears: number;
  major: string;
  favoriteTopics: string[];
  interestedTopics: string[];
}

const USER_API = "/api/users";

const onboardingUser = async (request: PersonalRequest) => {
  try {
    const callOnboardingUser = await axios.post(
      `${USER_API}/onboarding`,
      request
    );
    return callOnboardingUser.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export default {
  onboardingUser,
};
