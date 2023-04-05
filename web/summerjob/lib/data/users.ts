import { PrismaClient, WorkerPermissions } from "lib/prisma/client";
import prisma from "lib/prisma/connection";
import { Permission } from "lib/types/auth";
import { PrismaTransactionClient } from "lib/types/prisma";
import { UserComplete, UserUpdateData } from "lib/types/user";
import { cache_getActiveSummerJobEventId } from "./cache";

export async function getUserById(id: string): Promise<UserComplete | null> {
  const user = await prisma.worker.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      blocked: true,
      deleted: true,
      permissions: true,
    },
  });
  if (!user) return null;
  return databaseUserToUserComplete(user);
}

export async function getUserByEmail(
  email: string
): Promise<UserComplete | null> {
  const user = await prisma.worker.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      blocked: true,
      deleted: true,
      permissions: true,
    },
  });
  if (!user) return null;
  return databaseUserToUserComplete(user);
}

export async function getUsers(): Promise<UserComplete[]> {
  const activeEventId = await cache_getActiveSummerJobEventId();
  if (!activeEventId) return [];
  const users = await prisma.worker.findMany({
    where: {
      deleted: false,
      registeredIn: {
        some: {
          id: activeEventId,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      blocked: true,
      deleted: true,
      permissions: true,
    },
  });
  return users.map(databaseUserToUserComplete);
}

export async function updateUser(
  id: string,
  data: UserUpdateData
): Promise<UserComplete | null> {
  if (data.blocked === undefined || data.blocked === false) {
    return await internal_updateUser(id, data, prisma);
  }
  // Block user and update data
  const user = await prisma.$transaction(async (tx) => {
    const user = await internal_updateUser(id, data, tx);
    if (!user) return null;
    await deleteUserSessions(user.email, tx);
    return user;
  });
  return user;
}

async function internal_updateUser(
  id: string,
  data: UserUpdateData,
  prismaClient: PrismaClient | PrismaTransactionClient
): Promise<UserComplete | null> {
  const user = await prismaClient.worker.update({
    where: {
      id,
    },
    data: {
      blocked: data.blocked,
      permissions: {
        update: {
          permissions: data.permissions,
        },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      blocked: true,
      deleted: true,
      permissions: true,
    },
  });
  if (!user) return null;
  // TODO: Fix this type cast once prisma has fixed their return types
  return databaseUserToUserComplete(user as unknown as DBUserComplete);
}

export async function deleteUserSessions(
  email: string,
  prismaClient: PrismaClient | PrismaTransactionClient = prisma
) {
  const nextAuthUser = await prismaClient.user.findFirst({
    where: {
      email,
    },
  });
  await prismaClient.session.deleteMany({
    where: {
      userId: nextAuthUser?.id,
    },
  });
}

type DBUserComplete = Omit<UserComplete, "permissions"> & {
  permissions: WorkerPermissions;
};
function databaseUserToUserComplete(user: DBUserComplete): UserComplete {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    blocked: user.blocked,
    deleted: user.deleted,
    permissions: user.permissions.permissions as Permission[],
  };
}