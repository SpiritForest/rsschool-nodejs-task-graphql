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
      const result = await graphql({
        schema: gqlSchema,
        source: req.body.query,
        rootValue: resolvers,
        contextValue: { prisma: fastify.prisma },
        variableValues: req.body.variables,
      });

      await repl.send(result);
    },
  });
};

export default plugin;
