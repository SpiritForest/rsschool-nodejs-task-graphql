import depthLimit from 'graphql-depth-limit';
import { validate } from "graphql";
import { parse } from 'graphql';
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { graphql } from 'graphql';

import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { gqlSchema } from './schemas.js';
import { resolvers } from './resolvers.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, repl) {
      const quertyDepthLimit = 5;
      const ast = parse(req.body.query);
      const errors = validate(gqlSchema, ast, [depthLimit(quertyDepthLimit)]);

      if (errors.length) {
        await repl.send({
          errors
        });
      } else {
        const result = await graphql({
          schema: gqlSchema,
          source: req.body.query,
          rootValue: resolvers,
          contextValue: { prisma: fastify.prisma },
          variableValues: req.body.variables
        });
  
        await repl.send(result);
      }

    },
  });
};

export default plugin;
