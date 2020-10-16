export const tmpl: Tmpl;
export const each: Each;
export const end: Token<"end">;
export const when: When;
export const unless: Unless;
declare const defaultExports: DefaultExports;
export default defaultExports;

export interface When extends Function {
  (condition: boolean | ((context?: any) => boolean)): Token<"when">;
}

export interface Unless {
  (condition: boolean | ((context?: any) => boolean)): Token<"unless">;
}

export interface DefaultExports {
  tmpl: Tmpl;
  each: Each;
  end: Token<"end">;
}

export interface Tmpl extends Function {
  <TModel>(options: TemplateOptions<TModel>): (
    strings: TemplateStringsArray,
    ...args: any[]
  ) => StaticTemplate<TModel>;
  <TModel = any>(strings: TemplateStringsArray, ...args: any[]): StaticTemplate<
    TModel
  >;
}

export type Enumerable =
  | { [key: string]: any }
  | { [index: number]: any; length: number };

export interface Each extends Function {
  (
    enumerable: Enumerable | ((context?: any) => Enumerable),
    valueProp?: string,
    keyProp?: string
  ): Token<"each">;
  (
    enumerable: Enumerable | ((context?: any) => Enumerable),
    options: EachOptions
  ): Token<"each">;
}

export interface EachOptions {
  key?: string;
  value?: string;
  separator?: any;
}

export interface TemplateOptions<TModel> {}

export type Token<TName> = { __name: "name" };

export interface Context<TModel> {
  model: TModel;
}

export type Renderer<TModel = any> = (
  template: string,
  context?: Context<TModel>
) => any;

export type Model = { [key: string]: any };

export interface DynamicTemplate<TModel extends Model = {}> extends Function {
  readonly model: TModel;
  update(): void;
  update(model: NonNullable<TModel>): void;
}

export interface StaticTemplate<TModel extends Model> extends Function {
  (model: NonNullable<TModel>): string;
  (renderer: Renderer<TModel>): DynamicTemplate<TModel>;
  (renderer: Renderer<TModel>, model: TModel): DynamicTemplate<TModel>;
}
