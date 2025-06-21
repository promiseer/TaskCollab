import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(input.password, 12);

      // Create user in database
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          // Store hashed password in the role field temporarily
          // In production, create a separate password field or table
          role: hashedPassword,
          emailVerified: new Date(),
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name: input.name,
        },
      });
    }),  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Return user with empty counts for now to avoid errors
    return {
      ...user,
      _count: {
        createdProjects: 0,
        projectMemberships: 0,
        createdTasks: 0,
        assignedTasks: 0,
      },
    };
  }),

  searchUsers: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { email: { contains: input.query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
        take: 10,
      });
    }),
});
