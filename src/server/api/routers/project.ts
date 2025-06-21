import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description,
          color: input.color,
          createdById: ctx.session.user.id,
        },
      });

      // Add creator as owner
      await ctx.db.projectMember.create({
        data: {
          userId: ctx.session.user.id,
          projectId: project.id,
          role: "OWNER",
        },
      });

      return project;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          tasks: {
            include: {
              assignedTo: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              tags: {
                include: {
                  tag: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner or admin
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.id,
          userId: ctx.session.user.id,
          role: {
            in: ["OWNER", "ADMIN"],
          },
        },
      });

      if (!membership) {
        throw new Error("Insufficient permissions");
      }

      return await ctx.db.project.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          color: input.color,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.id,
          userId: ctx.session.user.id,
          role: "OWNER",
        },
      });

      if (!membership) {
        throw new Error("Only project owners can delete projects");
      }

      return await ctx.db.project.delete({
        where: { id: input.id },
      });
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        email: z.string().email(),
        role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user can add members
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          role: {
            in: ["OWNER", "ADMIN"],
          },
        },
      });

      if (!membership) {
        throw new Error("Insufficient permissions");
      }

      // Find user by email
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Check if user is already a member
      const existingMembership = await ctx.db.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: user.id,
            projectId: input.projectId,
          },
        },
      });

      if (existingMembership) {
        throw new Error("User is already a member of this project");
      }

      return await ctx.db.projectMember.create({
        data: {
          userId: user.id,
          projectId: input.projectId,
          role: input.role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
    }),

  removeMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if current user can remove members
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
          role: {
            in: ["OWNER", "ADMIN"],
          },
        },
      });

      if (!membership) {
        throw new Error("Insufficient permissions");
      }

      // Can't remove the owner
      const targetMembership = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: input.userId,
        },
      });

      if (targetMembership?.role === "OWNER") {
        throw new Error("Cannot remove project owner");
      }

      return await ctx.db.projectMember.delete({
        where: {
          userId_projectId: {
            userId: input.userId,
            projectId: input.projectId,
          },
        },
      });
    }),
});
