import { PrismaClient, Profile, Post, User } from "@prisma/client";
import { UUIDType } from "./types/uuid.js";
import { UUID } from "crypto";

export const resolvers = {
    UUID: UUIDType,
    
    users(args, context: { prisma: PrismaClient }) {
        return context.prisma.user.findMany({
            include: {
              posts: true,
              profile: {
                include: {
                  memberType: true
                }
              },             
            }
        });
    },

    async user({ id }: { id: UUID }, context: { prisma: PrismaClient }) {
        const prisma = context.prisma;
        const user = await prisma.user.findUnique({
          where: { id },
          include: {
            posts: true,
            profile: {
              include: {
                memberType: true
              }
            },    
            userSubscribedTo: true          
          }
        });

        if (user === null) { return null; }

        const getUserSubscribedTo = async (id: UUID) => {
          return context.prisma.user.findMany({
            where: {
              subscribedToUser: {
                some: {
                  subscriberId: id,
                },
              },
            },
          });
        } 

        const getSubscribedToUser = async (id: UUID) => {
          return context.prisma.user.findMany({
            where: {
              userSubscribedTo: {
                some: {
                  authorId: id,
                },
              },
            },
          });
        }

        const userSubscribedTo = await getUserSubscribedTo(id);
        const subscribedToUser = await getSubscribedToUser(id);

        const userSubscribedToSubscriptionPromises = userSubscribedTo.map((user) => getUserSubscribedTo(user.id as UUID));
        const userSubscribedToSubscription = await Promise.all(userSubscribedToSubscriptionPromises);
        const userSubscribedToFollowersPromises = userSubscribedTo.map((user) => getSubscribedToUser(user.id as UUID));
        const userSubscribedToFollowers = await Promise.all(userSubscribedToFollowersPromises);
        const userSubscribedToMapped = userSubscribedTo.map((user, index) => {
          return {
            ...user,
            userSubscribedTo: userSubscribedToSubscription[index],
            subscribedToUser: userSubscribedToFollowers[index]
          };
        });

        const subscribedToUserSubscriptionPromises = subscribedToUser.map((user) => getUserSubscribedTo(user.id as UUID));
        const subscribedToUserSubscription = await Promise.all(subscribedToUserSubscriptionPromises);
        const subscribedToUserFollowersPromises = subscribedToUser.map((user) => getSubscribedToUser(user.id as UUID));
        const subscribedToUserFollowers = await Promise.all(subscribedToUserFollowersPromises);
        const subscribedToUserMapped = subscribedToUser.map((user, index) => {
          return {
            ...user,
            userSubscribedTo: subscribedToUserSubscription[index],
            subscribedToUser: subscribedToUserFollowers[index]
          };
        });
          
        return {
            ...user,
            userSubscribedTo: userSubscribedToMapped,
            subscribedToUser: subscribedToUserMapped
        };
    },

    memberTypes(args, context: { prisma: PrismaClient }) {
        return context.prisma.memberType.findMany();
    },

    memberType({ id }: { id: string }, context: { prisma: PrismaClient }) {
        return context.prisma.memberType.findUnique({
            where: {
              id,
            },
          });
    },

    posts(args, context: { prisma: PrismaClient }) {
        return context.prisma.post.findMany();
    },

    post({ id }: { id: UUID }, context: { prisma: PrismaClient }) {
        return context.prisma.post.findUnique({
            where: {
              id,
            },
          });
    },

    profiles(args, context: { prisma: PrismaClient }) {
        return context.prisma.profile.findMany();
    },

    profile({ id }: { id: UUID }, context: { prisma: PrismaClient }) {
        return context.prisma.profile.findUnique({
            where: {
              id,
            },
          });
    },

    createProfile({ dto } : { dto: Profile}, context: { prisma: PrismaClient }) {
      return context.prisma.profile.create({
        data: dto,
      });
    },

    createPost({ dto } : { dto: Post}, context: { prisma: PrismaClient }) {
      return context.prisma.post.create({
        data: dto,
      });
    },

    createUser({ dto } : { dto: User}, context: { prisma: PrismaClient }) {
      return context.prisma.user.create({
        data: dto,
      });
    },
    
    changePost({ id, dto } : { id: UUID; dto: Post}, context: { prisma: PrismaClient }) {
      return context.prisma.post.update({
        where: { id },
        data: dto,
      });
    },

    changeProfile({ id, dto } : { id: UUID; dto: Profile}, context: { prisma: PrismaClient }) {
      return context.prisma.profile.update({
        where: { id },
        data: dto,
      });
    },

    changeUser({ id, dto } : { id: UUID; dto: User}, context: { prisma: PrismaClient }) {
      return context.prisma.user.update({
        where: { id },
        data: dto,
      });
    },

    async deletePost({ id }: { id: UUID }, context: { prisma: PrismaClient }) {
      await context.prisma.post.delete({ where: { id }});
    },

    async deleteProfile({ id }: { id: UUID }, context: { prisma: PrismaClient }) {
      await context.prisma.profile.delete({ where: { id }});
    },

    async deleteUser({ id }: { id: UUID }, context: { prisma: PrismaClient }) {
      await context.prisma.user.delete({ where: { id }, select: {
        id: true,
      }});
    },

    subscribeTo({ userId, authorId }: { userId: UUID, authorId: UUID }, context: { prisma: PrismaClient }) {
      return context.prisma.subscribersOnAuthors.create({
        data: {
          authorId: authorId,
          subscriberId: userId
        }
      });
    },

    async unsubscribeFrom({ userId, authorId }: { userId: UUID; authorId: UUID }, context: { prisma: PrismaClient }) {
      await context.prisma.subscribersOnAuthors.delete({
        where: {
          subscriberId_authorId: {
            subscriberId: userId,
            authorId: authorId,
          }
        }
      });
    }
}