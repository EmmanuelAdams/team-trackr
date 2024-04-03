import passport from 'passport';
import dotenv from 'dotenv';
import passportGoogle from 'passport-google-oauth2';
import { User } from './models/User';
import { Request } from 'express';
import sendEmail from './utils/mail';
import createToken from './controllers/tokens';

const GoogleStrategy = passportGoogle.Strategy;

dotenv.config({ path: './config/config.env' });

// Define the user type
type TUser = {
  id: string;
  email: string;
};

interface IUser {
    id?: string,
    email?: string  
  }
  

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientID || '',
      clientSecret: process.env.clientSecret || '',
      callbackURL: 'http://localhost:5000/api/v1/auth/google/callback',
      passReqToCallback: true,
    },
    async (request: Request, accessToken: any, refreshToken: any, profile: any, done: any) => {
      try {
        // Find user by email
        const user: TUser | null = await User.findOne({ email: profile.emails?.[0].value });

        if (!user) {
          // Create a new user if not found
          const newUser = await User.create({
            username: profile.displayName,
            email: profile.emails?.[0].value,
            verified: true,
          });

          // Create a token for the new user
          const token = await createToken.createToken(newUser.id);

          // Send a welcome email
          await sendEmail(newUser.email, 'New account', 'Thank you for signing up');

          // Return the user and token
          done(null, { user: newUser, token });
        } else {
          // Use existing user
          // Uncomment the line below if you want to send an email to existing users
          // await sendEmail(user.email, 'Existing account', 'Welcome back!');

          // Create a token for the existing user
          const token2 = await createToken.createToken(user.id);

          // Return the existing user and token
          done(null, { user, token: token2 });
        }
      } catch (error) {
        // Handle any errors
        console.log(error);
        done(error);
      }
    }
  )
);

passport.serializeUser((user: IUser, done) => {
  // Serialize user by their ID
  done(null, user.id);
});

passport.deserializeUser(async (userID, done) => {
  // Deserialize user by their ID
  const user = await User.findById(userID);
  done(null, user);
});

export default passport;
