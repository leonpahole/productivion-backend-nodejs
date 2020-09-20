import argon2 from "argon2";
import { IsEmail, Length, MinLength, MaxLength } from "class-validator";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import {
  AUTH_ERROR,
  COOKIE_NAME,
  PG_UNIQUE_ERROR_CODE,
  FORGOT_PASSWORD_LINK_EXPIRY_MS,
  FORGOT_PASSWORD_LINK_EXPIRY_HOURS,
  USER_UNVERIFIED_ERROR,
} from "../constants";
import { User } from "../entities/User";
import { logger } from "../logger";
import { isAuth } from "../middleware/isAuth";
import { AppContext } from "../types/AppContext";
import { createGraphQLInputError } from "../utils/createGraphQLInputError";
import { sendForgotPasswordMail, sendWelcomeMail } from "../utils/sendEmail";
import jwt from "jsonwebtoken";

@InputType()
class RegisterInput {
  @Field()
  @IsEmail()
  @MaxLength(250)
  email: string;

  @Field()
  @Length(4, 40)
  name: string;

  @Field()
  @Length(4, 250)
  password: string;
}

@InputType()
class VerifyEmailInput {
  @Field()
  token: string;
}

@InputType()
class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(4)
  password: string;

  @Field()
  rememberMe: boolean;
}

@InputType()
class UpdateUserInput {
  @Field()
  @Length(4, 40)
  name: string;
}

@InputType()
class ChangePasswordInput {
  @Field()
  @MinLength(4)
  password: string;
}

@InputType()
class ResetPasswordInput {
  @Field()
  @MinLength(4)
  password: string;

  @Field()
  token: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg("input") { email, name, password }: RegisterInput
  ): Promise<User> {
    const hashedPassword = await argon2.hash(password);
    const user = new User();
    user.email = email;
    user.name = name;
    user.password = hashedPassword;
    user.isVerified = false;

    try {
      await user.save();
    } catch (e) {
      if (e.code === PG_UNIQUE_ERROR_CODE) {
        throw createGraphQLInputError([
          {
            property: "email",
            constraints: {
              IsUnique: "Email already exists",
            },
          },
        ]);
      }

      throw e;
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET
    );

    const sendMailResult = await sendWelcomeMail(user.email, {
      link: `${process.env.FRONTEND_URL}/verify-email/${token}`,
      name: user.name,
    });

    if (!sendMailResult) {
      logger.error("Revering insert of user");
      await User.delete({ id: user.id });
      throw new Error();
    }

    return user;
  }

  @Mutation(() => User, { nullable: true })
  async verifyEmail(@Arg("input") { token }: VerifyEmailInput): Promise<User> {
    let payload: any | null = null;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      logger.error("Verify token error");
      logger.error(e);
      throw new Error(AUTH_ERROR);
    }

    if (!payload || !payload.id) {
      throw new Error(AUTH_ERROR);
    }

    const userId: number = payload.id;

    const user = await User.findOne(userId);

    if (!user || user.isVerified) {
      throw new Error(AUTH_ERROR);
    }

    await User.update({ id: userId }, { isVerified: true });

    return user;
  }

  @Mutation(() => User)
  async login(
    @Ctx() { req }: AppContext,
    @Arg("input") { email, password, rememberMe }: LoginInput
  ): Promise<User> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error(AUTH_ERROR);
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      throw new Error(AUTH_ERROR);
    }

    if (!user.isVerified) {
      throw new Error(USER_UNVERIFIED_ERROR);
    }

    req.session.userId = user.id;

    if (!rememberMe) {
      req.session.cookie.expires = false;
    }

    return user;
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  me(@Ctx() { req }: AppContext): Promise<User | undefined> {
    return User.findOne(req.session.userId);
  }

  @Mutation(() => User, { nullable: true })
  @UseMiddleware(isAuth)
  async updateUser(
    @Ctx() { req }: AppContext,
    @Arg("input") { name }: UpdateUserInput
  ): Promise<User | undefined> {
    await User.update(
      { id: req.session.userId },
      {
        name,
      }
    );

    return User.findOne({ where: { id: req.session.userId } });
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async changePassword(
    @Ctx() { req }: AppContext,
    @Arg("input") { password }: ChangePasswordInput
  ): Promise<boolean> {
    const hashedPassword = await argon2.hash(password);
    await User.update(
      { id: req.session.userId },
      {
        password: hashedPassword,
      }
    );

    return true;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteUser(@Ctx() { req }: AppContext): Promise<boolean> {
    await User.delete({ id: req.session.userId });
    return true;
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: AppContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          logger.error(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: FORGOT_PASSWORD_LINK_EXPIRY_MS,
      }
    );

    const sendMailResult = await sendForgotPasswordMail(user.email, {
      expiryTimeHours: FORGOT_PASSWORD_LINK_EXPIRY_HOURS,
      link: `${process.env.FRONTEND_URL}/reset-password/${token}`,
      name: user.name,
    });

    return sendMailResult;
  }

  @Mutation(() => Boolean)
  async resetPassword(
    @Arg("input") { token, password }: ResetPasswordInput
  ): Promise<Boolean> {
    let payload: any | null = null;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      logger.error("Verify token error");
      logger.error(e);
      throw new Error(AUTH_ERROR);
    }

    if (!payload || !payload.id) {
      throw new Error(AUTH_ERROR);
    }

    const userId: number = payload.id;

    const user = await User.findOne(userId);

    if (!user) {
      throw new Error(AUTH_ERROR);
    }

    await User.update(
      { id: userId },
      { password: await argon2.hash(password) }
    );

    return true;
  }
}
