export interface NavChild {
  label: string;
  href: string;
}

export interface NavGroup {
  groupLabel: string;
  items: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  groups?: NavGroup[];
}

export const navItems: NavItem[] = [
  { label: "شرائح إلكترونية", href: "/sim-cards" },
  { label: "راوترات", href: "/routers" },
];
