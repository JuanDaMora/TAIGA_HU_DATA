// consulta_sprint.interface.ts

/**
 * Interfaz principal que describe la estructura de un sprint.
 * Ajusta el nombre a `Sprint` si lo prefieres en singular.
 */
export interface Sprints {
    project:            number;
    project_extra_info: ProjectExtraInfo;
    id:                 number;
    name:               string;
    slug:               string;
    owner:              number;
    estimated_start:    Date;
    estimated_finish:   Date;
    created_date:       Date;
    modified_date:      Date;
    closed:             boolean;
    disponibility:      number;
    order:              number;
    user_stories:       UserStory[];
    total_points:       number;
    closed_points:      number | null;
  }
  
  /**
   * Información adicional del proyecto.
   */
  export interface ProjectExtraInfo {
    name:           string;
    slug:           Slug;
    logo_small_url: null;
    id:             number;
  }
  

  
  export enum Slug {
    DgomezsGeneralHuTransversales = "dgomezs-general-hu-transversales",
  }
  
  /**
   * Interfaz para las user stories incluidas en cada sprint.
   */
  export interface UserStory {
    due_date:               null;
    due_date_reason:        string;
    due_date_status:        any;
    assigned_to:            number | null;
    assigned_to_extra_info: AssignedToExtraInfo | null;
    status:                 number;
    status_extra_info:      StatusExtraInfo;
    project:                number;
    project_extra_info:     ProjectExtraInfo;
    id:                     number;
    ref:                    number;
    milestone:              number;
    is_closed:              boolean;
    created_date:           Date;
    modified_date:          Date;
    finish_date:            Date | null;
    subject:                string;
    client_requirement:     boolean;
    team_requirement:       boolean;
    external_reference:     null;
    version:                number;
    is_blocked:             boolean;
    blocked_note:           string;
    backlog_order:          number;
    sprint_order:           number;
    kanban_order:           number;
    epics:                  null;
    points:                 any;
    total_points:           number | null;
  }
  
  /**
   * Información extra de la persona asignada a la US.
   */
  export interface AssignedToExtraInfo {
    username:          string;
    full_name_display: string;
    photo:             null | string;
    big_photo:         null | string;
    gravatar_id:       string;
    is_active:         boolean;
    id:                number;
  }

  /**
   * Información adicional de estado de la user story.
   */
  export interface StatusExtraInfo {
    name:      string;
    color:     any;
    is_closed: boolean;
  }
  