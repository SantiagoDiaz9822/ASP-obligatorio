import { signOut } from "aws-amplify/auth";
import * as Auth from "aws-amplify/auth";

export async function SignOut() {
    try {
      await signOut();
      console.log("signed out");
    } catch (error) {
      console.log("error signing out: ", error);
    }
  }
 
export async function GetCurrentUserEmail() {
    try {
      const userAttributes = await Auth.fetchUserAttributes();
      return userAttributes["email"];
    } catch (err) {
      console.log(err);
    }
  }

export async function GetAccessToken() {
  try {
    const session = await Auth.fetchAuthSession();
    return session.tokens.accessToken;
  } catch (err) {
    throw new Error(err);
  }
}

export async function getCurrentUserAdmin() {
  try {
    const user = await GetAccessToken();
    const groups = user.payload['cognito:groups'];
    return groups.includes('admin');
  } catch (err) {
    return false;
  }
}