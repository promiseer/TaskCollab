import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const tagRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        color: z.string().default("#6B7280"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.tag.create({
        data: {
          name: input.name,
          color: input.color,
        },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.tag.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(50).optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.tag.update({
        where: { id: input.id },
        data: {
          name: input.name,
          color: input.color,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.tag.delete({
        where: { id: input.id },
      });
    }),
});
