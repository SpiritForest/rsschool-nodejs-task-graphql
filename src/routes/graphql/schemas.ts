import { Type } from '@fastify/type-provider-typebox';
import { buildSchema } from 'graphql';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const gqlSchema = buildSchema(`
  scalar UUID

  enum MemberTypeId {
    basic
    business
  }

  type Profile {
    id:           UUID
    isMale:       Boolean
    yearOfBirth:  Int
    userId:       UUID
    memberType:   MemberType
    memberTypeId: MemberTypeId
  }
  
  input CreateProfileInput {
    isMale:       Boolean
    yearOfBirth:  Int
    userId:       String
    memberTypeId: MemberTypeId
  }

  input ChangeProfileInput {
    isMale:       Boolean
    yearOfBirth:  Int
    memberTypeId: MemberTypeId
  }

  type Post {
    id:      UUID
    title:   String
    content: String
    authorId: String
  }

  input CreatePostInput {
    title:   String
    content: String
    authorId: String
  }

  input ChangePostInput {
    title:   String
    content: String
  }

  type User {
    id: UUID
    name: String
    balance: Float
    profile: Profile
    posts: [Post]
    userSubscribedTo: [User]
    subscribedToUser: [User]
  }

  input CreateUserInput {
    name: String
    balance: Float
  }

  input ChangeUserInput {
    name: String
    balance: Float
  }

  type MemberType {
    id:                 MemberTypeId
    discount:           Float
    postsLimitPerMonth: Int
    profiles:           [Profile]
  }

  type Query {
    users: [User]
    user(id: UUID!): User
    memberTypes: [MemberType]
    memberType(id: MemberTypeId!): MemberType
    posts: [Post]
    post(id: UUID!): Post
    profiles: [Profile]
    profile(id: UUID!): Profile
  }

  type Mutation {
    createProfile(dto: CreateProfileInput!): Profile
    createPost(dto: CreatePostInput!): Post
    createUser(dto: CreateUserInput!): User
    deletePost(id: UUID!): Boolean
    deleteProfile(id: UUID!): Boolean
    deleteUser(id: UUID!): Boolean
    changePost(id: UUID!, dto: ChangePostInput): Post
    changeProfile(id: UUID!, dto: ChangeProfileInput): Profile
    changeUser(id: UUID!, dto: ChangeUserInput): User    
    subscribeTo(userId: UUID!, authorId: UUID!): User
    unsubscribeFrom(userId: UUID!, authorId: UUID!): Boolean
  }
`);