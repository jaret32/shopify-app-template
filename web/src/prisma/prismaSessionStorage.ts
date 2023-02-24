import { ShopifySession } from '@prisma/client';
import { Session } from '@shopify/shopify-api';
import { SessionStorage } from '@shopify/shopify-app-session-storage';
import { prisma } from '.';

const parseSession = (session: ShopifySession) =>
  new Session({
    ...session,
    scope: session.scope ?? undefined,
    expires: session.expires ?? undefined,
    accessToken: session.accessToken ?? undefined,
    onlineAccessInfo: session.onlineAccessInfo ?? undefined,
  });

export class PrismaSessionStorage implements SessionStorage {
  async storeSession(session: Session): Promise<boolean> {
    await prisma.shopifySession.create({
      data: {
        id: session.id,
        shop: session.shop,
        state: session.state,
        isOnline: session.isOnline,
        scope: session.scope,
        expires: session.expires,
        accessToken: session.accessToken,
        onlineAccessInfo: session.onlineAccessInfo
          ? {
              expires_in: session.onlineAccessInfo.expires_in,
              associated_user_scope:
                session.onlineAccessInfo.associated_user_scope,
              associated_user: {
                id: session.onlineAccessInfo.associated_user.id,
                first_name: session.onlineAccessInfo.associated_user.first_name,
                last_name: session.onlineAccessInfo.associated_user.last_name,
                email: session.onlineAccessInfo.associated_user.email,
                email_verified:
                  session.onlineAccessInfo.associated_user.email_verified,
                account_owner:
                  session.onlineAccessInfo.associated_user.account_owner,
                locale: session.onlineAccessInfo.associated_user.locale,
                collaborator:
                  session.onlineAccessInfo.associated_user.collaborator,
              },
            }
          : undefined,
      },
    });
    return true;
  }

  async loadSession(id: string): Promise<Session | undefined> {
    const session = await prisma.shopifySession.findUnique({ where: { id } });
    if (!session) return undefined;
    return parseSession(session);
  }

  async deleteSession(id: string): Promise<boolean> {
    await prisma.shopifySession.delete({ where: { id } });
    return true;
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    await prisma.shopifySession.deleteMany({ where: { id: { in: ids } } });
    return true;
  }

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const sessions = await prisma.shopifySession.findMany({ where: { shop } });
    return sessions.map((session) => parseSession(session));
  }
}
