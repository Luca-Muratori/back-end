import GoogleStrategy from "passport-google-oauth20";
import UsersModel from "../api/user/model.js";
import { authenticateUser } from "./tools.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.API_URL}user/googleRedirect`,
  },
  async (_, __, profile, passportNext) => {
    try {
      // this callback function is executed when Google sends us a successfull response back
      // here we are receiving some informations about the user from Google (scopes --> email, profile)

      // 1. Check if the user is already in our db
      const user = await UsersModel.findOne({ email: profile._json.email });

      if (user) {
        // 2. If user is already there --> generate accessToken (optionally a refreshToken)
        const { accessToken, refreshToken } = await authenticateUser(user);
        // 3. Then you can go next (we go to the route handler)
        passportNext(null, { accessToken, refreshToken });
      } else {
        // 4. Else if the user is not in our db --> create that user and generate accessToken (optionally a refreshToken)

        const { given_name, family_name, email } = profile._json;

        const newUser = new UsersModel({
          firstName: given_name,
          lastName: family_name,
          email,
          googleId: profile.id,
        });

        const createdUser = await newUser.save();

        const { accessToken, refreshToken } = await authenticateUser(
          createdUser
        );
        // 5. We go next
        passportNext(null, { accessToken, refreshToken });
      }
    } catch (error) {
      passportNext(error);
    }
  }
);

export default googleStrategy;
