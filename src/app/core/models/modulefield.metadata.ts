export class ModuleFieldMetaData {
    ModuleId: number;
    EntityId: number;
    fieldId: number;
    FieldName: string;
    FieldType: string;
    FieldLabel: string;
    isAutoincrement?: boolean;
    isPK?: boolean;
    MinSize?: number;
    MaxSize?: number;
    DecimalSize: number;
    ishidden?: boolean;
    IsNull?: boolean;
    DefaultValue: string;
    isMendatory: boolean;
    Sequence: number;
    Section: string;
    isOrgRole?: boolean;
}
