import 'express-session';

declare module 'express-session' {
  interface SessionData {
    staff?: {
      id: number;
      email: string;
      name: string;
      modules: {
        key: string;
        label: string;
        children: {
          key: string;
          label: string;
        }[];
      }[];
    };
    customer?: {
      id: number;
      email: string;
      name: string;
      customerType: 'person' | 'company';
      organizationId: number | null;
    };
  }
}