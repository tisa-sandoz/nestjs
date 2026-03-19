// src/config/config.type.ts
export interface AppConfig {
  mail: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure: boolean;
  };
}
