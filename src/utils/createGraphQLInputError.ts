import { GraphQLError } from "graphql/error/GraphQLError";
import { ARGUMENT_VALIDATION_ERROR } from "../constants";

interface ValidationError {
  property: string;
  constraints: { [key: string]: string };
}

export const createGraphQLInputError = (
  validationErrors: ValidationError[]
): GraphQLError => {
  return new GraphQLError(
    ARGUMENT_VALIDATION_ERROR,
    null,
    null,
    null,
    null,
    null,
    {
      exception: {
        validationErrors,
      },
    }
  );
};
