export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      areas: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      technicians: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          code: string;
          user_name: string;
          area_id: string;
      description: string;
      notes: string | null;
      resolution_notes: string | null;
      confirmed_by: string | null;
      confirmed_at: string | null;
      technician_id: string | null;
      status: "Pendiente" | "En proceso" | "Resuelto";
      created_at: string;
      updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          user_name: string;
          area_id: string;
      description: string;
      notes?: string | null;
      resolution_notes?: string | null;
      confirmed_by?: string | null;
      confirmed_at?: string | null;
      technician_id?: string | null;
      status?: "Pendiente" | "En proceso" | "Resuelto";
      created_at?: string;
      updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          user_name?: string;
          area_id?: string;
      description?: string;
      notes?: string | null;
      resolution_notes?: string | null;
      confirmed_by?: string | null;
      confirmed_at?: string | null;
      technician_id?: string | null;
      status?: "Pendiente" | "En proceso" | "Resuelto";
      created_at?: string;
      updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "incidents_area_id_fkey";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidents_technician_id_fkey";
            columns: ["technician_id"];
            isOneToOne: false;
            referencedRelation: "technicians";
            referencedColumns: ["id"];
          }
        ];
      };
      system_users: {
        Row: {
          id: string;
          username: string;
          role: "Administrador" | "Operador";
          status: "Activo" | "Inactivo";
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          role?: "Administrador" | "Operador";
          status?: "Activo" | "Inactivo";
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          role?: "Administrador" | "Operador";
          status?: "Activo" | "Inactivo";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      dashboard_summary: {
        Row: {
          status: "Pendiente" | "En proceso" | "Resuelto";
          total: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      incident_code_sequence: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
  };
}
