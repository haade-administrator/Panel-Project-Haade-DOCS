export interface IconsResponse {
  resources: IconsData;
}

export interface IconsData {
  [key: string]: any;
}

export enum IconCategory {
  ENTITY = "entity",
  ENTITY_COMPONENT = "entity_component",
  SERVICES = "services"
}