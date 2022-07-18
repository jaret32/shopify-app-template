import * as shopifySessionService from '../../services/shopifySessionService';

export const appUninstalledHandler = async (_topic: string, shop: string) => {
  await shopifySessionService.deleteShopSessions(shop);
};
