import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        projectId: z.string(),
        assignedToId: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
        dueDate: z.date().optional(),
        tagIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is a member of the project
      const membership = await ctx.db.projectMember.findFirst({
        where: {
          projectId: input.projectId,
          userId: ctx.session.user.id,
        },
      });

      if (!membership) {
        throw new Error("You are not a member of this project");
      }

      // Verify assigned user is a project member if provided
      if (input.assignedToId) {
        const assigneeMembership = await ctx.db.projectMember.findFirst({
          where: {
            projectId: input.projectId,
            userId: input.assignedToId,
          },
        });

        if (!assigneeMembership) {
          throw new Error("Assigned user is not a member of this project");
        }
      }

      const task = await ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description,
          projectId: input.projectId,
          createdById: ctx.session.user.id,
          assignedToId: input.assignedToId,
          priority: input.priority,
          dueDate: input.dueDate,
        },
      });

      // Add tags if provided
      if (input.tagIds && input.tagIds.length > 0) {
        await ctx.db.taskTag.createMany({
          data: input.tagIds.map((tagId) => ({
            taskId: task.id,
            tagId,
          })),
        });
      }

      return task;
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        projectId: z.string().optional(),
        status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
        assignedToMe: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: any = {};

      if (input.projectId) {
        // Check if user is a member of the project
        const membership = await ctx.db.projectMember.findFirst({
          where: {
            projectId: input.projectId,
            userId: ctx.session.user.id,
          },
        });

        if (!membership) {
          throw new Error("You are not a member of this project");
        }

        where.projectId = input.projectId;
      } else {
        // Show only tasks from projects user is a member of
        where.project = {
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        };
      }

      if (input.status) {
        where.status = input.status;
      }

      if (input.assignedToMe) {
        where.assignedToId = ctx.session.user.id;
      }

      return await ctx.db.task.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: [
          { status: "asc" },
          { priority: "desc" },
          { dueDate: "asc" },
          { createdAt: "desc" },
        ],
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.task.findFirst({
        where: {
          id: input.id,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
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
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      return task;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
        assignedToId: z.string().optional(),
        dueDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user can update the task (creator or assigned user or project admin/owner)
      const task = await ctx.db.task.findFirst({
        where: {
          id: input.id,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
        include: {
          project: {
            include: {
              members: {
                where: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      const userMembership = task.project.members[0];
      const canUpdate =
        task.createdById === ctx.session.user.id ||
        task.assignedToId === ctx.session.user.id ||
        userMembership?.role === "OWNER" ||
        userMembership?.role === "ADMIN";

      if (!canUpdate) {
        throw new Error("Insufficient permissions to update this task");
      }

      return await ctx.db.task.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          assignedToId: input.assignedToId,
          dueDate: input.dueDate,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user can delete the task (creator or project admin/owner)
      const task = await ctx.db.task.findFirst({
        where: {
          id: input.id,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
        include: {
          project: {
            include: {
              members: {
                where: {
                  userId: ctx.session.user.id,
                },
              },
            },
          },
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      const userMembership = task.project.members[0];
      const canDelete =
        task.createdById === ctx.session.user.id ||
        userMembership?.role === "OWNER" ||
        userMembership?.role === "ADMIN";

      if (!canDelete) {
        throw new Error("Insufficient permissions to delete this task");
      }

      return await ctx.db.task.delete({
        where: { id: input.id },
      });
    }),

  addComment: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user can access the task
      const task = await ctx.db.task.findFirst({
        where: {
          id: input.taskId,
          project: {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
        },
      });

      if (!task) {
        throw new Error("Task not found");
      }

      return await ctx.db.taskComment.create({
        data: {
          content: input.content,
          taskId: input.taskId,
          authorId: ctx.session.user.id,
        },
        include: {
          author: {
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

  getStats: protectedProcedure
    .input(z.object({ projectId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const where: any = {
        project: {
          members: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        },
      };

      if (input.projectId) {
        where.projectId = input.projectId;
      }

      const [
        totalTasks,
        todoTasks,
        inProgressTasks,
        inReviewTasks,
        doneTasks,
        myTasks,
        overdueTasks,
      ] = await Promise.all([
        ctx.db.task.count({ where }),
        ctx.db.task.count({ where: { ...where, status: "TODO" } }),
        ctx.db.task.count({ where: { ...where, status: "IN_PROGRESS" } }),
        ctx.db.task.count({ where: { ...where, status: "IN_REVIEW" } }),
        ctx.db.task.count({ where: { ...where, status: "DONE" } }),
        ctx.db.task.count({
          where: { ...where, assignedToId: ctx.session.user.id },
        }),
        ctx.db.task.count({
          where: {
            ...where,
            dueDate: {
              lt: new Date(),
            },
            status: {
              not: "DONE",
            },
          },
        }),
      ]);

      return {
        totalTasks,
        todoTasks,
        inProgressTasks,
        inReviewTasks,
        doneTasks,
        myTasks,
        overdueTasks,
      };
    }),
});
