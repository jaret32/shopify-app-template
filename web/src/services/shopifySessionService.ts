import { SessionInterface, Shopify } from '@shopify/shopify-api';
import { prisma } from '../prisma';

export const storeCallback = async (
  session: SessionInterface,
): Promise<boolean> => {
  const { id, ...rest } = session;
  try {
    await prisma.shopifySession.upsert({
      where: { id },
      update: rest,
      create: session,
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const loadCallback = async (
  id: string,
): Promise<SessionInterface | undefined> => {
  try {
    const session = await prisma.shopifySession.findUnique({ where: { id } });
    if (!session) return undefined;
    return Shopify.Session.Session.cloneSession(
      {
        ...session,
        scope: session.scope || undefined,
        expires: session.expires || undefined,
        accessToken: session.accessToken || undefined,
        onlineAccessInfo: session.onlineAccessInfo || undefined,
        isActive: () => false,
      },
      session.id,
    );
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export const deleteCallback = async (id: string): Promise<boolean> => {
  try {
    await prisma.shopifySession.delete({ where: { id } });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const deleteShopSessions = async (shop: string): Promise<boolean> => {
  const { count } = await prisma.shopifySession.deleteMany({ where: { shop } });
  return count > 0;
};
