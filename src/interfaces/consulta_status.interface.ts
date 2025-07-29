export interface Hu {
    id:                  string;
    user:                User;
    created_at:          Date;
    type:                number;
    key:                 any;
    diff:                Diff;
    snapshot:            null;
    values:              Values;
    values_diff:         ValuesDiff;
    comment:             string;
    comment_html:        string;
    delete_comment_date: null;
    delete_comment_user: null;
    edit_comment_date:   null;
    is_hidden:           boolean;
    is_snapshot:         boolean;
}

export interface Diff {
    status?:           number[];
    kanban_order?:     number[];
    description?:      string[];
    description_html?: string[];
    attachments?:      Array<any[]>;
    assigned_users?:   Array<number[]>;
    points?:           any[];
    milestone?:        Array<number | null>;
    sprint_order?:     number[];
}



export interface User {
    pk:          number;
    username:    any;
    name:        any;
    photo:       null | string;
    is_active:   boolean;
    gravatar_id: any;
}


export interface Values {
    users:      { [key: string]: string };
    status?:    { [key: string]: string };
    roles?:     any;
    points?:    { [key: string]: string };
    milestone?: any;
}


export interface ValuesDiff {
    status?:           string[];  // [estado_anterior, estado_nuevo]
    kanban_order?:     number[];
    description_diff?: Array<null | string>;
    description_html?: string[];
    attachments?:      any;
    assigned_users?:   string[];
    points?:           Points;
    milestone?:        Array<null | string>;
    sprint_order?:     number[];
}


export interface Points {
    ESTIMATION: string[];
}
