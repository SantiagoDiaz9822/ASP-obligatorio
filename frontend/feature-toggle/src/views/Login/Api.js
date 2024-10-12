import { signUp, signIn, signOut, getCurrentUser } from "aws-amplify/auth";
import * as Auth from "aws-amplify/auth";
import { Amplify } from "aws-amplify";
import { defaultStorage } from "aws-amplify/utils";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import axios from "axios";
import { ROUTES, URL_BACKEND } from "../../config/routing";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.REACT_APP_USER_POOL_ID,
      userPoolClientId: process.env.REACT_APP_CLIENT_ID,
    },
  },
});

// https://docs.amplify.aws/react/build-a-backend/auth/manage-user-session/#update-your-token-saving-mechanism
cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage);

export const SignUp = async (token, email, password) => {
  try {
    const response = await checkSignUp(token, email);
    if (response.status === "completed") {
      try {
        const { isSignUpComplete, userId, nextStep } = await signUp({
          username: email,
          password: password,
          options: {
            userAttributes: {
              email,
            },
          },
        });
        if (isSignUpComplete) {
          console.log("sign up complete");
          await SignIn(email, password);
          return userId;
        } else {
          console.log("sign up not complete");
          console.log(userId);
          console.log(nextStep);
        }
      } catch (error) {
        throw new Error(error);
      }
      invalidateToken(token);
    } else {
      throw new Error("Token not valid. Contact your administrator.");
    }
  } catch (error) {
    throw new Error("Token not valid. Contact your administrator.");
  }
};

async function checkSignUp(token, email) {
  try {
    const body = {
      token: token,
      email: email,
    };
    const response = await axios.post(URL_BACKEND + ROUTES.TOKEN, body);
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

async function invalidateToken(token) {
  const authToken = await GetAccessToken();
  try {
    const response = await axios.delete(
      URL_BACKEND + ROUTES.TOKEN,
      {
        token: token,
      },
      {
        headers: {
          Authorization: authToken,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

export async function SignIn(email, password) {
  console.log("Sign in...");
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password: password,
    });
    if (isSignedIn) {
      console.log("signed in");
      return;
    } else {
      console.log("not signed in");
      console.log(nextStep);
    }
  } catch (error) {
    throw new Error(error);
  }
}

export async function SignOut() {
  console.log("Sign out...");
  try {
    await signOut();
    console.log("signed out");
  } catch (error) {
    console.log("error signing out: ", error);
  }
}

// for tests only
export async function CurrentAuthenticatedUser() {
  try {
    const { username, userId, signInDetails } = await getCurrentUser();
    console.log(`The username: ${username}`);
    console.log(`The userId: ${userId}`);
    console.log(`The signInDetails JSON: ${JSON.stringify(signInDetails)}`);
    const email = await GetCurrentUserEmail();
    console.log(`The email: ${email}`);
    const token = await GetAccessToken();
    console.log(`Access token: ${token}`);
  } catch (err) {
    console.log(err);
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
