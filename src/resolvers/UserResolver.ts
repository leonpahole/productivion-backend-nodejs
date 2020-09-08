import argon2 from "argon2";
import { IsEmail, Length, MinLength } from "class-validator";
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
import { AUTH_ERROR, COOKIE_NAME, PG_UNIQUE_ERROR_CODE } from "../constants";
import { User } from "../entities/User";
import { logger } from "../logger";
import { isAuth } from "../middleware/isAuth";
import { AppContext } from "../types/AppContext";
import { createGraphQLInputError } from "../utils/createGraphQLInputError";

@InputType()
class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(4, 40)
  name: string;

  @Field()
  @MinLength(4)
  password: string;
}

@InputType()
class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(4)
  password: string;
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

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Ctx() { req }: AppContext,
    @Arg("input") { email, name, password }: RegisterInput
  ): Promise<User> {
    const hashedPassword = await argon2.hash(password);
    const user = new User();
    user.email = email;
    user.name = name;
    user.password = hashedPassword;

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

    req.session.userId = user.id;

    return user;
  }

  @Mutation(() => User)
  async login(
    @Ctx() { req }: AppContext,
    @Arg("input") { email, password }: LoginInput
  ): Promise<User> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error(AUTH_ERROR);
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      throw new Error(AUTH_ERROR);
    }

    req.session.userId = user.id;

    return user;
  }

  @Query(() => User)
  @UseMiddleware(isAuth)
  me(@Ctx() { req }: AppContext): Promise<User | undefined> {
    return User.findOne(req.session.userId);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async updateUser(
    @Ctx() { req }: AppContext,
    @Arg("input") { name }: UpdateUserInput
  ): Promise<boolean> {
    await User.update(
      { id: req.session.userId },
      {
        name,
      }
    );

    return true;
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
}
