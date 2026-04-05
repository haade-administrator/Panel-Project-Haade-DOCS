import type { Connection } from 'home-assistant-js-websocket'
import type { IconsResponse, IconsData } from '../types'
import { IconCategory } from '../types'

export class HAIcons {
  /**
   * Universal function to get Home Assistant icons
   * @param connection - Home Assistant connection object
   * @returns Object with icons grouped by categories
   */
  async getAllIcons(
    connection: Connection
  ): Promise<Record<IconCategory, IconsData>> {

    const categoriesToFetch: IconCategory[] = Object.values(IconCategory);
    
    const result: Record<IconCategory, IconsData> = {} as Record<IconCategory, IconsData>;
    
    const promises = categoriesToFetch.map(async (category) => {
      try {
        const message = {
          type: 'frontend/get_icons',
          category: category
        };
        
        const response = await connection.sendMessagePromise<IconsResponse>(message);
        result[category] = response.resources;
      } catch (error) {
        console.error(`Failed to get ${category} icons:`, error);
        result[category] = {};
      }
    });
    
    await Promise.all(promises);
    
    return result;
  }
}

export const hassIcons = new HAIcons()
